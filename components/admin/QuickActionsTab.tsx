'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function QuickActionsTab() {
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

      alert(`Restored stock for ${outOfStock.length} products!`)
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform duration-500">📊</div>
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Real-time Metrics</h3>
        <div className="space-y-4 relative">
           <div className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-slate-900 group-hover:border-slate-800 transition-colors">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Active Inventory</span>
                <span className="text-xs font-bold text-slate-300">Skus Online</span>
              </div>
              <span className="text-2xl text-fuchsia-500 font-black tracking-tighter">{stats.products}</span>
           </div>
           <div className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-slate-900 group-hover:border-slate-800 transition-colors">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Global Sales</span>
                <span className="text-xs font-bold text-slate-300">Total Records</span>
              </div>
              <span className="text-2xl text-cyan-400 font-black tracking-tighter">{stats.orders}</span>
           </div>
           <div className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-slate-900 group-hover:border-slate-800 transition-colors">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Queue</span>
                <span className="text-xs font-bold text-slate-300">Pending Pulse</span>
              </div>
              <span className={`text-2xl font-black tracking-tighter ${stats.reviews > 0 ? 'text-amber-400' : 'text-slate-700'}`}>{stats.reviews}</span>
           </div>
        </div>
      </motion.div>

      {/* Operations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform duration-500">⚙️</div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Global Ops</h3>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tight mb-8">Hardware-level store control</p>
        </div>
        <div className="grid gap-4 relative">
           <Link href="/admin/products" className="group/btn w-full relative overflow-hidden rounded-2xl border border-slate-800 bg-black/60 p-4 transition-all hover:border-white">
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Direct Injection</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Rapid Product Entry</span>
                </div>
                <span className="text-xl group-hover/btn:translate-x-1 transition-transform">🚀</span>
              </div>
           </Link>

           <button
             onClick={handleBulkStockToggle}
             disabled={busy}
             className="group/btn w-full relative overflow-hidden rounded-2xl border border-slate-800 bg-black/60 p-4 transition-all hover:border-fuchsia-500/50 disabled:opacity-30"
           >
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-fuchsia-400 tracking-widest">
                    {busy ? 'SYNCHRONIZING...' : 'Mass Restock'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Reset all in-stock flags</span>
                </div>
                <span className="text-xl group-hover/btn:rotate-12 transition-transform">⚡</span>
              </div>
           </button>
        </div>
      </motion.div>

      {/* Customer Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform duration-500">📡</div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Communication</h3>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tight mb-8">Interlink with users</p>
        </div>
        <div className="grid gap-4 relative">
           <Link href="/admin/support" className="group/btn w-full relative overflow-hidden rounded-2xl bg-white p-4 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-black tracking-widest">Support Terminal</span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase">Active Tickets</span>
                </div>
                <span className="text-xl">✉️</span>
              </div>
           </Link>
           
           <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
             <p className="text-[9px] text-slate-500 font-bold uppercase italic">
               System Health: <span className="text-emerald-500">Nominal</span>
             </p>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
