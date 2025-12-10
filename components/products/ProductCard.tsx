'use client'

import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const priceNumber =
    product.price !== null && product.price !== undefined
      ? Number(product.price)
      : 0

  const hasPrice =
    product.price !== null && product.price !== undefined && !Number.isNaN(priceNumber)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-md shadow-black/40 transition hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-900/40">
      {/* Image area */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-50">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-300">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-slate-100">
            {hasPrice ? `R ${priceNumber.toFixed(2)}` : 'Price not set'}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}