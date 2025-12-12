import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'
import Link from 'next/link'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const priceNumber =
    product.price !== null && product.price !== undefined ? Number(product.price) : 0

  const hasPrice =
    product.price !== null &&
    product.price !== undefined &&
    !Number.isNaN(priceNumber)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/50 via-slate-950/80 to-slate-900/30 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition duration-200 hover:-translate-y-1 hover:border-fuchsia-400/60 hover:shadow-[0_0_28px_rgba(217,70,239,0.22)]">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative h-44 w-full overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-950/60 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              No image
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <Link href={`/shop/${product.id}`}>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-50 hover:text-fuchsia-200 transition">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-400">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-base font-extrabold text-slate-50">
            {hasPrice ? `R ${priceNumber.toFixed(2)}` : 'Price on request'}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}