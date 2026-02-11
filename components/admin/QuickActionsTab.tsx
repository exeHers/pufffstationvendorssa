'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function QuickActionsTab({ onOpenQuickAdd }: { onOpenQuickAdd: () => void }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, reviews: 0 })
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const sb = supabaseBrowser()
      const [p, o, r] = await Promise.all([
        sb.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        sb.from('orders').select('*', { count: 'exact', head: true }),
        sb.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false)
      ])
      setStats({ products: p.count || 0, orders: o.count || 0, reviews: r.count || 0 })
    } catch (e) {
      console.error('Stats Error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  async function handleBulkStockToggle() {
    setBusy(true)
    try {
      const sb = supabaseBrowser()

      const { data: outOfStock, error: fetchErr } = await sb
        .from('products')
        .select('id')
        .eq('in_stock', false)
        .eq('is_deleted', false)

      if (fetchErr) throw fetchErr

      if (!outOfStock || outOfStock.length === 0) {
        alert('All products are already marked as in stock.')
        return
      }

      const { error: updateErr } = await sb
        .from('products')
        .update({ in_stock: true, updated_at: new Date().toISOString() })
        .eq('in_stock', false)
        .eq('is_deleted', false)

      if (updateErr) throw updateErr

      alert(`Restored stock for ${outOfStock.length} products.`)
      loadStats()
    } catch (e: any) {
      alert(e.message || 'Bulk update failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
    </div>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Quick Operations</h3>
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tight">High-frequency admin tasks</p>
          </div>
          <button
            onClick={loadStats}
            className="rounded-full border border-slate-800 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={onOpenQuickAdd}
            className="rounded-2xl border border-slate-800 bg-black/60 p-4 text-left transition hover:border-white"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Add Product</p>
            <p className="mt-2 text-[10px] text-slate-500">Quick entry form</p>
          </button>

          <button
            onClick={handleBulkStockToggle}
            disabled={busy}
            className="rounded-2xl border border-slate-800 bg-black/60 p-4 text-left transition hover:border-cyan-500/50 disabled:opacity-30"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              {busy ? 'Syncing...' : 'Restore Stock'}
            </p>
            <p className="mt-2 text-[10px] text-slate-500">Reset all in-stock flags</p>
          </button>

          <Link
            href="/admin/orders"
            className="rounded-2xl border border-slate-800 bg-black/60 p-4 text-left transition hover:border-cyan-500/50"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Open Orders</p>
            <p className="mt-2 text-[10px] text-slate-500">Update delivery and tracking</p>
          </Link>

          <Link
            href="/admin/support"
            className="rounded-2xl border border-slate-800 bg-black/60 p-4 text-left transition hover:border-cyan-500/50"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Support Inbox</p>
            <p className="mt-2 text-[10px] text-slate-500">Reply to customers</p>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 shadow-2xl"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Quick Links</h3>

        <div className="grid gap-3">
          <Link href="/admin/products" className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-300 hover:text-white">
            Products
          </Link>
          <Link href="/admin/featured-drops" className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-300 hover:text-white">
            Featured Home Drops
          </Link>
          <Link href="/admin/categories" className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-300 hover:text-white">
            Categories
          </Link>
          <Link href="/admin/flavours" className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-300 hover:text-white">
            Flavour Tags
          </Link>
          <Link href="/admin/pudo" className="rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-[11px] uppercase tracking-widest text-slate-300 hover:text-white">
            PUDO Lockers
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-900 bg-black/40 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Snapshot</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Products</p>
              <p className="text-sm font-semibold text-white">{stats.products}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Orders</p>
              <p className="text-sm font-semibold text-white">{stats.orders}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Reviews</p>
              <p className="text-sm font-semibold text-white">{stats.reviews}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
