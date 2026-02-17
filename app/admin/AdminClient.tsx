'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/browser'
import PulseTab from '@/components/admin/PulseTab'
import QuickActionsTab from '@/components/admin/QuickActionsTab'
import QuickAddPanel from '@/components/admin/QuickAddPanel'
import RegistrationsTab from '@/components/admin/RegistrationsTab'
import WhatsAppSettingsTab from '@/components/admin/WhatsAppSettingsTab'
import SupportBotSettingsTab from '@/components/admin/SupportBotSettingsTab'

export default function AdminClient() {
  const [email, setEmail] = useState<string>('...')

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email)
    })
  }, [])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
             <motion.div
               animate={{
                 scale: [1, 1.2, 1],
                 opacity: [0.5, 1, 0.5]
               }}
               transition={{
                 duration: 2,
                 repeat: Infinity,
                 ease: 'easeInOut'
               }}
               className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"
             />
             <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
               PUFFF Admin Panel
             </p>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Authorized: <span className="text-slate-300 ml-1">{email || '...'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/admin/support"
            className="w-full rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:w-auto"
          >
            Live Support
          </Link>

          <Link
            href="/shop"
            className="w-full rounded-full border border-white/[0.05] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-400 sm:w-auto"
          >
            Live Shop
          </Link>

          <Link
            href="/logout"
            className="w-full rounded-full bg-slate-900 border border-slate-800 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:border-red-400 hover:text-red-200 sm:w-auto"
          >
            Sign Out
          </Link>
        </div>
      </header>

      <Suspense fallback={<div>Loading Tabs...</div>}>
        <AdminTabs />
      </Suspense>
    </main>
  )
}

function AdminTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 rounded-[2rem] border border-slate-800/60 bg-slate-950/40 p-1.5 w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'manage', label: 'Store Settings' },
          { id: 'whatsapp', label: 'WhatsApp Settings' },
          { id: 'bot', label: 'Bot Editor' },
          { id: 'registrations', label: 'Registrations' },
          { id: 'reviews', label: 'Review Display' },
          { id: 'actions', label: 'Quick Operations' },
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`rounded-full px-6 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
               activeTab === tab.id
                 ? 'bg-cyan-600 text-white shadow-lg'
                 : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             {tab.label}
           </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.section
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <DashboardOverview />
          </motion.section>
        )}

        {activeTab === 'bot' && (
          <motion.section
            key="bot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SupportBotSettingsTab />
          </motion.section>
        )}

        {activeTab === 'manage' && (
          <motion.section
            key="manage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminCard title="Products" desc="Manage products and inventory." href="/admin/products" />
              <AdminCard title="Featured Home Drops" desc="Choose home spotlight items." href="/admin/featured-drops" />
              <AdminCard title="Orders" desc="Update delivery and tracking." href="/admin/orders" />
              <AdminCard title="Categories" desc="Manage category labels." href="/admin/categories" />
              <AdminCard title="Flavour Tags" desc="Homepage filter tags." href="/admin/flavours" />
              <AdminCard title="Support Inbox" desc="Customer tickets and replies." href="/admin/support" />
              <AdminCard title="PUDO Lockers" desc="Upload national locker list." href="/admin/pudo" />
            </div>
          </motion.section>
        )}

        {activeTab === 'registrations' && (
          <motion.section
            key="registrations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <RegistrationsTab />
          </motion.section>
        )}

        {activeTab === 'whatsapp' && (
          <motion.section
            key="whatsapp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WhatsAppSettingsTab />
          </motion.section>
        )}

        {activeTab === 'reviews' && (
          <motion.section
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PulseTab />
          </motion.section>
        )}

        {activeTab === 'actions' && (
          <motion.section
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuickActionsTab onOpenQuickAdd={() => setQuickAddOpen(true)} />
          </motion.section>
        )}
      </AnimatePresence>

      <QuickAddPanel
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  )
}

function AdminCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-500/30"
    >
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white transition duration-300 group-hover:text-cyan-400">
            {title}
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-300">
            {desc}
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 transition duration-300 group-hover:border-cyan-500/50 group-hover:text-white">
          Open
          <span className="transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
        </div>
      </div>
    </Link>
  )
}

function formatCurrency(value: number) {
  return `R${value.toFixed(2)}`
}

type TrafficPoint = {
  date: string
  count: number
}

function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    revenue7d: 0,
    pendingReviews: 0,
    outOfStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [traffic, setTraffic] = useState<{
    points: TrafficPoint[]
    total: number
    error?: string
  }>({ points: [], total: 0 })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const sb = supabaseBrowser()
        const since = new Date()
        since.setDate(since.getDate() - 7)
        const trafficSince = new Date()
        trafficSince.setDate(trafficSince.getDate() - 30)

        const [p, o, r, ordersRecent, reviewsRecent, outStock] = await Promise.all([
          sb.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
          sb.from('orders').select('total_amount, created_at'),
          sb.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
          sb.from('orders').select('id, full_name, email, total_amount, status, created_at').order('created_at', { ascending: false }).limit(6),
          sb.from('reviews').select('id, customer_name, rating, created_at, is_approved').order('created_at', { ascending: false }).limit(6),
          sb.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('in_stock', false),
        ])

        const totalRevenue = (o.data || []).reduce((sum: number, row: any) => sum + Number(row.total_amount || 0), 0)
        const revenue7d = (o.data || []).reduce((sum: number, row: any) => {
          const createdAt = row.created_at ? new Date(row.created_at) : null
          if (createdAt && createdAt >= since) return sum + Number(row.total_amount || 0)
          return sum
        }, 0)

        setStats({
          products: p.count || 0,
          orders: (o.data || []).length,
          revenue: totalRevenue,
          revenue7d,
          pendingReviews: r.count || 0,
          outOfStock: outStock.count || 0,
        })

        setRecentOrders(ordersRecent.data || [])
        setRecentReviews(reviewsRecent.data || [])

        const trafficRes = await sb
          .from('site_visits')
          .select('visited_at, count, visits, total')
          .gte('visited_at', trafficSince.toISOString())
          .order('visited_at', { ascending: true })

        if (trafficRes.error) {
          setTraffic({ points: [], total: 0, error: trafficRes.error.message })
        } else {
          const buckets = new Map<string, number>()
          ;(trafficRes.data || []).forEach((row: any) => {
            if (!row?.visited_at) return
            const dayKey = new Date(row.visited_at).toISOString().slice(0, 10)
            const value = Number(row.count ?? row.visits ?? row.total ?? 1) || 0
            buckets.set(dayKey, (buckets.get(dayKey) || 0) + value)
          })
          const points = Array.from(buckets.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([date, count]) => ({ date, count }))
          const total = points.reduce((sum, p) => sum + p.count, 0)
          setTraffic({ points, total })
        }
      } catch (e) {
        console.error('Dashboard stats error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-10 text-sm text-slate-400">
        Loading dashboard...
      </div>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6 lg:col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Revenue (All time)</p>
          <p className="mt-2 text-3xl font-black text-white">{formatCurrency(stats.revenue)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Last 7 days: {formatCurrency(stats.revenue7d)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-full border border-slate-800 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
              Orders: <span className="text-slate-200">{stats.orders}</span>
            </div>
            <div className="rounded-full border border-slate-800 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
              Products: <span className="text-slate-200">{stats.products}</span>
            </div>
            <div className="rounded-full border border-slate-800 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
              Out of stock: <span className="text-slate-200">{stats.outOfStock}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Orders</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.orders}</p>
          <p className="mt-1 text-[11px] text-slate-500">Total records</p>
          <Link href="/admin/orders" className="mt-4 inline-flex text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
            Open orders
          </Link>
        </div>

        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reviews</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.pendingReviews}</p>
          <p className="mt-1 text-[11px] text-slate-500">Pending approvals</p>
          <Link href="/admin?tab=reviews" className="mt-4 inline-flex text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
            Review display
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Site traffic</p>
              <p className="text-xs text-slate-400">Visitors in the last 30 days</p>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Total: <span className="text-slate-200">{traffic.total}</span>
            </div>
          </div>

          {traffic.error ? (
            <div className="mt-6 rounded-2xl border border-slate-900 bg-black/40 p-4 text-xs text-slate-500">
              Traffic data not configured. Add a `site_visits` table with a `visited_at` timestamp column to display
              real visitor counts.
            </div>
          ) : (
            <div className="mt-6">
              <TrafficChart points={traffic.points} />
            </div>
          )}
        </div>

        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Review status</p>
              <p className="text-xs text-slate-400">Latest entries</p>
            </div>
            <Link href="/admin?tab=reviews" className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
              Review display
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-black/40 p-4">
            <p className="text-3xl font-black text-white">{stats.pendingReviews}</p>
            <p className="mt-1 text-[11px] text-slate-500">Reviews waiting for approval</p>
          </div>

          <div className="mt-4 grid gap-3">
            {recentReviews.length === 0 && (
              <div className="text-xs text-slate-500">No reviews yet.</div>
            )}
            {recentReviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-900 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">{r.customer_name || 'Customer'}</p>
                  <p className="text-[10px] text-slate-500">{r.rating}/5</p>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Recent orders</p>
              <p className="text-xs text-slate-400">Last 6 orders</p>
            </div>
            <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
              Open
            </Link>
          </div>

          <div className="grid gap-3">
            {recentOrders.length === 0 && (
              <div className="text-xs text-slate-500">No orders yet.</div>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-900 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{o.full_name || o.email || 'Unknown'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{o.status || 'pending'}</p>
                  </div>
                  <div className="text-sm font-bold text-white">{formatCurrency(Number(o.total_amount || 0))}</div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Operational watchlist</p>
              <p className="text-xs text-slate-400">Immediate tasks</p>
            </div>
            <Link href="/admin?tab=actions" className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
              Quick operations
            </Link>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-900 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Out of stock</p>
              <p className="mt-2 text-2xl font-black text-white">{stats.outOfStock}</p>
              <p className="text-[11px] text-slate-500">Restock priority items</p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Pending reviews</p>
              <p className="mt-2 text-2xl font-black text-white">{stats.pendingReviews}</p>
              <p className="text-[11px] text-slate-500">Approve or hide reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrafficChart({ points }: { points: TrafficPoint[] }) {
  if (!points.length) {
    return (
      <div className="rounded-2xl border border-slate-900 bg-black/40 p-4 text-xs text-slate-500">
        No traffic data yet.
      </div>
    )
  }

  const max = Math.max(...points.map((p) => p.count), 1)
  const width = 300
  const height = 120
  const step = points.length > 1 ? width / (points.length - 1) : width
  const coords = points.map((p, i) => {
    const x = i * step
    const y = height - (p.count / max) * (height - 16) - 8
    return { x, y }
  })
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const fillPath = `${path} L ${width},${height} L 0,${height} Z`

  return (
    <div className="rounded-2xl border border-slate-900 bg-black/40 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#trafficFill)" stroke="none" />
        <path d={path} fill="none" stroke="#22d3ee" strokeWidth="2" />
      </svg>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-slate-500">
        <span>Highest day: {max}</span>
        <span>Total points: {points.length}</span>
      </div>
    </div>
  )
}
