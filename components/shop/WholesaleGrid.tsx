'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartContext'
import type { Product } from '@/lib/types'
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react'

export default function WholesaleGrid({ products }: { products: Product[] }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [adding, setAdding] = useState(false)

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [id]: next }
    })
  }

  const handleInputChange = (id: string, val: string) => {
    const num = parseInt(val)
    if (!isNaN(num) && num >= 0) {
      setQuantities(prev => ({ ...prev, [id]: num }))
    }
  }

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = products.reduce((sum, p) => {
    const qty = quantities[p.id] || 0
    return sum + (Number(p.price) * qty)
  }, 0)

  const handleAddAll = async () => {
    setAdding(true)
    // Add each item with > 0 qty to cart
    for (const p of products) {
      const qty = quantities[p.id] || 0
      if (qty > 0) {
        addItem({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image_url: p.image_url,
          quantity: qty, // Note: cart context usually handles 'add' vs 'set', assuming addItem adds to existing
          category: (p as any).category
        })
      }
    }
    
    // Reset or redirect?
    // Let's redirect to cart for immediate checkout flow
    router.push('/cart')
    setAdding(false)
  }

  return (
    <div className="relative pb-32">
      {/* Filters / Header could go here */}
      
      <div className="grid gap-4">
        {/* Table Header (Hidden on mobile) */}
        <div className="hidden md:grid grid-cols-[80px_2fr_1fr_1fr_150px] gap-4 px-6 py-3 bg-slate-900/40 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
              className={`group relative grid grid-cols-[80px_1fr] md:grid-cols-[80px_2fr_1fr_1fr_150px] gap-x-4 gap-y-2 items-center p-4 rounded-2xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-900/80 border-violet-500/50 shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                  : 'bg-slate-950/40 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Image */}
              <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-black border border-white/5">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <AlertCircle size={16} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {p.name}
                </h3>
                <p className="text-[10px] text-slate-500 line-clamp-1 md:hidden">
                  {(p as any).category || 'Vape'} • R{Number(p.price).toFixed(2)}
                </p>
                {isActive && (
                   <p className="hidden md:block text-[10px] text-violet-400 mt-1">
                     {qty} in order
                   </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="hidden md:flex items-center">
                 {inStock ? (
                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     In Stock
                   </span>
                 ) : (
                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                     <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                     Out
                   </span>
                 )}
              </div>

              {/* Price */}
              <div className="hidden md:block font-bold text-slate-200">
                R {Number(p.price).toFixed(2)}
              </div>

              {/* Qty Controls */}
              <div className={`col-span-2 md:col-span-1 flex items-center justify-between md:justify-center gap-2 ${!inStock ? 'opacity-50 pointer-events-none' : ''}`}>
                 <button 
                   onClick={() => updateQty(p.id, -1)}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                 >
                   <Minus size={16} />
                 </button>
                 
                 <input 
                   type="number"
                   min="0"
                   value={qty || ''}
                   onChange={(e) => handleInputChange(p.id, e.target.value)}
                   placeholder="0"
                   className="w-16 h-10 bg-slate-950 border border-slate-700 rounded-xl text-center text-white font-bold focus:border-violet-500 outline-none"
                 />
                 
                 <button 
                   onClick={() => updateQty(p.id, 1)}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                 >
                   <Plus size={16} />
                 </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky Footer */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 z-50 transition-transform duration-500 ${totalItems > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Total Items</span>
              <span className="text-xl font-black text-white">{totalItems}</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Total Value</span>
              <span className="text-xl font-black text-violet-300">R {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleAddAll}
            disabled={adding}
            className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
          >
            {adding ? 'Processing...' : (
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
