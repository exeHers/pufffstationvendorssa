import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-120px)] overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 puff-bg bg-[linear-gradient(120deg,rgba(217,70,239,0.16),rgba(2,6,23,0.92),rgba(59,130,246,0.14))]" />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(2,6,23,0.88)_75%)]" />

      {/* Logo watermark background */}
      <div
        className="absolute inset-0 opacity-[0.10] blur-[0.2px]"
        style={{
          backgroundImage: "url('/logo.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'min(720px, 92vw)',
          filter: 'saturate(1.05)',
        }}
      />

      {/* Glow behind center (blends the “black slab” issue) */}
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/25 puff-glow" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 puff-glow" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl flex-col items-center justify-center px-4 py-12 text-center">
        {/* Centered logo (foreground) */}
        <div className="puff-float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="PUFFF Station"
            className="mx-auto h-auto w-[min(360px,78vw)] drop-shadow-[0_18px_45px_rgba(0,0,0,0.75)]"
            draggable={false}
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
          LOCAL VENDOR · TRUSTED · LEKKER STOCK
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Disposable vapes that actually slap.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
          No drama, no dodgy stock. Browse the stash, add to cart, and we sort the delivery.
          Clean vibes, proper service.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-fuchsia-500 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(217,70,239,0.55)] transition hover:brightness-110 active:scale-[0.98]"
          >
            Go to Stash
          </Link>

          <Link
            href="/cart"
            className="rounded-full border border-slate-600/80 bg-slate-950/20 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-200 backdrop-blur-md transition hover:border-fuchsia-300/60 hover:text-fuchsia-200"
          >
            View Cart
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Fast stock updates
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Secure checkout coming in
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            Proper local vibes
          </span>
        </div>
      </div>
    </main>
  )
}