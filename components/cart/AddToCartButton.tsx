'use client'

import type { Product } from '@/lib/types'
import { useCart } from './CartProvider'
import { useState } from 'react'

type Props = {
  product: Product
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleClick() {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white active:scale-95"
    >
      {added ? 'Added' : 'Add to cart'}
    </button>
  )
}