import type { Metadata } from 'next'
export const runtime = 'edge';
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'
import './smoke.css'

import AgeGate from '@/components/age/AgeGate'
import LuxeAtmosphere from '@/components/ui/LuxeAtmosphere'
import { CartProvider } from '@/components/cart/CartContext'
import HeaderLinks from '@/components/nav/HeaderLinks'
import BackButton from '@/components/nav/BackButton'
import AndroidMotionGate from '@/components/utils/AndroidMotionGate'
import Footer from '@/components/layout/Footer'
import WhatsAppSupport from '@/components/support/WhatsAppSupport'
import AddToCartToast from '@/components/ui/AddToCartToast'
import Marquee from '@/components/ui/Marquee'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pufffstation.co.za'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PUFFF Station Vendors SA | Premium Disposables',
    template: '%s | PUFFF Station Vendors SA',
  },
  description: 'Premium disposable vape storefront for South African vendors. Clean stock, fast dispatch, and reliable support.',
  keywords: ['vaping', 'disposables', 'South Africa', 'luxury vapes', 'neon aesthetic', 'PUFFF Station'],
  authors: [{ name: 'PUFFF Station Vendors SA' }],
  creator: 'PUFFF Station Vendors SA',
  publisher: 'PUFFF Station Vendors SA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: siteUrl,
    title: 'PUFFF Station Vendors SA | Premium Disposables',
    description: 'Premium disposable vape storefront for South African vendors. Clean stock, fast dispatch, and reliable support.',
    siteName: 'PUFFF Station Vendors SA',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'PUFFF Station Vendors SA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUFFF Station Vendors SA | Premium Disposables',
    description: 'Premium disposable vape storefront for South African vendors. Clean stock, fast dispatch, and reliable support.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <CartProvider>
          <AndroidMotionGate />
          <LuxeAtmosphere />
          <AgeGate />
          <WhatsAppSupport />
          <AddToCartToast />
          <div className="min-h-screen">
             <Marquee />
            <header className="sticky top-0 z-50 border-b border-white/[0.03] bg-slate-950/60 backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-3">
                  <BackButton />
                  <Link href="/" className="group flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-slate-800/60 bg-slate-950/40 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                    <div className="absolute inset-0 pufff-haze opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-950/40 to-slate-900/60" />
                    <Image
                      src="/logo.png"
                      alt="PUFFF Station"
                      fill
                      sizes="56px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="relative">
                    <div className="text-base font-extrabold tracking-tight text-white lg:text-lg">
                      PUFFF Station
                    </div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 lg:text-xs">
                      Vendors SA
                    </div>
                    <span className="absolute -bottom-2 left-0 h-[1.5px] w-16 rounded-full bg-gradient-to-r from-cyan-500/50 via-emerald-400/40 to-amber-300/40 opacity-60" />
                  </div>
                </Link>
                </div>

                <HeaderLinks />

              </div>
            </header>

            <main className="min-h-[calc(100vh-180px)]">{children}</main>

            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
