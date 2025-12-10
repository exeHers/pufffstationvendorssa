import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/products/ProductCard'

export const revalidate = 30

export default async function ShopPage() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
  }

  const products = (data ?? []) as Product[]

  return (
    <div className="space-y-8">
      {/* Top section */}
      <section className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">
          Shop
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Available products
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              Inventory pulled live from the <code>products</code> table in
              Supabase. Update the table and this page updates with it.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{products.length} item{products.length === 1 ? '' : 's'} loaded</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Powered by Supabase & Next.js
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-sm text-slate-300">
          No products found in the <code>products</code> table.
        </div>
      ) : (
        <section>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}