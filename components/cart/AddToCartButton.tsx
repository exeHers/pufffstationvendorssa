'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { useCart } from '@/components/cart/CartContext'

type Props = {
  product: Product
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!product?.id) return
    setIsAdding(true)
    addToCart(product)
    window.setTimeout(() => setIsAdding(false), 350)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isAdding}
      className="rounded-full bg-cyan-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_18px_rgba(6,182,212,0.45)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isAdding ? 'Added.' : 'Add to cart'}
    </button>
  )
}
