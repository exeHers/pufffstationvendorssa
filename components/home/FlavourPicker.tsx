'use client'

import Link from 'next/link'
import type { Flavour } from '@/lib/flavours'
import { motion } from 'framer-motion'

const flavourStyles: Record<string, { color: string; bg: string; border: string }> = {
  sweet: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/5',
    border: 'group-hover:border-violet-500/50',
  },
  fruity: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/5',
    border: 'group-hover:border-orange-500/50',
  },
  'ice-mint': {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/5',
    border: 'group-hover:border-cyan-500/50',
  },
  tobacco: {
    color: 'text-amber-600',
    bg: 'bg-amber-600/5',
    border: 'group-hover:border-amber-600/50',
  },
  soda: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/5',
    border: 'group-hover:border-violet-500/50',
  },
  berry: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/5',
    border: 'group-hover:border-violet-500/50',
  },
  exotic: {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/5',
    border: 'group-hover:border-indigo-500/50',
  },
}

export default function FlavourPicker({ flavours }: { flavours: Flavour[] }) {
  if (!flavours || flavours.length === 0) return null

  return (
    <section className="p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/80">Vibe Selector</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
            What flavour are you <br /> feeling today?
          </h2>
          <p className="mt-4 text-slate-400 text-xs md:text-sm font-medium max-w-md">
            Pick a vibe below and we'll instantly filter the best official drops for your current mood.
          </p>
        </div>
        <Link
          href="/shop"
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-white"
        >
          Browse All
          <span className="h-px w-8 bg-slate-800 transition-all group-hover:w-12 group-hover:bg-white" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {flavours.map((flavour, idx) => {
          const style = flavourStyles[flavour.slug] || {
            color: 'text-white',
            bg: 'bg-white/5',
            border: 'group-hover:border-white/50',
          }

          return (
            <motion.div
              key={flavour.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={`/shop?flavour=${encodeURIComponent(flavour.slug)}`}
                className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.03] bg-slate-950/40 p-10 text-center transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900/40 ${style.border}`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${style.bg}`} />
                
                <div className="relative z-10">
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-white mb-2">
                    {flavour.name}
                  </h3>
                  <div className={`text-[8px] font-bold uppercase tracking-[0.2em] opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 ${style.color}`}>
                    View Selection →
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:opacity-20 transition-opacity">
                   <div className="h-4 w-4 border-t border-r border-white rounded-tr-lg" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
