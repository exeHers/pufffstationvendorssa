'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCart } from '@/components/cart/CartContext'

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

function formatMoney(n: number) {
  return `R${Number(n).toFixed(2)}`
}

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart()

  const p: any = product
  const accentHex = (p.accent_hex || '').trim() || null
  const hue = hexToHue(accentHex) ?? pickHue(product.name)

  const inStock = p.in_stock !== false
  const imageUrl = p.image_url || '/placeholder.png'

  const desc = (product.description || '').trim()
  const shortDesc = desc.length > 95 ? `${desc.slice(0, 95)}…` : desc

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    cart.addToCart(product, 1)
  }

  const cssVars = useMemo(() => {
    return {
      ['--smoke-hue' as any]: hue,
      ['--accent' as any]: accentHex || `hsl(${hue} 95% 60%)`,
    } as React.CSSProperties
  }, [hue, accentHex])

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group relative block overflow-hidden rounded-[2.1rem] border border-slate-800/70 bg-slate-950/50 shadow-[0_0_45px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:border-slate-700/70"
      style={cssVars}
    >
      {/* Ambient + smoke */}
      <div className="absolute inset-0">
        {/* subtle colour wash */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background:
              `radial-gradient(700px 260px at 20% 15%, var(--accent), transparent 60%),` +
              `radial-gradient(700px 260px at 85% 90%, var(--accent), transparent 65%)`,
          }}
        />

        {/* smoke layers */}
        <div className="absolute inset-0 opacity-60">
          <div className="pufff-smoke-pad opacity-70" />
          <div className="pufff-haze opacity-55" />
          <div className="pufff-tile-breathe opacity-55" />
        </div>

        {/* vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/40 to-slate-950/70" />
      </div>

      {/* Content */}
      <div className="relative p-5 sm:p-6">
        {/* Top: category + stock */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            {(p.category || 'Disposable').toString()}
          </span>

          <span
            className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: inStock ? 'rgba(34,211,238,0.25)' : 'rgba(244,63,94,0.25)',
              color: inStock ? 'rgba(224,242,254,0.92)' : 'rgba(254,202,202,0.95)',
              background: inStock ? 'rgba(8,145,178,0.10)' : 'rgba(244,63,94,0.10)',
            }}
          >
            {inStock ? 'In stock' : 'Out'}
          </span>
        </div>

        {/* Image stage */}
        <div className="relative mt-4 overflow-hidden rounded-[1.9rem] border border-slate-800/60 bg-slate-950/35 p-4">
          {/* Stand / pedestal */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20">
            <div
              className="absolute left-1/2 top-7 h-10 w-[75%] -translate-x-1/2 rounded-full blur-2xl opacity-45"
              style={{ background: 'var(--accent)' }}
            />
            <div className="absolute left-1/2 top-10 h-8 w-[72%] -translate-x-1/2 rounded-full bg-slate-950/60 blur-xl" />
            <div className="absolute left-1/2 top-14 h-5 w-[66%] -translate-x-1/2 rounded-full bg-black/55 blur-lg" />
          </div>

          {/* Extra glow behind device */}
          <div
            className="pointer-events-none absolute -inset-10 opacity-30 blur-3xl"
            style={{ background: 'var(--accent)' }}
          />

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Next/Image optimized device image */}
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 0.45, 0],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
              className="relative h-[240px] w-full"
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 360px"
                className="select-none object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          {/* If image is white background, soften edges */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.9rem] ring-1 ring-white/5" />
        </div>

        {/* Text */}
        <h3 className="mt-5 text-sm font-bold leading-snug text-white">{product.name}</h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          {shortDesc || 'Smooth pull. Strong flavour. Premium disposable.'}
        </p>

        {/* Bottom row */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-white">{formatMoney(Number(product.price))}</div>

          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              background: inStock ? 'var(--accent)' : 'rgba(148,163,184,0.25)',
              color: inStock ? 'rgba(2,6,23,0.95)' : 'rgba(226,232,240,0.85)',
            }}
          >
            Add to cart
          </button>
        </div>

        {/* Bulk info */}
        {p.bulk_min && p.bulk_price ? (
          <div className="mt-3 text-[11px] text-slate-400">
            Bulk available:{' '}
            <span className="font-semibold text-white">{formatMoney(Number(p.bulk_price))}</span>{' '}
            <span className="text-slate-500">min {p.bulk_min}</span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}