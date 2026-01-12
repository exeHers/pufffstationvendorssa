import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your PUFFF Station order. Secure payment with Ozow.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <CheckoutClient />
}
