'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import FeaturedDropsSettings from '@/components/admin/FeaturedDropsSettings'

export default function FeaturedDropsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  async function refreshData() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('name')
    
    setProducts((data || []))
    setFeaturedProducts((data || []).filter((p) => p.is_featured))
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  async function toggleFeatured(p: Product) {
    setBusy(true)
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !(p as any).is_featured })
      .eq('id', p.id)
    
    if (error) alert(error.message)
    await refreshData()
    setBusy(false)
  }

  if (loading) return <div className="p-10 text-white">Loading drops...</div>

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 text-white">
      <header className="mb-10 flex items-center justify-between border-b border-white/[0.05] pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight uppercase">Featured Drops</h1>
          <p className="mt-1 text-sm text-slate-400">Choose which products highlight the shop home.</p>
        </div>
        <Link href="/admin" className="rounded-full border border-white/[0.1] bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
          Back
        </Link>
      </header>
 
      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="lg:col-span-2">
          <FeaturedDropsSettings />
        </div>
        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Stream</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleFeatured(p)}
                disabled={busy}
                className={`flex items-center gap-4 rounded-3xl border p-4 transition-all duration-300 ${
                  p.is_featured
                    ? 'border-cyan-500/30 bg-cyan-500/10 shadow-lg'
                    : 'border-white/[0.03] bg-slate-900/40 hover:border-white/[0.08]'
                }`}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/[0.05]">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-900/40" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{p.category}</p>
                </div>
                {p.is_featured && <span className="ml-auto text-cyan-400 text-xs font-bold">*</span>}
              </button>
            ))}
          </div>
        </section>
 
        <aside className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Mockup</h2>
          <div className="sticky top-10 space-y-6">
            <AnimatePresence mode="popLayout">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-slate-950 shadow-2xl"
                  >
                     <div className="bg-slate-900/60 p-2 text-center text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 border-b border-white/[0.05]">
                      Spotlight Component
                    </div>
                    <div className="p-6 bg-slate-900/20">
                       <div className="flex items-center gap-6">
                          <div className="h-32 w-24 bg-black/40 rounded-xl overflow-hidden border border-white/[0.05] flex-shrink-0">
                             {p.image_url ? (
                               <img src={p.image_url} alt="" className="h-full w-full object-contain" />
                             ) : (
                               <div className="h-full w-full bg-slate-900/40" />
                             )}
                          </div>
                          <div>
                             <h3 className="font-black text-xl text-white uppercase tracking-tighter">{p.name}</h3>
                             <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">{p.description || 'No description provided.'}</p>
                             <div className="mt-4 inline-block px-4 py-1.5 bg-cyan-600 text-[10px] font-black uppercase tracking-widest text-white rounded-full">
                               R {Number(p.price).toFixed(2)}
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[2.5rem] border border-dashed border-white/[0.05] p-20 text-center">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No spotlight items selected.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </main>
  )
}

