export const runtime = 'edge';

import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AddToCartButton from '@/components/cart/AddToCartButton'
import type { Product } from '@/lib/types'
import PreviewSmokeVideo from '@/components/shop/PreviewSmokeVideo'
import ReviewFeed from '@/components/shop/ReviewFeed'

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.name,
    description: product.description || `Premium disposable: ${product.name}. Maximum impact.`,
    openGraph: {
      title: `${product.name} | PUFFF Station Vendors SA`,
      description: product.description || `Premium disposable: ${product.name}. Maximum impact.`,
      images: product.image_url ? [product.image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | PUFFF Station Vendors SA`,
      description: product.description || `Premium disposable: ${product.name}. Maximum impact.`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

function isValidHex(hex?: string | null) {
  if (!hex) return false
  return /^#[0-9a-fA-F]{6}$/.test(hex.trim())
}

function hexToRgb(hex?: string | null) {
  if (!isValidHex(hex)) return null
  const h = hex!.replace('#', '').trim()
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <h1 className="text-lg font-semibold text-white">Eish… product not found</h1>
          <p className="mt-2 text-sm text-slate-300">That link looks dodgy or the item got removed.</p>
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

  const accentHex = isValidHex(product.accent_hex) ? product.accent_hex!.trim() : '#D946EF'
  const previewSmoke = isValidHex(product.smoke_hex_preview)
    ? product.smoke_hex_preview!.trim()
    : accentHex
  const smokeRgb = hexToRgb(previewSmoke) || '217 70 239'

  const priceNumber = product.price != null ? Number(product.price) : 0
  const hasPrice = product.price != null && !Number.isNaN(priceNumber)

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
        {/* IMAGE + PREVIEW SMOKE */}
        <div
          className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-black/70"
          style={{ ['--smoke-rgb' as any]: smokeRgb } as React.CSSProperties}
        >
          <div className="absolute inset-0">
            {/* Ambient haze using the same smoke system */}
            <div className="pufff-haze opacity-60" />
            <PreviewSmokeVideo
              className="pufff-smoke-video absolute inset-0 h-full w-full object-cover"
              id={product.id}
              hex={previewSmoke}
              style={{
                transform: 'translateZ(0) scale(1.25)',
                objectPosition: '50% 22%',
                opacity: 0.95,
                filter: `url(#smoke-filter-${product.id}) contrast(1.2) brightness(1.05)`,
              }}
              src="/preview.mp4"
              poster="/preview.jpg"
            />
 
            {/* Ambient matte glow */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 60% at 50% 45%, var(--smoke), transparent 80%)',
                mixBlendMode: 'screen',
                opacity: 0.35,
                filter: 'blur(10px)',
              }}
            />

            {/* kill bottom base */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />

            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 55% at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.78) 100%)',
              }}
            />
          </div>

          <div className="relative aspect-[16/10] w-full flex items-center justify-center p-6">
            <div className="absolute inset-0 opacity-70">
              <div className="pufff-smoke-pad opacity-80" />
            </div>
            {product.image_url ? (
              <div className="relative h-[360px] w-full max-w-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  decoding="async"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_22px_65px_rgba(0,0,0,0.7)]"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                No image
              </div>
            )}
          </div>
        </div>

        {/* DETAILS */}
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

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">{product.name}</h1>

          {product.description ? (
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No description yet — but it’s a lekker unit.</p>
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

      <ReviewFeed />
    </main>
  )
}
