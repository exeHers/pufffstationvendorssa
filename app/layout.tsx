import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import './smoke.css'

import AgeGate from '@/components/age/AgeGate'
import LuxeAtmosphere from '@/components/ui/LuxeAtmosphere'
import { CartProvider } from '@/components/cart/CartContext'
import CartBadge from '@/components/cart/CartBadge'
import HeaderLinks from '@/components/nav/HeaderLinks'
import AndroidMotionGate from '@/components/utils/AndroidMotionGate'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pufffstation.co.za'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PUFFF Station Vendors SA',
    template: '%s | PUFFF Station Vendors SA',
  },
  description: 'Premium disposables. Maximum impact.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'PUFFF Station Vendors SA',
    description: 'Premium disposables. Maximum impact.',
    siteName: 'PUFFF Station Vendors SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUFFF Station Vendors SA',
    description: 'Premium disposables. Maximum impact.',
  },
  icons: {
    icon: '/favicon.ico',
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
        <AndroidMotionGate />
        <LuxeAtmosphere />
        <AgeGate />

        <CartProvider>
          <div className="min-h-screen">
            <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/55 backdrop-blur-md relative">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40">
                    <div className="absolute inset-0 pufff-haze opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-950/40 to-slate-900/60" />
                    <div className="relative flex h-full w-full items-center justify-center text-sm font-black tracking-tight text-white">
                      P
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-extrabold tracking-tight text-white">
                      PUFFF Station
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                      Vendors SA
                    </div>
                  </div>
                </Link>

                <HeaderLinks />

                <div className="flex items-center gap-3">
                  <Link
                    href="/cart"
                    className="relative inline-flex items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-slate-700/80"
                  >
                    Cart
                    <CartBadge />
                  </Link>
                </div>
              </div>
            </header>

            <main className="min-h-[calc(100vh-180px)]">{children}</main>

            <footer className="mt-14 border-t border-slate-800/60 bg-slate-950/40">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-extrabold text-white">
                    PUFFF Station Vendors SA
                  </div>
                  <div className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                    Premium disposables intended for adults only. 18+ required.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Link href="/support" className="transition hover:text-white">
                    Support
                  </Link>
                  <Link href="/shop" className="transition hover:text-white">
                    Shop
                  </Link>
                  <Link href="/" className="transition hover:text-white">
                    Home
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
