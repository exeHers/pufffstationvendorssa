'use client'

import type { Product } from '@/lib/types'
import { useCart } from './CartProvider'

type Props = {
  product: Product
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()

  const handleClick = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-slate-600 bg-slate-900/70 px-4 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-purple-400 hover:bg-slate-800/90 active:scale-95"
    >
      Add to cart
    </button>
  )
}