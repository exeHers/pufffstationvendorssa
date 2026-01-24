'use client'

import { useCart } from '@/components/cart/CartContext'

export default function CartBadge() {
  const cart = useCart()

  if (!cart.totalQuantity) return null

  return (
    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-extrabold text-slate-950">
      {cart.totalQuantity}
    </span>
  )
}