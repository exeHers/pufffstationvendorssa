'use client'

import Link from 'next/link'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const priceNumber =
    product.price !== null && product.price !== undefined ? Number(product.price) : 0

  const hasPrice =
    product.price !== null && product.price !== undefined && !Number.isNaN(priceNumber)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900/90 shadow-[0_18px_45px_rgba(0,0,0,0.65)] transition duration-200 hover:-translate-y-1.5 hover:border-slate-600/90">
      {/* Image / top */}
      <Link href={`/shop/${product.id}`} className="relative block h-40 w-full overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-100" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={`/shop/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-50 hover:underline">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="line-clamp-2 text-[11px] text-slate-300/90">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-semibold text-slate-50">
            {hasPrice ? `R ${priceNumber.toFixed(2)}` : 'Price on request'}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}