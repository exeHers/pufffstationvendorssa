import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Thin purple line on very top */}
      <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500" />

      <div className="bg-black/95 border-b border-slate-900/80 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* LEFT: PUFFF STATION VENDORS logo block */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-[19px] font-semibold tracking-[0.25em] text-white uppercase">
                PUFFF <span className="text-fuchsia-400">STATION</span>
              </span>
              <span className="mt-1 text-[11px] tracking-[0.35em] text-slate-400 uppercase">
                VENDORS
              </span>
            </div>
          </Link>

          {/* RIGHT: nav – same structure as old design, plus Home */}
          <nav className="flex items-center gap-3 text-xs sm:text-sm font-medium">

            <Link
              href="/"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Cart
            </Link>

            <Link
              href="/orders"
              className="hidden rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white sm:inline-flex"
            >
              My orders
            </Link>

            <Link
              href="/login"
              className="rounded-full bg-slate-50 px-5 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition hover:bg-white active:scale-95"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}