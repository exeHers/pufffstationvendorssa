'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

type OrderRow = Record<string, any>

const STATUSES = ['pending_payment', 'paid', 'shipped', 'delivered'] as const

export default function AdminOrdersPage() {
  const adminEmails = useMemo(() => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS), [])
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [newStatus, setNewStatus] = useState<string>('paid')
  const [tracking, setTracking] = useState<string>('')
  const [courier, setCourier] = useState<string>('Courier Guy / PUDO')

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const em = (data.session?.user?.email ?? '').toLowerCase()
      setEmail(em)
      setIsAdmin(Boolean(em && adminEmails.includes(em)))
    })()
  }, [adminEmails])

  async function fetchOrders() {
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
      const res = await fetch(`/api/admin/orders${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to load orders')
      setOrders(json.orders ?? [])
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, statusFilter])

  function openOrder(o: OrderRow) {
    setSelected(o)
    setNewStatus(o.status ?? 'paid')
    setTracking(o.tracking_number ?? '')
    setCourier(o.courier_name ?? 'Courier Guy / PUDO')
    setErr(null)
    setOk(null)
  }

  async function updateOrder() {
    if (!selected?.id) return
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selected.id,
          status: newStatus,
          tracking_number: tracking,
          courier_name: courier,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Update failed')

      setOk('Order updated ✅')
      setSelected(json.order)
      await fetchOrders()
    } catch (e: any) {
      setErr(e?.message ?? 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-slate-800 bg-black/50 p-6">
          <h1 className="text-2xl font-bold">Admin – Orders</h1>
          <p className="mt-2 text-sm text-slate-300">Access denied.</p>
          <p className="mt-2 text-xs text-slate-400">Signed in as: {email || '—'}</p>
          <div className="mt-6">
            <Link href="/admin" className="underline text-violet-400">Back to dashboard</Link>
          </div>
        </div>
      </main>
    )
  }
 
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight uppercase">Order Stream</h1>
          <p className="mt-1 text-sm text-slate-300">Update status + tracking (emails later via Resend).</p>
        </div>
        <Link href="/admin" className="w-full rounded-full border border-slate-700 px-4 py-2 text-center text-sm sm:w-auto">Back</Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm sm:w-auto"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={fetchOrders}
          className="w-full rounded-full border border-slate-700 px-4 py-2 text-sm sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}
      {ok && (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6">
          <h2 className="text-lg font-bold">All orders ({orders.length})</h2>

          <div className="mt-4 space-y-3">
            {orders.length === 0 && <p className="text-sm text-slate-400">No orders yet.</p>}
            {orders.slice(0, 60).map((o) => (
              <button
                key={o.id}
                onClick={() => openOrder(o)}
                className="w-full text-left rounded-2xl border border-white/[0.05] bg-slate-950/40 p-4 hover:border-violet-500/40 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold">{o.full_name ?? o.email ?? o.id}</p>
                  <span className="text-xs text-slate-400">{o.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Total: {o.currency ?? 'ZAR'} {Number(o.total_amount ?? 0).toFixed(2)} • {o.city ?? ''} {o.province ?? ''}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6">
          <h2 className="text-lg font-bold">Update selected order</h2>

          {!selected ? (
            <p className="mt-4 text-sm text-slate-400">Select an order on the left.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold">{selected.full_name ?? selected.email}</p>
                <p className="mt-1 break-words text-xs text-slate-400">
                  {selected.address_line_1 ?? ''} {selected.suburb ?? ''} {selected.city ?? ''} {selected.province ?? ''} {selected.postal_code ?? ''}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Delivery: {selected.delivery_type ?? ''} • PUDO: {selected.pudo_location ?? '—'}
                </p>
              </div>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Status</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Courier name</span>
                <input
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Tracking number (required for shipped/delivered)</span>
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                  placeholder="e.g. PUDO123456"
                />
              </label>

              <button
                onClick={updateOrder}
                disabled={loading}
                className="rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
