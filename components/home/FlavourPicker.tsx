'use client'

import Link from 'next/link'
import type { Flavour } from '@/lib/flavours'

const flavourStyles: Record<string, { ring: string; glow: string }> = {
  sweet: {
    ring: 'ring-pink-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]',
  },
  fruity: {
    ring: 'ring-orange-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.25)]',
  },
  'ice-mint': {
    ring: 'ring-cyan-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]',
  },
  tobacco: {
    ring: 'ring-amber-500/40',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.20)]',
  },
  soda: {
    ring: 'ring-violet-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]',
  },
  berry: {
    ring: 'ring-fuchsia-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.25)]',
  },
  exotic: {
    ring: 'ring-indigo-400/40',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
  },
}

export default function FlavourPicker({ flavours }: { flavours: Flavour[] }) {
  if (!flavours || flavours.length === 0) return null

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white/90 md:text-2xl">
            What flavour are you feeling today?
          </h2>
          <p className="mt-2 text-white/60">
            Pick a vibe - we'll show you matching drops.
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden text-sm text-white/70 transition hover:text-white md:inline-flex"
        >
          Browse all
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {flavours.map((flavour) => {
          const styles = flavourStyles[flavour.slug] || {
            ring: 'ring-white/15',
            glow: 'hover:shadow-[0_0_30px_rgba(255,255,255,0.12)]',
          }

          return (
            <Link
              key={flavour.id}
              href={`/shop?flavour=${encodeURIComponent(flavour.slug)}`}
              className={[
                'group relative overflow-hidden rounded-2xl',
                'border border-white/10 bg-white/[0.04]',
                'px-4 py-4 sm:py-5',
                'transition duration-300',
                'hover:border-white/20 hover:bg-white/[0.06]',
                'ring-1',
                styles.ring,
                styles.glow,
              ].join(' ')}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              </div>

              <div className="text-sm font-semibold text-white/90">
                {flavour.name}
              </div>
              <div className="mt-1 text-xs text-white/50">Tap to explore</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
