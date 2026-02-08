'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCart } from '@/components/cart/CartContext'
import SmokeFilter from '@/components/ui/SmokeFilter'

function isValidHex(hex?: string | null) {
  if (!hex) return false
  const h = hex.trim()
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(h)
}

const GLOBAL_FALLBACK_SMOKE = '#7c3aed'

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
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
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

  const smokeHex = isValidHex(p.smoke_hex_scroll) ? p.smoke_hex_scroll!.trim() : 
                   isValidHex(p.smoke_hex) ? p.smoke_hex!.trim() :
                   isValidHex(p.accent_hex) ? p.accent_hex!.trim() : GLOBAL_FALLBACK_SMOKE
  const accentHex = isValidHex(p.accent_hex) ? p.accent_hex.trim() : smokeHex

  const allowFloat = hoverCapable && !reduceMotion

  const ref = useRef<HTMLAnchorElement | null>(null)
  const [showSmoke, setShowSmoke] = useState(false)
  const [videoDuration, setVideoDuration] = useState(6)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowSmoke(true)
          io.disconnect()
        }
      },
      { threshold: 0.1 }
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
      className="group relative flex flex-col items-center justify-center p-4 transition-transform duration-500 hover:-translate-y-2"
      style={{
        ...cssVars,
        contain: 'paint',
      }}
    >
      {/* 
        NASTY LAYOUT UPDATE:
        - Removed card background/border
        - Centered Image + Text
        - Minimalist typography
      */}

      {/* --- SMOKE LAYER (Keep subtle/ambient behind product) --- */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen transition-opacity duration-700 group-hover:opacity-70">
        {showSmoke ? (
          <>
            <SmokeFilter id={product.id} hex={smokeHex} />
            {(() => {
              let h = smokeHex.trim().replace('#', '').toLowerCase()
              if (h.length === 3) h = h.split('').map((c: any) => c + c).join('')
              const cleanHex = h.padEnd(6, '0').slice(0, 6).toLowerCase()
              const filterId = `smoke-filter-${product.id}-${cleanHex}`
              
              return (
                <div className="absolute inset-0 flex items-center justify-center" style={{ 
                  filter: `url(#${filterId})`,
                  WebkitFilter: `url(#${filterId})` 
                }}>
                  <video
                    className="h-[120%] w-[120%] object-cover opacity-60 mix-blend-screen blur-xl"
                    style={{
                      transform: 'scale(1.5)',
                      objectPosition: 'center',
                      filter: `url(#${filterId})`,
                      WebkitFilter: `url(#${filterId})`,
                      animation: `smokeLoop ${videoDuration}s ease-in-out infinite`,
                    }}
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/hero/neon-smoke.mp4" type="video/mp4" />
                  </video>
                </div>
              )
            })()}
          </>
        ) : null}
      </div>

      {/* --- PRODUCT IMAGE (Large & Floating) --- */}
      <div className="relative z-10 w-full flex items-center justify-center mb-6 h-[320px] sm:h-[380px]">
        <motion.div
          className="relative w-full h-full max-w-[280px]"
          animate={allowFloat ? { y: [0, -8, 0], rotate: [0, 1, 0] } : undefined}
          transition={allowFloat ? { duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } : undefined}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 90vw, 400px"
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>
        
        {!inStock && (
           <div className="absolute top-0 right-0 z-20 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 text-[10px] uppercase font-bold tracking-widest backdrop-blur-md rounded">
             Sold Out
           </div>
        )}
      </div>

      {/* --- TYPOGRAPHY (Nasty Style: Uppercase, Bold, Centered) --- */}
      <div className="relative z-20 text-center flex flex-col items-center gap-2">
        <h3 className="font-black text-white uppercase tracking-[0.2em] text-lg sm:text-xl leading-none group-hover:text-[var(--accent)] transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs sm:text-sm">
          {formatMoney(Number(product.price))}
        </p>

        {/* Optional: Add to Cart button only appears on Hover/Focus for clean look */}
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="mt-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-[10px] font-black uppercase tracking-[0.25em] border border-white/20 hover:border-[var(--accent)] hover:text-[var(--accent)] bg-black/50 backdrop-blur px-6 py-3 rounded-full disabled:opacity-0"
        >
          Add to Cart
        </button>
      </div>

    </Link>
  )
}
