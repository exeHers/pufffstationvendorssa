'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/browser'
import type { Product } from '@/lib/types'

type QuickAddPanelProps = {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function QuickAddPanel({ isOpen, onClose, onRefresh }: QuickAddPanelProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'stock'>('create')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  // Create form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Stock management state
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  async function loadInitialData() {
    const sb = supabaseBrowser()
    const [cats, prods] = await Promise.all([
      sb.from('categories').select('id, name').order('name'),
      sb.from('products').select('*').eq('is_deleted', false).order('created_at', { ascending: false })
    ])
    if (cats.data) setCategories(cats.data)
    if (prods.data) setProducts(prods.data as any)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setOk(null)

    try {
      if (!name || !price || !category) throw new Error('Missing required fields.')

      const sb = supabaseBrowser()
      const { data: sess } = await sb.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('Authentication required.')

      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('price', price)
      fd.append('category', category)
      fd.append('in_stock', 'true')

      // Default UI colors for quick add
      fd.append('accent_hex', '#06b6d4')
      fd.append('smoke_hex_scroll', '#00FFFF')
      fd.append('smoke_hex_preview', '#06b6d4')

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to create.')

      setOk(`"${name}" added successfully.`)
      setName('')
      setPrice('')
      setCategory('')
      loadInitialData()
      if (onRefresh) onRefresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleStock(product: Product) {
    setBusy(true)
    try {
      const sb = supabaseBrowser()
      const nextStock = !(product as any).in_stock
      const { error } = await sb
        .from('products')
        .update({ in_stock: nextStock, updated_at: new Date().toISOString() })
        .eq('id', product.id)

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: nextStock } : p))
      if (onRefresh) onRefresh()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-md border-l border-white/[0.05] bg-slate-950 p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Quick Access</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rapid operational terminal</p>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition">
                <span className="sr-only">Close</span>
                x
              </button>
            </div>

            <div className="flex gap-2 rounded-2xl bg-black/40 p-1 mb-8 border border-white/[0.03]">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'create' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Fast Add
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`flex-1 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'stock' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Stock Fix
              </button>
            </div>

            {activeTab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                {err && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">{err}</div>}
                {ok && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">{ok}</div>}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Product Name</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. PUFFF Max 5000"
                    className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Price (ZAR)</label>
                    <input
                      required
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="280"
                      className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Category</label>
                    <select
                      required
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                    >
                      <option value="" disabled className="bg-slate-950">Pick one</option>
                      {categories.map(c => <option key={c.id} value={c.name} className="bg-slate-950">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                   <button
                     disabled={busy}
                     className="w-full rounded-full bg-cyan-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:bg-cyan-500 transition active:scale-[0.98] disabled:opacity-50"
                   >
                     {busy ? 'INJECTING...' : 'DIRECT INJECTION'}
                   </button>
                   <p className="mt-4 text-[9px] text-center text-slate-500 uppercase font-bold">
                     Note: Product will use default matte theme.
                     <br />
                     Visit Inventory to add images and smoke FX.
                   </p>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter products..."
                  className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                />

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.03] bg-black/20">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{(p as any).category} | R{p.price}</p>
                      </div>
                      <button
                        onClick={() => toggleStock(p)}
                        className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition ${p.in_stock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                      >
                        {p.in_stock ? 'In Stock' : 'Out'}
                      </button>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center py-8 text-xs text-slate-500 italic">No products matched your search.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
