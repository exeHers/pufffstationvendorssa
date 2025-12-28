'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function ScrollShowcase() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // subtle parallax
  const y = useTransform(scrollYProgress, [0, 1], [24, -24])
  const glow = useTransform(scrollYProgress, [0, 1], [0.18, 0.35])

  return (
    <section ref={ref} className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6">
      {/* hovering smoke underneath */}
      <motion.video
        style={{ y, opacity: glow }}
        className="pointer-events-none absolute bottom-[-40px] left-0 h-56 w-full object-cover mix-blend-screen"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/smoke/green-hover.webm" type="video/webm" />
      </motion.video>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55 }}
        className="relative"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Fresh drops
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Smooth scroll. Smooth vibes.
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          Subtle motion, premium glow, and a store that feels alive.
        </p>
      </motion.div>
    </section>
  )
}