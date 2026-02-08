import type { Metadata } from 'next'
export const runtime = 'edge';

import Image from 'next/image'
import Link from 'next/link'
import { supabase, supabaseEnvReady } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import FlavourPicker from '@/components/home/FlavourPicker'
import ReviewFeed from '@/components/shop/ReviewFeed'
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo'
import { fetchActiveFlavours } from '@/lib/flavours'
import ProductCard from '@/components/products/ProductCard'

export const metadata: Metadata = {
  title: 'TEST-BUILD - Clean Stock. Premium Drops.',
  description: 'Fast dispatch, premium checkout, and official PUFFF Station drops. Built for SA vendors who want it smooth and legit.',
  openGraph: {
    title: 'TEST-BUILD - Clean Stock. Premium Drops.',
    description: 'Fast dispatch, premium checkout, and official PUFFF Station drops. Built for SA vendors who want it smooth and legit.',
  },
}

export const dynamic = 'force-dynamic'

function getCategory(product: Product) {
  const p: any = product
  const value = (p.category || '').toString().trim()
  return value || 'Disposable'
}

export default async function HomePage() {
  const flavours = await fetchActiveFlavours()
  const products: Product[] = []
  let featuredSettings = { enabled: true, title: 'Featured Drops', description: 'Our top picks.' }

  if (supabaseEnvReady) {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_deleted', false).eq('is_featured', true).order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'featured_drops').single()
      ])

      if (productsRes.data) products.push(...(productsRes.data as Product[]))
      if (settingsRes.data) featuredSettings = { ...featuredSettings, ...settingsRes.data.value }
    } catch (error) {
      console.error('Home Page Data Fetch Error:', error)
    }
  }

  return (
    <main className="relative w-full text-white overflow-x-hidden min-h-screen bg-transparent">
      
      <HomeBackgroundVideo />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center z-10">
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start justify-center gap-16 px-6 pb-20 pt-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[600px]">
            <p className="hero-fade hero-fade-1 text-[11px] font-bold uppercase tracking-[0.4em] text-cyan-200/90 mb-6">
              PUFFF Station Vendors SA
            </p>

            <h1 className="hero-fade hero-fade-2 text-5xl font-black tracking-tighter text-white sm:text-6xl lg:text-[4.5rem] leading-[0.9]">
              <span className="block text-white">Clean stock.</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Premium Drops.
              </span>
            </h1>

            <p className="hero-fade hero-fade-3 mt-8 max-w-lg text-sm font-medium leading-relaxed text-slate-300/90 sm:text-base tracking-wide">
              No Eskom Promises. Just verified stock, fast dispatch, and the smoothest checkout in SA.
            </p>

            <div className="hero-fade hero-fade-3 mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="group relative overflow-hidden rounded-none bg-white px-10 py-4 text-xs font-black uppercase tracking-[0.25em] text-black transition-transform duration-300 hover:-translate-y-1 active:scale-95"
              >
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-cyan-300 transition-transform duration-300 ease-out mix-blend-multiply" />
              </Link>

              <Link
                href="/wholesale"
                className="group px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:text-cyan-200"
              >
                Bulk Order
              </Link>
            </div>
          </div>

          {/* Hero Image / Stats */}
          <div className="w-full max-w-md hidden lg:block">
            <div className="relative p-8 border border-white/10 bg-black/40 backdrop-blur-md">
               <div className="space-y-6">
                  <div>
                    <h3 className="text-4xl font-black text-white">24h</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">Dispatch Time</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white">100%</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">Authentic Stock</p>
                  </div>
                  <div>
                     <h3 className="text-4xl font-black text-white">SA</h3>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">Local Delivery</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FLAVOUR PICKER --- */}
      <section className="relative z-20 mx-auto w-full max-w-7xl px-4 py-16">
        <FlavourPicker flavours={flavours} />
      </section>

      {/* --- FEATURED DROPS (NASTY LAYOUT) --- */}
      {featuredSettings.enabled && products.length > 0 ? (
        <section className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-24">
          
          {/* Section Header */}
          <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
                {featuredSettings.title}
             </h2>
             <div className="h-1 w-24 bg-cyan-500" />
             <p className="text-sm font-medium tracking-[0.2em] uppercase text-slate-400">
                {featuredSettings.description}
             </p>
          </div>

          {/* 
             NASTY GRID:
             - grid-cols-2 (mobile) -> grid-cols-4 (desktop)
             - gap-x-4 (mobile) -> gap-x-12 (desktop)
             - gap-y-16 (vertical spacing)
          */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 lg:gap-x-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <Link
              href="/shop"
              className="group relative px-12 py-4 border border-white/20 hover:border-white transition-colors duration-300"
            >
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">View All Drops</span>
            </Link>
          </div>
        </section>
      ) : null}

      <ReviewFeed />
    </main>
  )
}
