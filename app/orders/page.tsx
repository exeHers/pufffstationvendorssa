'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type OrderRow = {
  id: string
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

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [userEmail, setUserEmail] = useState<string>('')

  const statusLabel = useMemo(() => {
    return (s?: string | null) => {
      const v = (s ?? '').toLowerCase()
      if (!v) return 'Unknown'
      if (v.includes('pending_payment')) return 'Pending payment'
      if (v.includes('paid')) return 'Paid (processing)'
      if (v === 'shipped') return 'Shipped'
      if (v === 'delivered') return 'Delivered'
      if (v.includes('failed')) return 'Payment failed'
      if (v === 'cancelled') return 'Cancelled'
      return s ?? 'Unknown'
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      setError(null)

      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/orders')
        return
      }
      setUserEmail(user.email ?? '')

      // Fetch orders for the logged-in user. Your RLS should enforce this too.
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!mounted) return

      if (err) {
        setError(err.message)
        setOrders([])
      } else {
        setOrders((data ?? []) as OrderRow[])
      }

      setLoading(false)
    }

    run()
    return () => {
      mounted = false
    }
  }, [router])

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            ORDERS
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            My Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Logged in as <span className="font-semibold text-slate-100">{userEmail || '...'}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/shop"
            className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition"
          >
            Shop
          </Link>
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

      {loading && (
        <section className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded-full bg-slate-800/80" />
                  <div className="h-3 w-40 rounded-full bg-slate-800/80" />
                  <div className="h-4 w-28 rounded-full bg-slate-800/80" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-12 rounded-full bg-slate-800/80" />
                  <div className="h-5 w-24 rounded-full bg-slate-800/80" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="h-20 rounded-2xl bg-slate-800/60" />
                <div className="h-20 rounded-2xl bg-slate-800/60" />
              </div>
            </div>
          ))}
        </section>
      )}

      {error && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
          <p className="mt-2 text-[11px] text-red-200/80">
            This usually means your Supabase RLS/policies aren&apos;t set yet.
          </p>
        </section>
      )}

      {!loading && !error && orders.length === 0 && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <p className="text-sm font-semibold text-slate-100">No orders yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            When you checkout and pay, your order will show here with tracking updates.
          </p>
        </section>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="space-y-3">
          {orders.map((o) => (
            <article
              key={o.id}
              className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Order ID
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-200 break-all">{o.id}</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {statusLabel(o.status)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Placed: {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-white">
                    {(o.currency ?? 'ZAR') === 'ZAR' ? 'R ' : ''}
                    {(o.total_amount ?? 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Delivery: {o.delivery_type ? o.delivery_type.toUpperCase() : '—'}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Delivery details
                  </p>
                  <p className="mt-1 text-xs text-slate-200 whitespace-pre-line">
                    {o.delivery_address || o.delivery_location || '—'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Tracking
                  </p>
                  <p className="mt-1 text-xs text-slate-200">
                    Courier: {o.courier_name || 'Courier Guy / PUDO'}
                  </p>
                  <p className="mt-1 text-xs text-slate-200 break-all">
                    Tracking #: {o.tracking_number || '—'}
                  </p>
                  {o.tracking_url && (
                    <a
                      href={o.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200"
                    >
                      Open tracking →
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
