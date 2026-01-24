import type { Metadata } from 'next'
import CartPage from '@/app/cart/CartClient'

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your PUFFF Station order. Fast dispatch, premium checkout.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <CartPage />
}
