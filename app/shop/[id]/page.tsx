import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    notFound()
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const product = data as Product

  const priceNumber =
    product.price !== null && product.price !== undefined ? Number(product.price) : 0

  const hasPrice =
    product.price !== null && product.price !== undefined && !Number.isNaN(priceNumber)

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            SHOP · PRODUCT
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {product.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Check the details properly, my bru — no surprises.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition"
          >
            Back to Shop
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition"
          >
            View Cart
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
          <div className="relative aspect-[16/10] w-full bg-slate-900/60">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                No image yet
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-200">
              {hasPrice ? `R ${priceNumber.toFixed(2)}` : 'Price on request'}
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              {product.in_stock ? (
                <span className="text-emerald-300">In stock</span>
              ) : (
                <span className="text-red-300">Out of stock</span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {!product.description && (
            <p className="mt-3 text-sm text-slate-400">
              No description yet — but it’s a lekker one, trust.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} />
            <Link
              href="/shop"
              className="rounded-full border border-slate-700 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition"
            >
              Keep Browsing
            </Link>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-200">Heads up:</p>
            <ul className="mt-2 space-y-1">
              <li>• Stock updates live, so what you see is what’s actually there.</li>
              <li>• If you’re unsure, rather message support before ordering.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
