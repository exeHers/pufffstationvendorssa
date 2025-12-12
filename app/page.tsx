'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070712]">
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 puff-bg opacity-90" />

      {/* Big soft glows (transform+opacity only, smooth) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="puff-glow absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/25 blur-[110px]" />
        <div className="puff-glow2 absolute left-[15%] top-[20%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/18 blur-[100px]" />
        <div className="puff-glow3 absolute right-[10%] bottom-[15%] h-[520px] w-[520px] rounded-full bg-blue-500/14 blur-[120px]" />
      </div>

      {/* Watermark logo behind (blended, not kak black block) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[110vmin] w-[110vmin] opacity-[0.10] puff-watermark">
          <Image
            src="/logo.png"
            alt="PUFFF Station Vendors watermark"
            fill
            priority
            sizes="110vmin"
            className="object-contain"
            quality={100}
          />
        </div>
        {/* Blend overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(7,7,18,0.7)_58%,rgba(7,7,18,0.95)_100%)]" />
      </div>

      {/* Content */}
      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
        {/* Logo in a circle, perfectly centered */}
        <div className="relative puff-float">
          <div className="puff-ring absolute inset-0 rounded-full" />
          <div className="relative h-44 w-44 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(217,70,239,0.25)] backdrop-blur-sm sm:h-52 sm:w-52">
            <Image
              src="/logo.png"
              alt="PUFFF Station Vendors"
              fill
              priority
              sizes="(max-width: 640px) 176px, 208px"
              className="object-cover"
              quality={100}
            />
          </div>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.30em] text-purple-200/80">
          Local vendors • clean stock • no kak stories
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          PUFFF Station Vendors
        </h1>

        <p className="mt-4 max-w-md text-sm text-slate-200/80 sm:text-base">
          Order your disposable stash quick-quick — simple checkout, smooth experience.
          No stress, bru.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-purple-500 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(168,85,247,0.55)] transition hover:brightness-110 active:scale-95"
          >
            Go to Stash
          </Link>

          <Link
            href="/cart"
            className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition hover:border-purple-300/70 hover:text-purple-100 active:scale-95"
          >
            View Cart
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-slate-400/80">
          Customer support coming next • Admin panel coming next
        </p>
      </section>

      {/* Bottom-right credit */}
      <div className="absolute bottom-4 right-5 z-10 text-[10px] text-white/40">
        DVNV Digital
      </div>
    </main>
  )
}