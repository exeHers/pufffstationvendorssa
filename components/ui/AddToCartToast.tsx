'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/cart/CartContext'
import { ShoppingBag, Check } from 'lucide-react'
import Link from 'next/link'

export default function AddToCartToast() {
  const { lastAddedItem, clearLastAdded } = useCart()

  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => {
        clearLastAdded()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [lastAddedItem, clearLastAdded])

  return (
    <AnimatePresence>
      {lastAddedItem && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
          className="fixed bottom-8 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-xs overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
              <ShoppingBag size={20} />
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-widest">
                <Check size={12} />
                Added to Cart
              </div>
              <p className="mt-0.5 truncate text-sm font-bold text-white uppercase tracking-tight">
                {lastAddedItem.name}
              </p>
            </div>

            <Link
              href="/cart"
              onClick={clearLastAdded}
              className="rounded-full bg-violet-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-violet-500"
            >
              View
            </Link>
          </div>
          
          {/* Progress bar timer */}
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 w-full bg-violet-500 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
