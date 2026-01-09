import Image from 'next/image'
import Link from 'next/link'
import { supabase, supabaseEnvReady } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import FlavourPicker from '@/components/home/FlavourPicker'
import { fetchActiveFlavours } from '@/lib/flavours'

export const dynamic = 'force-dynamic'

function formatMoney(n: number) {
  return `R${Number(n).toFixed(2)}`
}

function clampText(input: string, max: number) {
  const s = (input || '').trim()
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max)}...` : s
}

function getCategory(product: Product) {
  const p: any = product
  const value = (p.category || '').toString().trim()
  return value || 'Disposable'
}

export default async function HomePage() {
  const flavours = await fetchActiveFlavours()
  const products: Product[] = []
  if (supabaseEnvReady) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(6)
    products.push(...(((data as Product[]) || []) as Product[]))
  }
  const inStock = products.filter((p: any) => p.in_stock !== false)
  const featured = (inStock.length ? inStock : products).slice(0, 3)

  return (
    <main className="relative w-full bg-[#05050c] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <video
            className="h-full w-full object-cover object-center opacity-90 blur-[1px]"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/hero/neon-smoke.png"
            aria-hidden="true"
          >
            <source src="/hero/neon-smoke.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/65 to-[#05050c]/98" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050c]/97 via-[#05050c]/75 to-transparent" />
          <div className="absolute inset-0 bg-black/25" />
          <div
            className="absolute inset-0 opacity-55"
            style={{
              background:
                'radial-gradient(900px 420px at 15% 20%, rgba(34,211,238,0.14), transparent 70%),' +
                'radial-gradient(700px 380px at 75% 35%, rgba(217,70,239,0.12), transparent 68%),' +
                'radial-gradient(800px 480px at 65% 80%, rgba(59,130,246,0.10), transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col items-start justify-center gap-12 px-4 pb-16 pt-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="hero-fade hero-fade-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200/80">
              PUFFF Station Vendors SA
            </p>

            <h1 className="hero-fade hero-fade-2 mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="text-white">Clean stock.</span>{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-purple-200 bg-clip-text text-transparent">
                PUFFF Station
              </span>{' '}
              only. No kak stories.
            </h1>

            <p className="hero-fade hero-fade-3 mt-5 max-w-lg text-sm leading-relaxed text-slate-200/85 sm:text-base">
              Fast dispatch, premium checkout, and official PUFFF Station drops. Built
              for SA vendors who want it smooth and legit.
            </p>

            <div className="hero-fade hero-fade-3 mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="cta-pulse rounded-full bg-cyan-400/95 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.45)] transition hover:brightness-110 active:scale-95"
              >
                Shop the Drop
              </Link>

              <Link
                href="/cart"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition hover:border-cyan-200/70 hover:text-cyan-50 active:scale-95"
              >
                View Cart
              </Link>
            </div>

            <p className="hero-fade hero-fade-3 mt-8 text-[11px] text-slate-300/70">
              Local vendors. Clean pulls. No kak stories.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-[0_0_50px_rgba(15,23,42,0.65)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/60" />
              <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent_75%)] bg-black/40" />

              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Signature Perks
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">
                  Luxury-grade drops, curated for SA.
                </h3>

                <div className="mt-5 space-y-3 text-sm text-slate-200/85">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                    Fast dispatch, smooth tracking, zero drama.
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.6)]" />
                    Verified vendors, premium stock only.
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                    Exclusive drops, no shady stories.
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>Premium</span>
                  <span>Fast checkout</span>
                  <span>SA ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12">
        <FlavourPicker flavours={flavours} />
      </section>

      {featured.length > 0 ? (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Featured Drops
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                A tight 3-pack. Premium, loud, ready.
              </h2>
              <p className="max-w-2xl text-sm text-slate-300">
                Three featured flavours only. No grid overload, just the best of the moment.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80 transition hover:text-white sm:mt-0"
            >
              Browse all
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((product) => {
              const p: any = product
              const imageUrl = p.image_url || '/placeholder.png'
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                className="group relative overflow-hidden rounded-[1.8rem] border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-slate-700/70 hover:shadow-[0_0_45px_rgba(34,211,238,0.18)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/70" />

                  <div className="relative">
                    <div className="relative h-44 overflow-hidden rounded-[1.4rem] border border-slate-800/60 bg-black/60">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 90vw, 320px"
                        className="object-contain object-center transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <span>{getCategory(product)}</span>
                      <span className="text-slate-500">
                        {p.in_stock === false ? 'Out' : 'In stock'}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300">
                      {clampText(
                        product.description || 'Smooth pull. Strong flavour. Premium disposable.',
                        90
                      )}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">
                        {formatMoney(Number(product.price))}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </main>
  )
}
