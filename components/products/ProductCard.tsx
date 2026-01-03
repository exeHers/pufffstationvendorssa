'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCart } from '@/components/cart/CartContext'

function isValidHex(hex?: string | null) {
  return !!hex && /^#[0-9a-fA-F]{6}$/.test(hex.trim())
}

function formatMoney(n: number) {
  return `R${Number(n).toFixed(2)}`
}

function useHoverCapable() {
  const [hoverCapable, setHoverCapable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setHoverCapable(Boolean(mq.matches))
    update()
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', update)
    else mq.addListener(update)
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [])

  return hoverCapable
}

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart()
  const reduceMotion = useReducedMotion()
  const hoverCapable = useHoverCapable()

  const p: any = product
  const imageUrl = p.image_url || '/placeholder.png'
  const inStock = p.in_stock !== false

  // ✅ Smoke hex comes from admin (EXACT)
  const smokeHex = isValidHex(p.smoke_hex_scroll) ? p.smoke_hex_scroll.trim() : '#D946EF'
  const accentHex = isValidHex(p.accent_hex) ? p.accent_hex.trim() : smokeHex

  const desc = (product.description || '').trim()
  const shortDesc = desc.length > 95 ? `${desc.slice(0, 95)}…` : desc

  const allowFloat = hoverCapable && !reduceMotion

  // ✅ Lazy load smoke video when visible (fix slow load)
  const ref = useRef<HTMLAnchorElement | null>(null)
  const [showSmoke, setShowSmoke] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setShowSmoke(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    cart.addToCart(product, 1)
  }

  const cssVars = useMemo(() => {
    return {
      ['--smoke' as any]: smokeHex,
      ['--accent' as any]: accentHex,
    } as React.CSSProperties
  }, [smokeHex, accentHex])

  return (
    <Link
      ref={ref as any}
      href={`/shop/${product.id}`}
      className="group relative block overflow-hidden rounded-[2.1rem] border border-slate-800/70 bg-black/70 shadow-[0_0_45px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:border-slate-700/70"
      style={{
        ...cssVars,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        contain: 'paint',
      }}
    >
      {/* Background (black theme always) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/60 to-black/95" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background:
              `radial-gradient(520px 220px at 18% 18%, var(--accent), transparent 70%),` +
              `radial-gradient(520px 220px at 85% 92%, var(--accent), transparent 75%)`,
          }}
        />
      </div>

      <div className="relative p-5 sm:p-6">
        {/* Top */}
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

        {/* Stage */}
        <div className="relative mt-4 overflow-hidden rounded-[1.9rem] border border-slate-800/60 bg-black/60 p-4">
          {/* ✅ Smoke layer (isolated + masked + neon) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              contain: 'paint',
              willChange: 'transform',
            }}
          >
            {showSmoke ? (
              <>
                {/* Video base */}
                <video
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.55]"
                  style={{
                    transform: 'scale(1.35)',
                    objectPosition: '50% 22%',
                    filter: 'grayscale(1) contrast(1.35) brightness(1.1)',
                  }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                >
                  <source src="/scroll.mp4" type="video/mp4" />
                </video>

                {/* ✅ Exact hex tint */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'var(--smoke)',
                    mixBlendMode: 'screen',
                    opacity: 0.55,
                  }}
                />

                {/* ✅ Neon pop */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    boxShadow: `inset 0 0 80px var(--smoke)`,
                    filter: 'blur(10px)',
                  }}
                />
              </>
            ) : null}

            {/* Hide the “water base” */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/95" />

            {/* Mask edges */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(62% 55% at 50% 38%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.82) 100%)',
              }}
            />
          </div>

          {/* Pedestal */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20">
            <div
              className="absolute left-1/2 top-7 h-10 w-[75%] -translate-x-1/2 rounded-full blur-2xl opacity-45"
              style={{ background: 'var(--accent)' }}
            />
            <div className="absolute left-1/2 top-10 h-8 w-[72%] -translate-x-1/2 rounded-full bg-black/70 blur-xl" />
            <div className="absolute left-1/2 top-14 h-5 w-[66%] -translate-x-1/2 rounded-full bg-black/80 blur-lg" />
          </div>

          {/* Product */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <motion.div
              className="relative h-[240px] w-full"
              animate={allowFloat ? { y: [0, -5, 0], rotate: [0, 0.45, 0] } : undefined}
              transition={
                allowFloat
                  ? { duration: 4.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                  : undefined
              }
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 360px"
                className="select-none object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 rounded-[1.9rem] ring-1 ring-white/5" />
        </div>

        {/* Text */}
        <h3 className="mt-5 text-sm font-bold leading-snug text-white">{product.name}</h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          {shortDesc || 'Smooth pull. Strong flavour. Premium disposable.'}
        </p>

        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-white">{formatMoney(Number(product.price))}</div>

          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_35px_rgba(34,211,238,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              background: inStock ? 'var(--accent)' : 'rgba(148,163,184,0.25)',
              color: inStock ? 'rgba(2,6,23,0.95)' : 'rgba(226,232,240,0.85)',
            }}
          >
            Add to cart
          </button>
        </div>

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