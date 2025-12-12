import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/products/ProductCard'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const products = (data ?? []) as Product[]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          Disposables · Flavours · Stock
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Shop the stash
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          Browse what’s available, add to cart, and carry on. No kak surprises.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Eish… shop didn’t load. Check Supabase + your env keys.
        </div>
      )}

      {!error && products.length === 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-300">
          Nothing in stock yet. Admin must load products first.
        </div>
      )}

      {products.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </main>
  )
}