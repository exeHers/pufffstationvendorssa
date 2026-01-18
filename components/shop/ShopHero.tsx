'use client'

import { useEffect, useRef, useState } from 'react'

type HeroProps = {
  title: string
  subtitle: string
  primaryCtaText: string
  primaryCtaHref: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  smokeSrc?: string
}

export default function ShopHero({
  title,
  subtitle,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  smokeSrc = '/smoke/blue-smoke.webm',
}: HeroProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e?.isIntersecting) setVisible(true)
      },
      { threshold: 0.25 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 shadow-[0_18px_50px_rgba(0,0,0,0.75)]"
    >
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute -inset-28 bg-[radial-gradient(circle_at_30%_20%,var(--matte-purple),transparent_60%)]" />
        <div className="absolute -inset-28 bg-[radial-gradient(circle_at_75%_60%,rgba(34,211,238,0.20),transparent_55%)]" />
      </div>

      {/* Smoke video layer */}
      <video
        className="pufff-smoke-video pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-60"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={smokeSrc} type="video/webm" />
      </video>

      {/* Dark overlay to keep text readable */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/20" />

      {/* Content */}
      <div
        className={[
          'relative z-10 p-6 sm:p-10',
          'transition-all duration-700 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Shop • Premium disposables
        </p>

        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-200/90">
          {subtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={primaryCtaHref}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_26px_rgba(34,211,238,0.55)] transition hover:brightness-110 active:scale-95"
          >
            {primaryCtaText}
            <span className="ml-2">→</span>
          </a>

          {secondaryCtaText && secondaryCtaHref ? (
            <a
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/30 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:border-violet-400/70 hover:text-violet-200 active:scale-95"
            >
              {secondaryCtaText}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
