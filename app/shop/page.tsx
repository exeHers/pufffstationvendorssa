import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'

export default async function ShopPage() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const products = (data ?? []) as Product[]

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            SHOP · DISPOSABLES & FLAVOURS
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Available Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Browse the stash, pick your poison, add to cart. Simple.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition"
          >
            Home
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition"
          >
            Cart
          </Link>
        </div>
      </header>

      {error && (
        <section className="rounded-3xl border border-red-500/30 bg-red-950/20 p-5 text-sm text-red-200">
          Eish… the shop isn’t loading right now. Try refresh, or check Supabase is online.
        </section>
      )}

      {!error && products.length === 0 && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-300">
          No stock yet, boss. Add products in the admin panel first.
        </section>
      )}

      {products.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const priceNumber =
              product.price !== null && product.price !== undefined
                ? Number(product.price)
                : 0

            const hasPrice =
              product.price !== null &&
              product.price !== undefined &&
              !Number.isNaN(priceNumber)

            return (
              <article
                key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900/90 shadow-[0_18px_45px_rgba(0,0,0,0.65)] transition duration-200 hover:-translate-y-1.5 hover:border-purple-400/70 hover:shadow-[0_24px_60px_rgba(109,40,217,0.55)]"
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="relative h-40 w-full overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                        No image
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-100" />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="space-y-1">
                    <Link href={`/shop/${product.id}`} className="block">
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-50 hover:text-white">
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

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>
                      {product.in_stock ? (
                        <span className="text-emerald-300">In stock</span>
                      ) : (
                        <span className="text-red-300">Out of stock</span>
                      )}
                    </span>
                    <Link
                      href={`/shop/${product.id}`}
                      className="font-semibold text-[#D946EF] hover:text-[#F9A8FF] transition"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
