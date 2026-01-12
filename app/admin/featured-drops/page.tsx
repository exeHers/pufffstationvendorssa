'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'

export default function FeaturedDropsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    refreshData()
  }, [])

  async function refreshData() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('name')
    
    setProducts((data || []) as any)
    setFeaturedProducts((data || []).filter((p: any) => p.is_featured) as any)
    setLoading(false)
  }

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
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-400">Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Featured Drops</h1>
          <p className="mt-1 text-sm text-slate-300">Choose which products highlight the shop home.</p>
        </div>
        <Link href="/admin" className="rounded-full border border-slate-700 bg-black/40 px-4 py-2 text-sm hover:border-slate-500">
          Back
        </Link>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-400">All Products</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((p: any) => (
              <button
                key={p.id}
                onClick={() => toggleFeatured(p)}
                disabled={busy}
                className={`flex items-center gap-4 rounded-3xl border p-4 transition ${
                  p.is_featured 
                    ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(217,70,239,0.2)]' 
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'
                }`}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-black/40">
                  {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.category}</p>
                </div>
                {p.is_featured && <span className="ml-auto text-fuchsia-400 text-xs font-bold">★</span>}
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-400">Live Preview</h2>
          <div className="sticky top-10 space-y-6">
            <AnimatePresence mode="popLayout">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="overflow-hidden rounded-[2.5rem] border border-slate-800 shadow-2xl"
                  >
                     <div className="bg-slate-900/40 p-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-400 border-b border-slate-800">
                      Primary Display
                    </div>
                    <div className="p-4 bg-black">
                       <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest mb-4 italic">Live Hero Section Mockup</p>
                       <div className="flex items-center gap-6">
                          <div className="h-32 w-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0">
                             {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-contain" />}
                          </div>
                          <div>
                             <h3 className="font-black text-xl text-white uppercase">{p.name}</h3>
                             <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                             <div className="mt-3 inline-block px-3 py-1 bg-fuchsia-500 text-[10px] font-bold rounded-full">R {Number(p.price).toFixed(2)}</div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-800 p-20 text-center text-slate-500">
                  No featured drops.
                </div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </main>
  )
}
