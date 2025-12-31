import React from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AddToCartButton from '@/components/cart/AddToCartButton'
import type { Product } from '@/lib/types'

type Props = {
  params: Promise<{ id: string }>
}

function hexToHue(hex?: string | null) {
  if (!hex) return null
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0

  let hue = 0
  if (max === r) hue = ((g - b) / d) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4

  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360
  return hue
}

function pickHue(name: string) {
  const n = name.toLowerCase()
  if (n.includes('grape') || n.includes('berry') || n.includes('purple')) return 285
  if (n.includes('mint') || n.includes('ice') || n.includes('cool')) return 190
  if (n.includes('lemon') || n.includes('banana') || n.includes('mango')) return 40
  if (n.includes('watermelon') || n.includes('straw') || n.includes('cherry')) return 350
  if (n.includes('apple') || n.includes('lime') || n.includes('melon')) return 120
  return 210
}

function money(n: any) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 'Price on request'
  return `R ${v.toFixed(2)}`
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

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
  const p: any = product

  const accentHex = (p.accent_hex || '').trim() || null
  const hue = hexToHue(accentHex) ?? pickHue(product.name)
  const accent = accentHex || `hsl(${hue} 95% 60%)`

  const inStock = p.in_stock !== false

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
        {/* Cinematic Preview */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60">
          {/* Smoke video background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.40]"
              style={{
                filter: `hue-rotate(${hue}deg) saturate(1.35) contrast(1.18) brightness(1.05)`,
              }}
            >
              <video
                className="h-full w-full object-cover scale-[1.18]"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/smoke-poster.jpg"
              >
                <source src="/preview.mp4" type="video/mp4" />
              </video>
            </div>

            {/* tint overlay */}
            <div
              className="absolute inset-0 mix-blend-screen opacity-[0.22]"
              style={{ background: accent }}
            />

            {/* luxury vignette + mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/75" />
            <div className="absolute inset-0 [mask-image:radial-gradient(70%_55%_at_50%_40%,black,transparent_70%)] bg-black/45" />
          </div>

          {/* Ambient gradients */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                background:
                  `radial-gradient(900px 420px at 20% 20%, ${accent}55, transparent 60%),` +
                  `radial-gradient(900px 420px at 80% 80%, ${accent}44, transparent 65%)`,
              }}
            />
          </div>

          {/* Stage + Product */}
          <div className="relative flex aspect-[16/10] w-full items-center justify-center p-6">
            {/* pedestal */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36">
              <div
                className="absolute left-1/2 top-14 h-14 w-[70%] -translate-x-1/2 rounded-full blur-3xl opacity-45"
                style={{ background: accent }}
              />
              <div className="absolute left-1/2 top-20 h-10 w-[68%] -translate-x-1/2 rounded-full bg-slate-950/60 blur-2xl" />
              <div className="absolute left-1/2 top-28 h-6 w-[62%] -translate-x-1/2 rounded-full bg-black/60 blur-xl" />
            </div>

            {/* product image */}
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="relative z-10 h-[82%] w-auto select-none object-contain drop-shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
              />
            ) : (
              <div className="relative z-10 flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                No image
              </div>
            )}

            {/* subtle edge ring */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />
          </div>
        </div>

        {/* Details */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-slate-200">
              {(p.category || 'Disposable').toString()}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                inStock
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              }`}
            >
              {inStock ? 'In stock' : 'Out of stock'}
            </span>

            {/* accent tag */}
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-semibold text-slate-950"
              style={{
                borderColor: `${accent}55`,
                background: accent,
              }}
            >
              Flavour vibe
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">{product.name}</h1>

          {product.description ? (
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No description yet — but it’s a lekker unit.</p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold text-white">{money(product.price)}</div>

            <div className={inStock ? '' : 'pointer-events-none opacity-60'}>
              <AddToCartButton product={product} />
            </div>
          </div>

          {/* Bulk */}
          {p.bulk_min && p.bulk_price ? (
            <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Bulk option</p>
              <p className="mt-1 text-xs text-slate-300">
                Bulk price: <span className="font-bold text-white">{money(p.bulk_price)}</span>{' '}
                <span className="text-slate-400">min {p.bulk_min}</span>
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
            <p className="text-[12px] text-slate-300">
              Quick tip: add it to cart, checkout fast, and we’ll sort the drop. No drama, my bru.
            </p>
          </div>

          {/* tiny shipping note placeholder (future) */}
          <div className="mt-4 text-[11px] text-slate-500">
            Shipping calculated by province at checkout. (CareerGuy)
          </div>
        </div>
      </section>
    </main>
  )
}