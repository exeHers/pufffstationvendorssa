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
      {/* Header / banner */}
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Shop
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Available products
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Data pulled straight from the <code>products</code> table in
              Supabase.
            </p>
          </div>
          <div className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
            <span className="text-slate-100">
              {products.length}
            </span>{' '}
            item{products.length === 1 ? '' : 's'} loaded
          </div>
        </div>
      </section>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-300">
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