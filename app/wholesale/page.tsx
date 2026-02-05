import type { Metadata } from 'next'
export const runtime = 'edge';

import { supabase, supabaseEnvReady } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import WholesaleGrid from '@/components/shop/WholesaleGrid'

export const metadata: Metadata = {
  title: 'Wholesale Quick Order | PUFFF Station',
  description: 'Bulk order portal for approved vendors.',
}

export default async function WholesalePage() {
  const products: Product[] = []
  
  if (supabaseEnvReady) {
    try {
      // Fetch all non-deleted products, ordered by name for easy scanning
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false)
        .order('name', { ascending: true })
      
      if (data) {
        products.push(...(data as Product[]))
      }
    } catch (e) {
      console.error('Wholesale fetch error', e)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-2">
              Vendor Portal
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
              Quick Order <span className="text-slate-700">{'///'}</span> Grid
            </h1>
            <p className="mt-4 text-slate-400 max-w-xl">
              Rapid-fire ordering for high volume vendors. Input your quantities and add everything to cart in one click.
            </p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
               Current Catalog Status
             </div>
             <div className="text-2xl font-black text-white">
               {products.length} Items
             </div>
          </div>
        </div>

        <WholesaleGrid products={products} />
      </div>
    </main>
  )
}
