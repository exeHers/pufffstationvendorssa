import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-xs font-bold text-slate-950">
            PS
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">
              PufffstationvendorsSA
            </p>
            <p className="text-[10px] text-slate-400">
              Product preview dashboard
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-xs sm:text-sm">
          <Link
            href="/shop"
            className="rounded-full px-3 py-1 text-slate-200 transition hover:bg-slate-800"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-slate-600 px-3 py-1 text-slate-100 transition hover:border-slate-300"
          >
            Cart
          </Link>
        </nav>
      </div>
    </header>
  )
}