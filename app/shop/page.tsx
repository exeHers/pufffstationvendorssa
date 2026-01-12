import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export const metadata: Metadata = {
  title: 'Shop Premium Disposables',
  description: 'Browse our curated collection of premium disposables. Live motion, smooth smoke, and exclusive drops.',
  openGraph: {
    title: 'Shop Premium Disposables | PUFFF Station Vendors SA',
    description: 'Browse our curated collection of premium disposables. Live motion, smooth smoke, and exclusive drops.',
  },
}
import type { Product } from '@/lib/types'
import ProductCard from '@/components/products/ProductCard'
import ShopFilters from '@/components/shop/ShopFilters'

export const dynamic = 'force-dynamic'

type Category = {
  id: string
  name: string
}

type Flavour = {
  id: string
  name: string
  slug: string
}

function isValidHex(hex?: string | null) {
  if (!hex) return false
  return /^#[0-9a-fA-F]{6}$/.test(hex.trim())
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

function hexToRgb(hex?: string | null) {
  if (!isValidHex(hex)) return null
  const h = hex!.replace('#', '').trim()
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
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

function clampCategoryLabel(input: string) {
  const s = (input || '').trim()
  if (!s) return 'Other'
  return s.length > 28 ? `${s.slice(0, 28)}...` : s
}

function getAccent(product: Product) {
  const p: any = product
  const accent = (p.accent_hex || '').trim()
  const hueFromHex = hexToHue(accent)
  const hue = hueFromHex ?? pickHue(product.name)
  return { hue, accentHex: accent || null }
}

function formatMoney(n: number) {
  return `R${Number(n).toFixed(2)}`
}

function buildShopUrl(params: { brand?: string; flavour?: string }) {
  const sp = new URLSearchParams()
  if (params.brand) sp.set('brand', params.brand)
  if (params.flavour) sp.set('flavour', params.flavour)
  const qs = sp.toString()
  return qs ? `/shop?${qs}` : '/shop'
}

function FeaturedHero({ product }: { product: Product }) {
  const { hue, accentHex } = getAccent(product)
  const p: any = product
  const bulkMin = p.bulk_min
  const bulkPrice = p.bulk_price
  const smokeHex = isValidHex(p.smoke_hex_scroll) ? p.smoke_hex_scroll.trim() : accentHex || '#D946EF'
  const smokeRgb = hexToRgb(smokeHex) || '217 70 239'

  return (
    <a
      href={`/shop/${product.id}`}
      className="group relative block overflow-hidden rounded-[2.25rem] border border-slate-800/80 bg-slate-950/20 p-6 shadow-2xl transition hover:border-slate-700 md:p-10"
      style={{ ['--smoke-rgb' as any]: smokeRgb } as React.CSSProperties}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0a0a0c]/40" />

        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{ filter: 'grayscale(1) contrast(1.1) brightness(0.9)' }}
          >
            <video
              className="pufff-smoke-video h-full w-full object-cover scale-[1.05]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/smoke-poster.jpg"
            >
              <source src="/smoke.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="absolute inset-0 mix-blend-multiply opacity-30" style={{ background: smokeHex }} />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/80" />
        </div>

        <div
          className="absolute inset-0 opacity-15"
          style={{
            background:
              `radial-gradient(900px 380px at 20% 20%, rgba(217,70,239,0.22), transparent 60%),` +
              `radial-gradient(900px 380px at 80% 80%, rgba(34,211,238,0.18), transparent 60%)`,
          }}
        />
      </div>

      <div className="relative grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Featured Drop
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            {product.description || 'Premium disposables. Maximum impact.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-white">
              {formatMoney(Number(product.price))}
            </span>

            {bulkMin && bulkPrice ? (
              <span className="inline-flex items-center rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-200">
                Bulk: {formatMoney(Number(bulkPrice))}{' '}
                <span className="ml-2 text-xs text-slate-400">min {bulkMin}</span>
              </span>
            ) : null}

            <span className="inline-flex items-center rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {clampCategoryLabel((p.category as string) || '')}
            </span>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.25)] transition group-hover:brightness-110"
              style={{ background: accentHex || `hsl(${hue} 95% 60%)` }}
            >
              View flavour
            </span>

            <span className="text-xs text-slate-400">
              Smooth smoke. Live motion. Premium drops.
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div
            className="absolute -inset-8 rounded-[2.25rem] blur-3xl opacity-35"
            style={{ background: accentHex || `hsl(${hue} 95% 60%)` }}
          />
          <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-800/60 bg-slate-950/40 p-6">
            <div className="absolute inset-0 opacity-30">
              <div className="pufff-smoke-pad opacity-70" />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative h-[360px] w-full max-w-[280px]">
                <img
                  src={(product as any).image_url || '/placeholder.png'}
                  alt={product.name}
                  decoding="async"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[0.5deg]"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                In stock
              </div>
              <div className="text-sm font-semibold text-white">
                {formatMoney(Number(product.price))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

function RowHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
        Scroll
      </div>
    </div>
  )
}

function ProductRow({
  title,
  subtitle,
  products,
}: {
  title: string
  subtitle?: string
  products: Product[]
}) {
  return (
    <section className="mt-10">
      <RowHeader title={title} subtitle={subtitle} />
      <div className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[270px] max-w-[270px] sm:min-w-[320px] sm:max-w-[320px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ flavour?: string; brand?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const brand = (resolvedSearchParams?.brand || '').toString().trim()
  const flavour = (resolvedSearchParams?.flavour || '').toString().toLowerCase().trim()

  const [categoriesResult, flavoursResult] = await Promise.all([
    supabase.from('categories').select('id,name').order('name', { ascending: true }),
    supabase
      .from('flavours')
      .select('id,name,slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const categories = (categoriesResult.data as Category[]) || []
  const flavours = (flavoursResult.data as Flavour[]) || []

  const activeBrand =
    categories.find((c) => c.name.toLowerCase() === brand.toLowerCase()) || null
  const activeFlavour = flavours.find((f) => f.slug === flavour) || null

  const flavourOptions = [
    { label: 'All flavours', value: '' },
    ...flavours.map((f) => ({ label: f.name, value: f.slug })),
  ]
  const brandOptions = [
    { label: 'All brands', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
  ]

  const brandItems = brandOptions.map((option) => ({
    label: option.label,
    href: buildShopUrl({
      brand: option.value || undefined,
      flavour: flavour || undefined,
    }),
  }))
  const flavourItems = flavourOptions.map((option) => ({
    label: option.label,
    href: buildShopUrl({
      brand: brand || undefined,
      flavour: option.value || undefined,
    }),
  }))

  const selectWithFlavour =
    '*, product_flavours!inner(flavour_id, flavours!inner(id,name,slug))'
  const selectBase = '*'

  let productQuery = supabase
    .from('products')
    .select(flavour ? selectWithFlavour : selectBase)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (brand) productQuery = productQuery.ilike('category', brand)
  if (flavour) productQuery = productQuery.eq('product_flavours.flavours.slug', flavour)

  const { data, error } = await productQuery

  const filteredProducts = (data as any as Product[]) || []
  const anyProducts = filteredProducts.length > 0

  const featured =
    filteredProducts.find((p: any) => p.in_stock === true) ||
    filteredProducts[0] ||
    null

  const byCategory = new Map<string, Product[]>()
  for (const p of filteredProducts) {
    const cat = clampCategoryLabel(((p as any).category as string) || '')
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(p)
  }

  const categoryEntries = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].length - a[1].length
  )

  const activeFlavourLabel = activeFlavour?.name || flavour
  const activeBrandLabel = activeBrand?.name || brand
  const hasFilters = Boolean(brand || flavour)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Shop
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Premium Disposables
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
            Curated drops. Live motion. Smooth smoke. Pick a flavour and let it speak.
          </p>
        </div>

        <ShopFilters
          brandLabel={activeBrandLabel || 'All brands'}
          flavourLabel={activeFlavourLabel || 'All flavours'}
          brandItems={brandItems}
          flavourItems={flavourItems}
        />
      </div>

      {hasFilters && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {brand ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
              Brand: {activeBrandLabel}
            </span>
          ) : null}
          {flavour ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
              Flavour: {activeFlavourLabel}
            </span>
          ) : null}
          <Link
            href="/shop"
            className="inline-flex items-center rounded-full border border-slate-700/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Clear filter
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Eish - shop didn't load. Check Supabase + your env keys.
        </div>
      )}

      {!error && !anyProducts && (
        <div className="mt-8 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-300">
          {hasFilters ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>No products found for the selected filters.</span>
              <Link
                href="/shop"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:text-white"
              >
                Clear filter
              </Link>
            </div>
          ) : (
            <span>Nothing in stock yet. Admin must load products first.</span>
          )}
        </div>
      )}

      {featured && (
        <div className="mt-10">
          <FeaturedHero product={featured} />
        </div>
      )}

      {categoryEntries.length > 0 &&
        categoryEntries.map(([cat, items]) => (
          <ProductRow
            key={cat}
            title={cat}
            subtitle="Smooth showroom scroll. Each flavour has its own vibe."
            products={items.filter((p: any) => p.in_stock === true)}
          />
        ))}

      {filteredProducts.length > 10 && (
        <section className="mt-14">
          <RowHeader title="All drops" subtitle="Not a warehouse grid. A curated feed." />
          <div className="mt-6 flex flex-col gap-5">
            {filteredProducts.map((p) => (
              <div key={p.id} className="max-w-4xl">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
