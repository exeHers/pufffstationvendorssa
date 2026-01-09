import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'
import './smoke.css'

import AgeGate from '@/components/age/AgeGate'
import LuxeAtmosphere from '@/components/ui/LuxeAtmosphere'
import { CartProvider } from '@/components/cart/CartContext'
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
            <header className="sticky top-0 z-50 border-b border-slate-800/40 bg-slate-950/24 backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
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
                    <span className="absolute -bottom-2 left-0 h-[2px] w-16 rounded-full bg-gradient-to-r from-cyan-400/70 via-fuchsia-400/70 to-purple-400/70 opacity-70 blur-[1px]" />
                  </div>
                </Link>

                <HeaderLinks />

              </div>
            </header>

            <main className="min-h-[calc(100vh-180px)]">{children}</main>

            <footer className="mt-14 border-t border-slate-800/70 bg-slate-950/70">
              <div className="mx-auto w-full max-w-6xl px-4 py-12">
                <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                  <div>
                    <div className="text-sm font-extrabold text-white">
                      PUFFF Station Vendors SA
                    </div>
                    <div className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                      Premium disposables intended for adults only. 18+ required.
                      <span className="block mt-2 text-slate-500">
                        Support: support@pufffstationsa.co.za
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <div className="text-[10px] text-slate-500">Policies</div>
                    <Link href="/terms" className="block transition hover:text-white">
                      Terms &amp; Conditions
                    </Link>
                    <Link href="/privacy" className="block transition hover:text-white">
                      Privacy Policy
                    </Link>
                    <Link href="/refunds" className="block transition hover:text-white">
                      Refunds &amp; Returns
                    </Link>
                  </div>

                  <div className="space-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <div className="text-[10px] text-slate-500">Quick Links</div>
                    <Link href="/support" className="block transition hover:text-white">
                      Support
                    </Link>
                    <Link href="/shop" className="block transition hover:text-white">
                      Shop
                    </Link>
                    <Link href="/" className="block transition hover:text-white">
                      Home
                    </Link>
                    <a
                      href="https://instagram.com"
                      className="block transition hover:text-white"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 border-t border-slate-800/60 pt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>© {new Date().getFullYear()} PUFFF Station Vendors SA</span>
                  <span>Adults only. 18+.</span>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}

