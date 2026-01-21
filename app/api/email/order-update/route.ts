export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Email provider (recommended): Resend
// Install: npm i resend
// Env:
//  RESEND_API_KEY=...
//  EMAIL_FROM="PUFFF Station <noreply@yourdomain.co.za>"
//  NEXT_PUBLIC_SITE_URL=https://yourdomain.co.za

export async function POST(req: Request) {
  try {
    const { orderId, event } = (await req.json()) as { orderId?: string; event?: 'shipped' | 'delivered' }
    if (!orderId || !event) {
      return NextResponse.json({ error: 'Missing orderId or event' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase server env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      )
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error: orderErr } = await admin.from('orders').select('*').eq('id', orderId).single()
    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 })
    }

    const to = order?.email ?? undefined
    if (!to) {
      return NextResponse.json({ error: 'Order has no customer_email' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const from = process.env.EMAIL_FROM || 'PUFFF Station <noreply@yourdomain.co.za>'
    const subject =
      event === 'shipped'
        ? `Your PUFFF Station order has been shipped`
        : `Your PUFFF Station order has been delivered`

    const html = renderOrderUpdateEmail({
      event,
      orderId,
      customerName: order?.full_name ?? 'Customer',
      total: Number(order?.total_amount ?? 0),
      courier: (order?.courier_name as string | undefined) ?? 'Courier Guy / PUDO',
      trackingNumber: (order?.tracking_number as string | undefined) ?? '',
      trackingUrl: '',
      ordersUrl: `${siteUrl}/orders`,
    })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      // Safe fallback: don't fail the admin action if email isn't set yet.
      console.warn('[email] RESEND_API_KEY missing. Would have sent:', { to, subject })
      return NextResponse.json({ ok: true, skipped: true })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    const result = await resend.emails.send({ from, to, subject, html })

    return NextResponse.json({ ok: true, result })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}

function renderOrderUpdateEmail(args: {
  event: 'shipped' | 'delivered'
  orderId: string
  customerName: string
  total: number
  courier: string
  trackingNumber: string
  trackingUrl: string
  ordersUrl: string
}) {
  const title = args.event === 'shipped' ? 'Order shipped' : 'Order delivered'
  const subtitle =
    args.event === 'shipped'
      ? 'Your parcel is on the move. Tracking details below.'
      : 'Your parcel should be with you now. Thank you for shopping with us.'

  const trackingBlock =
    args.event === 'shipped'
      ? `<p style="margin:12px 0 0;color:#111">Courier: <b>${escapeHtml(args.courier)}</b></p>
         <p style="margin:6px 0 0;color:#111">Tracking number: <b>${escapeHtml(args.trackingNumber || '—')}</b></p>
         ${args.trackingUrl ? `<p style="margin:6px 0 0"><a href="${args.trackingUrl}" style="color:#a21caf">Open tracking</a></p>` : ''}`
      : ''

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; background:#f6f6f7; padding:24px">
    <div style="max-width:640px; margin:0 auto; background:#fff; border-radius:16px; padding:24px; border:1px solid #eee">
      <p style="margin:0; font-size:12px; letter-spacing:.22em; text-transform:uppercase; color:#a21caf; font-weight:700">PUFFF STATION VENDORS</p>
      <h1 style="margin:10px 0 0; font-size:22px; color:#0b0b0f">${title}</h1>
      <p style="margin:8px 0 0; color:#444; font-size:14px">Howzit ${escapeHtml(args.customerName)} — ${subtitle}</p>

      <div style="margin-top:18px; padding:14px 16px; background:#faf5ff; border:1px solid #f3e8ff; border-radius:12px">
        <p style="margin:0; font-size:13px; color:#111">Order ID</p>
        <p style="margin:6px 0 0; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size:12px; color:#111">${escapeHtml(args.orderId)}</p>
        <p style="margin:10px 0 0; font-size:13px; color:#111">Total: <b>R ${args.total.toFixed(2)}</b></p>
        ${trackingBlock}
      </div>

      <p style="margin:18px 0 0; font-size:14px">
        You can view your full order history here: <a href="${args.ordersUrl}" style="color:#a21caf">My orders</a>
      </p>

      <p style="margin:18px 0 0; font-size:12px; color:#666">If you didn’t place this order, reply to this email immediately.</p>
    </div>
  </div>
  `.trim()
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;')
}
