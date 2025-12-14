'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type OrderRow = {
  id: string
  user_id?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  status?: string | null
  total_amount?: number | null
  currency?: string | null
  delivery_type?: string | null
  delivery_location?: string | null
  delivery_address?: string | null
  courier_name?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  created_at?: string | null
}

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [filter, setFilter] = useState<string>('paid_pending_processing')
  const [adminEmail, setAdminEmail] = useState<string>('')

  const adminEmails = useMemo(() => {
    return parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  }, [])

  const isAdmin = useMemo(() => {
    if (!adminEmail) return false
    if (adminEmails.length === 0) return false
    return adminEmails.includes(adminEmail.toLowerCase())
  }, [adminEmail, adminEmails])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/admin/orders')
        return
      }
      setAdminEmail(user.email ?? '')
      if (!parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS).includes((user.email ?? '').toLowerCase())) {
        setError('Access denied. Add your admin email to NEXT_PUBLIC_ADMIN_EMAILS in .env.local')
        setOrders([])
        setLoading(false)
        return
      }

      let q = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200)
      if (filter && filter !== 'all') q = q.eq('status', filter)
      const { data, error: err } = await q
      if (err) throw err
      setOrders((data ?? []) as OrderRow[])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function markShipped(orderId: string, courierName: string, trackingNumber: string, trackingUrl?: string) {
    setError(null)
    try {
      const payload: any = {
        status: 'shipped',
        courier_name: courierName || 'Courier Guy / PUDO',
        tracking_number: trackingNumber,
        tracking_url: trackingUrl || null,
      }
      const { error: err } = await supabase.from('orders').update(payload).eq('id', orderId)
      if (err) throw err

      // trigger email (shipped)
      await fetch('/api/email/order-update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, event: 'shipped' }),
      }).catch(() => null)

      await loadOrders()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to mark shipped.')
    }
  }

  async function markDelivered(orderId: string) {
    setError(null)
    try {
      const { error: err } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId)
      if (err) throw err

      await fetch('/api/email/order-update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, event: 'delivered' }),
      }).catch(() => null)

      await loadOrders()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to mark delivered.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">ADMIN</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Orders dashboard</h1>
          <p className="mt-1 text-xs text-slate-300">Signed in as <span className="font-semibold text-slate-100">{adminEmail || '...'}</span></p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition">Shop</Link>
          <Link href="/orders" className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition">Customer view</Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/')
            }}
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-red-400 hover:text-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {!isAdmin && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Access denied.'}
          <p className="mt-2 text-[11px] text-red-200/80">
            Fix: set <span className="font-mono">NEXT_PUBLIC_ADMIN_EMAILS</span> (comma separated) in <span className="font-mono">.env.local</span>.
          </p>
        </section>
      )}

      {isAdmin && (
        <>
          <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Filter</span>
              {[
                { key: 'paid_pending_processing', label: 'Paid (processing)' },
                { key: 'pending_payment', label: 'Pending payment' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'all', label: 'All' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
                    filter === f.key
                      ? 'bg-fuchsia-500 text-white shadow-[0_0_22px_rgba(217,70,239,0.85)]'
                      : 'border border-slate-800 bg-slate-950/40 text-slate-200 hover:border-fuchsia-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={loadOrders}
                className="ml-auto rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition"
              >
                Refresh
              </button>
            </div>
          </section>

          {error && (
            <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">{error}</section>
          )}

          {loading && (
            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-200">Loading…</section>
          )}

          {!loading && orders.length === 0 && (
            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
              <p className="text-sm font-semibold text-slate-100">No orders found.</p>
            </section>
          )}

          {!loading && orders.length > 0 && (
            <section className="space-y-3">
              {orders.map((o) => (
                <AdminOrderCard key={o.id} order={o} onShip={markShipped} onDeliver={markDelivered} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  )
}

function AdminOrderCard({
  order,
  onShip,
  onDeliver,
}: {
  order: OrderRow
  onShip: (orderId: string, courierName: string, trackingNumber: string, trackingUrl?: string) => Promise<void>
  onDeliver: (orderId: string) => Promise<void>
}) {
  const [courierName, setCourierName] = useState(order.courier_name || 'Courier Guy / PUDO')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '')
  const [busy, setBusy] = useState(false)

  const canShip = (order.status ?? '') === 'paid_pending_processing'
  const canDeliver = (order.status ?? '') === 'shipped'

  return (
    <article className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.8)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Order</p>
          <p className="mt-1 font-mono text-xs text-slate-200 break-all">{order.id}</p>
          <p className="mt-2 text-sm font-semibold text-white">Status: {(order.status || '—').toUpperCase()}</p>
          <p className="mt-1 text-xs text-slate-400">Placed: {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Total</p>
          <p className="mt-1 text-lg font-extrabold text-white">R {(order.total_amount ?? 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400">Customer: {order.customer_name || '—'}</p>
          <p className="mt-1 text-xs text-slate-400 break-all">{order.customer_email || '—'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery</p>
          <p className="mt-1 text-xs text-slate-200 whitespace-pre-line">{order.delivery_address || order.delivery_location || '—'}</p>
          <p className="mt-2 text-xs text-slate-400">Type: {(order.delivery_type || '—').toUpperCase()}</p>
          <p className="mt-1 text-xs text-slate-400">Phone: {order.customer_phone || '—'}</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Shipping + tracking</p>

          <div className="mt-3 grid gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Courier</span>
              <input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Tracking number</span>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Tracking URL (optional)</span>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !canShip || !trackingNumber.trim()}
              onClick={async () => {
                setBusy(true)
                await onShip(order.id, courierName, trackingNumber.trim(), trackingUrl.trim() || undefined)
                setBusy(false)
              }}
              className="rounded-full bg-fuchsia-500 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_22px_rgba(217,70,239,0.85)] disabled:opacity-50"
            >
              Mark shipped
            </button>
            <button
              type="button"
              disabled={busy || !canDeliver}
              onClick={async () => {
                setBusy(true)
                await onDeliver(order.id)
                setBusy(false)
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-emerald-400 hover:text-emerald-200 disabled:opacity-50"
            >
              Mark delivered
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Note: Emails send automatically when you mark shipped/delivered.
          </p>
        </div>
      </div>
    </article>
  )
}
