import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AddToCartButton from '@/components/cart/AddToCartButton'
import type { Product } from '@/lib/types'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <h1 className="text-lg font-semibold text-white">Eish… product not found</h1>
          <p className="mt-2 text-sm text-slate-300">
            That link looks dodgy or the item got removed.
          </p>
          <div className="mt-5">
            <Link
              href="/shop"
              className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-slate-500"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const product = data as Product
  const priceNumber =
    product.price !== null && product.price !== undefined ? Number(product.price) : 0
  const hasPrice =
    product.price !== null && product.price !== undefined && !Number.isNaN(priceNumber)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/shop"
          className="inline-flex rounded-full border border-slate-800/80 bg-slate-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-slate-600"
        >
          ← Back to shop
        </Link>

        <Link
          href="/cart"
          className="inline-flex rounded-full border border-slate-800/80 bg-slate-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-slate-600"
        >
          View cart
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60">
          <div className="relative aspect-[16/10] w-full">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-slate-200">
              Disposable
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                product.in_stock
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              }`}
            >
              {product.in_stock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            {product.name}
          </h1>

          {product.description ? (
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No description yet — but it’s a lekker unit.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold text-white">
              {hasPrice ? `R ${priceNumber.toFixed(2)}` : 'Price on request'}
            </div>

            <div className={product.in_stock ? '' : 'pointer-events-none opacity-60'}>
              <AddToCartButton product={product} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
            <p className="text-[12px] text-slate-300">
              Quick tip: add it to cart, checkout fast, and we’ll sort the drop. No drama, my bru.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}