export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function requireEnv(name: string, value?: string) {
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function statusLabel(raw?: string | null) {
  if (!raw) return 'Pending'
  const normalized = raw.toLowerCase()
  if (normalized.includes('pending')) return 'Pending payment'
  if (normalized.includes('paid')) return 'Payment received'
  if (normalized.includes('shipped')) return 'Shipped'
  if (normalized.includes('delivered')) return 'Delivered'
  return raw
}

function formatCurrency(amount?: number | null, currency = 'ZAR') {
  const value = typeof amount === 'number' ? amount : Number(amount ?? 0)
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderConfirmationEmail(args: {
  orderId: string
  customerName: string
  total: number
  currency: string
  createdAt: string
  status: string
  deliverySummary: string
  paymentMethod: string
  items: { name: string; quantity: number; unit: number }[]
  ordersUrl: string
}) {
  const rows = args.items
    .map((item) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(
          item.quantity * item.unit,
          args.currency
        )}</td>
      </tr>
    `)
    .join('')

  return `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#05060a;padding:32px;color:#0b0b0f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;">
        <p style="margin:0;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#0ea5e9;font-weight:700;">PUFFF STATION</p>
        <h1 style="margin:12px 0 0;font-size:24px;">Order received</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">
          Hey ${escapeHtml(args.customerName)}, thanks for checking out. Your order is currently <b>${escapeHtml(
            args.status
          )}</b>.
        </p>

        <div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:16px;padding:16px;">
          <p style="margin:0;font-size:13px;color:#4b5563;">Order ID</p>
          <p style="margin:6px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#111827;">
            ${escapeHtml(args.orderId)}
          </p>
          <p style="margin:12px 0 0;font-size:13px;color:#4b5563;">Placed</p>
          <p style="margin:6px 0 0;font-size:13px;color:#111827;">${new Date(args.createdAt).toLocaleString()}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#4b5563;">Delivery</p>
          <p style="margin:6px 0 0;font-size:13px;color:#111827;white-space:pre-line;">${escapeHtml(
            args.deliverySummary
          )}</p>
          <p style="margin:12px 0 0;font-size:13px;color:#4b5563;">Payment method</p>
          <p style="margin:6px 0 0;font-size:13px;color:#111827;">${escapeHtml(args.paymentMethod)}</p>
        </div>

        <table style="width:100%;margin-top:24px;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th align="left" style="padding:8px 8px;border-bottom:1px solid #111827;text-transform:uppercase;font-size:11px;letter-spacing:.2em;color:#111827;">Item</th>
              <th align="center" style="padding:8px 8px;border-bottom:1px solid #111827;text-transform:uppercase;font-size:11px;letter-spacing:.2em;color:#111827;">Qty</th>
              <th align="right" style="padding:8px 8px;border-bottom:1px solid #111827;text-transform:uppercase;font-size:11px;letter-spacing:.2em;color:#111827;">Total</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="3" style="padding:12px 8px;text-align:center;color:#94a3b8;">Items will appear here once processed.</td></tr>'}</tbody>
        </table>

        <div style="margin-top:16px;text-align:right;font-size:16px;font-weight:700;">
          <span>${formatCurrency(args.total, args.currency)}</span>
        </div>

        <p style="margin:20px 0 0;font-size:13px;color:#4b5563;">
          You can check your order history and future updates here:
          <a href="${args.ordersUrl}" style="color:#0ea5e9;">View my orders</a>
        </p>
      </div>
    </div>
  `.trim()
}

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string }
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
    const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
    const admin = createClient(supabaseUrl, serviceKey)

    const { data: order, error: orderErr } = await admin.from('orders').select('*').eq('id', orderId).single()
    if (orderErr || !order) {
      return NextResponse.json({ error: orderErr?.message || 'Order not found' }, { status: 404 })
    }

    const { data: itemsData, error: itemsErr } = await admin
      .from('order_items')
      .select('quantity,unit_price,products(name)')
      .eq('order_id', orderId)

    if (itemsErr) {
      console.warn('[email][order-confirmation] Failed to load items', itemsErr.message)
    }

    const items = (itemsData ?? []).map((row: any) => ({
      name: row?.products?.name ?? 'Product',
      quantity: row?.quantity ?? 1,
      unit: row?.unit_price ?? 0,
    }))

    const to = order.email ?? undefined
    if (!to) {
      return NextResponse.json({ error: 'Order has no customer email' }, { status: 400 })
    }

    const deliverySummary =
      order.delivery_type === 'pudo'
        ? `Collect from: ${order.pudo_location ?? 'Selected locker'}\nNotes: ${order.delivery_notes ?? 'Locker PIN will be sent via SMS.'}`
        : `${order.address_line1 ?? ''}\n${[order.city, order.province, order.postal_code]
            .filter(Boolean)
            .join(', ')}${order.delivery_notes ? `\nNotes: ${order.delivery_notes}` : ''}`.trim()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const html = renderConfirmationEmail({
      orderId,
      customerName: order.full_name ?? 'Customer',
      total: Number(order.total_amount ?? 0),
      currency: order.currency ?? 'ZAR',
      createdAt: order.created_at,
      status: statusLabel(order.status),
      deliverySummary,
      paymentMethod: order.payment_provider ? order.payment_provider.replace('_', ' ') : 'Manual',
      items,
      ordersUrl: `${siteUrl}/orders`,
    })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn('[email][order-confirmation] RESEND_API_KEY missing. Would have sent receipt to', to)
      return NextResponse.json({ ok: true, skipped: true })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    const from = process.env.EMAIL_FROM || 'PUFFF Station <noreply@pufffstation.co.za>'
    const subject = `Order received • #${orderId.slice(0, 8)}`
    const result = await resend.emails.send({ from, to, subject, html })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('[email][order-confirmation]', error)
    return NextResponse.json({ error: (error as Error).message ?? 'Server error' }, { status: 500 })
  }
}
