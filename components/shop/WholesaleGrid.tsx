'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartContext'
import type { Product } from '@/lib/types'
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react'

export default function WholesaleGrid({ products }: { products: Product[] }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [adding, setAdding] = useState(false)

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [id]: next }
    })
  }

  const handleInputChange = (id: string, val: string) => {
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 0) {
      setQuantities((prev) => ({ ...prev, [id]: num }))
    }
  }

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = products.reduce((sum, p) => sum + Number(p.price) * (quantities[p.id] || 0), 0)

  const handleAddAll = async () => {
    setAdding(true)
    for (const p of products) {
      const qty = quantities[p.id] || 0
      if (qty > 0) addToCart(p, qty)
    }
    router.push('/cart')
    setAdding(false)
  }

  return (
    <div className="relative pb-32">
      <div className="grid gap-4">
        <div className="hidden grid-cols-[80px_2fr_1fr_1fr_150px] gap-4 rounded-xl border border-white/5 bg-slate-900/40 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 md:grid">
          <div>Image</div>
          <div>Product</div>
          <div>Stock</div>
          <div>Price</div>
          <div className="text-center">Order Qty</div>
        </div>

        {products.map((p) => {
          const qty = quantities[p.id] || 0
          const isActive = qty > 0
          const inStock = (p as any).in_stock !== false

          return (
            <div
              key={p.id}
              className={`group relative grid grid-cols-[80px_1fr] items-center gap-x-4 gap-y-2 rounded-2xl border p-4 transition-all duration-300 md:grid-cols-[80px_2fr_1fr_1fr_150px] ${
                isActive
                  ? 'border-cyan-500/50 bg-slate-900/80 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                  : 'border-white/5 bg-slate-950/40 hover:border-white/10'
              }`}
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/5 bg-black md:h-20 md:w-20">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-700">
                    <AlertCircle size={16} />
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-1">
                <h3 className="text-sm font-bold text-white transition-colors group-hover:text-cyan-200">{p.name}</h3>
                <p className="line-clamp-1 text-[10px] text-slate-500 md:hidden">
                  {(p as any).category || 'Vape'} | R{Number(p.price).toFixed(2)}
                </p>
                {isActive ? <p className="mt-1 hidden text-[10px] text-cyan-300 md:block">{qty} in order</p> : null}
              </div>

              <div className="hidden items-center md:flex">
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Out
                  </span>
                )}
              </div>

              <div className="hidden font-bold text-slate-200 md:block">R {Number(p.price).toFixed(2)}</div>

              <div className={`col-span-2 flex items-center justify-between gap-2 md:col-span-1 md:justify-center ${!inStock ? 'pointer-events-none opacity-50' : ''}`}>
                <button
                  onClick={() => updateQty(p.id, -1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-slate-500 hover:text-white"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="number"
                  min="0"
                  value={qty || ''}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  placeholder="0"
                  className="h-10 w-16 rounded-xl border border-slate-700 bg-slate-950 text-center font-bold text-white outline-none focus:border-cyan-500"
                />

                <button
                  onClick={() => updateQty(p.id, 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-slate-500 hover:text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-500 ${totalItems > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 rounded-3xl border border-cyan-500/25 bg-slate-900/90 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Total Items</span>
              <span className="text-xl font-black text-white">{totalItems}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Total Value</span>
              <span className="text-xl font-black text-cyan-200">R {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleAddAll}
            disabled={adding}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 font-bold uppercase tracking-widest text-white shadow-lg shadow-cyan-600/25 transition-all hover:scale-105 hover:bg-cyan-500 active:scale-95 sm:w-auto"
          >
            {adding ? (
              'Processing...'
            ) : (
              <>
                Add to Cart
                <ShoppingCart size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
