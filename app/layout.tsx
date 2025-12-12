import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/components/cart/CartContext'
import SupportWidget from '@/components/support/SupportWidget'

export const metadata: Metadata = {
  title: 'PUFFF Station Vendors',
  description: 'Disposable vapes and lekker stock — powered by Supabase.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020617] text-slate-50">
        <CartProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.10),_transparent_60%)]">
            <Header />
            {children}
            <Footer />
            <SupportWidget />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}