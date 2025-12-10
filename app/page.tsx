import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-950 p-8 shadow-xl sm:p-10">
        <div className="space-y-6 sm:max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
            PufffstationvendorsSA
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Stocked up on{' '}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              your favourites
            </span>
            .
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Browse our current flavours and devices. All products are managed
            directly from our Supabase inventory so you see what&apos;s really
            available.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/shop"
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white active:scale-95"
            >
              View products
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-slate-500/60 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-300/80 active:scale-95"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-100">
          How the store works
        </h2>
        <div className="mt-3 grid gap-4 text-xs text-slate-300 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Live inventory</p>
            <p>Products are loaded directly from the Supabase products table.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Simple cart</p>
            <p>Add items to a basic cart for testing the flow and layout.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Fully editable</p>
            <p>
              You can tweak styling, pricing, and product fields without
              touching the core code.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}