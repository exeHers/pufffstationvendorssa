import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartProvider from '@/components/cart/CartProvider'

export const metadata: Metadata = {
  title: 'PufffstationvendorsSA',
  description: 'PufffstationvendorsSA • Online store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
            </main>
            <Footer />
          </div>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}