import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  image_url: string | null
  in_stock: boolean | null
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const products = (data ?? []) as Product[]

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.6fr,1.2fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            Local vendor • Trusted • Lekker stock
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            PUFFF Station Vendors
          </h1>

          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Secure your flavour stash and get delivery sorted with no drama.
            Order online, keep track of what’s in stock, and let the plug handle
            the drops. Simple, clean, and built for the locals.
          </p>

          <div className="flex flex-wrap gap-4 pt-1">
            <Link
              href="/shop"
              className="rounded-full bg-[#D946EF] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(217,70,239,0.7)] transition hover:brightness-110 active:scale-95"
            >
              Check the stash
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-slate-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:border-[#D946EF] hover:text-[#D946EF]"
            >
              View my cart
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Free local delivery promos when active. That’s proper.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Secure payments. Your mali is safe, my bru.</span>
            </div>
          </div>
        </div>

        {/* WHY SECTION CARD */}
        <div className="relative rounded-3xl border border-[#D946EF]/30 bg-gradient-to-b from-[#0b0615] to-[#02010a] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.22),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),_transparent_55%)] opacity-80" />
          <div className="relative space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Why PUFFF Station?
            </h2>
            <ul className="space-y-3 text-xs text-slate-300">
              <li>• Quick online ordering for regulars. No more WhatsApp chaos.</li>
              <li>• Clear stock, pricing and product details. No surprise kak.</li>
              <li>• Secure payments so your money doesn’t go missing.</li>
              <li>• You chill. The system keeps orders neat and ready for drop-off.</li>
            </ul>
            <p className="text-[11px] text-slate-500">
              Start by adding your favourite flavours to the cart, then check
              out. We grab the order details instantly so your stash can start
              moving.
            </p>
          </div>
        </div>
      </section>

      {/* LATEST PRODUCTS PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Fresh drops
          </h2>
          <Link
            href="/shop"
            className="text-[11px] font-semibold text-[#D946EF] transition-colors hover:text-[#F9A8FF]"
          >
            See the full stash →
          </Link>
        </div>

        {error && (
          <p className="text-xs text-red-300">
            Eish, loading the fresh drops is giving issues right now. Try the
            full shop page.
          </p>
        )}

        {products.length === 0 && !error && (
          <p className="text-xs text-slate-400">
            Nothing here yet, boss. Stock is still being loaded. Check the shop
            page once items are added.
          </p>
        )}

        {products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {products.map((product) => {
              const priceNumber = Number(product.price) || 0

              return (
                <article
                  key={product.id}
                  className="group flex flex-col rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.75)] transition-all duration-200 hover:border-[#D946EF]/60 hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]"
                >
                  <div className="relative mb-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900/80 text-[10px] text-slate-500">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="uppercase tracking-[0.2em]">
                        PUFFF STATION
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <h3 className="line-clamp-2 text-xs font-bold text-white">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="line-clamp-2 text-[11px] text-slate-400">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white">
                      R {priceNumber.toFixed(2)}
                    </span>
                    <Link
                      href="/shop"
                      className="text-[11px] uppercase tracking-[0.18em] text-[#D946EF] transition-colors hover:text-[#F9A8FF]"
                    >
                      View in shop
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}