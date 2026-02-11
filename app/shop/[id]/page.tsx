export const runtime = 'edge'

import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AddToCartButton from '@/components/cart/AddToCartButton'
import type { Product } from '@/lib/types'
import PreviewSmokeVideo from '@/components/shop/PreviewSmokeVideo'
import ReviewFeed from '@/components/shop/ReviewFeed'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.name,
    description: product.description || `Premium disposable: ${product.name}.`,
    openGraph: {
      title: `${product.name} | PUFFF Station Vendors SA`,
      description: product.description || `Premium disposable: ${product.name}.`,
      images: product.image_url ? [product.image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | PUFFF Station Vendors SA`,
      description: product.description || `Premium disposable: ${product.name}.`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

function isValidHex(hex?: string | null) {
  if (!hex) return false
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(hex.trim())
}

const GLOBAL_FALLBACK_SMOKE = '#06b6d4'

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-black uppercase text-white">404 | Not Found</h1>
          <p className="mb-8 font-mono text-slate-500">Product not found.</p>
          <Link
            href="/"
            className="inline-flex border-b border-cyan-500 text-cyan-300 font-bold uppercase tracking-widest hover:text-cyan-200"
          >
            Return Home
          </Link>
        </div>
      </main>
    )
  }

  const product = data as Product
  const previewSmoke = isValidHex(product.smoke_hex_preview)
    ? product.smoke_hex_preview!.trim()
    : isValidHex(product.smoke_hex)
      ? product.smoke_hex!.trim()
      : isValidHex(product.accent_hex)
        ? product.accent_hex!.trim()
        : GLOBAL_FALLBACK_SMOKE

  const priceNumber = product.price != null ? Number(product.price) : 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : [],
    description: product.description || `Premium disposable: ${product.name}.`,
    brand: { '@type': 'Brand', name: 'PUFFF Station Vendors SA' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ZAR',
      price: priceNumber,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://pufffstationvendorssa.co.za/shop/${product.id}`,
    },
  }

  return (
    <main className="min-h-screen bg-black pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-6 py-6 mix-blend-difference">
        <div className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter text-white">
            PUFFF<span className="text-cyan-300">.</span>
          </Link>
          <Link href="/cart" className="text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-cyan-200">
            Cart
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 pt-32 lg:grid-cols-2">
        <div className="group relative">
          <div className="pointer-events-none absolute inset-0 -z-10 scale-150 opacity-60 mix-blend-screen blur-xl">
            <PreviewSmokeVideo
              id={product.id}
              hex={previewSmoke}
              src="/preview.mp4"
              poster="/preview.jpg"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>

          <div className="relative aspect-square flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain drop-shadow-[0_0_50px_rgba(6,182,212,0.25)] transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="text-4xl font-black uppercase text-slate-700">No Image</div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-6 flex gap-4">
              <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                New Drop
              </span>
              {product.in_stock ? (
                <span className="bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                  In Stock
                </span>
              ) : (
                <span className="bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="mb-6 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
              {product.name}
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-slate-400">
              {product.description || 'Premium hardware. Maximum flavor. Fast local dispatch.'}
            </p>
          </div>

          <div className="border-t border-slate-900 pt-8">
            <div className="mb-2 flex items-end gap-4">
              <span className="text-4xl font-bold tracking-tight text-white">R{priceNumber.toFixed(0)}</span>
              <span className="mb-2 font-mono text-sm text-slate-500">ZAR | VAT INCL</span>
            </div>

            {(product as any).bulk_min && (product as any).bulk_price ? (
              <div className="mt-4 inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Wholesale: Buy {(product as any).bulk_min}+ for R{Number((product as any).bulk_price).toFixed(0)} each
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden pt-8 lg:block">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-black/90 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase text-slate-400">{product.name}</p>
            <p className="font-bold text-white">R{priceNumber.toFixed(0)}</p>
          </div>
          <div className="flex-1">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-32 max-w-7xl border-t border-slate-900 px-6 pt-20">
        <h3 className="mb-10 text-2xl font-black uppercase tracking-tighter text-slate-700">Community Reviews</h3>
        <ReviewFeed />
      </div>
    </main>
  )
}
