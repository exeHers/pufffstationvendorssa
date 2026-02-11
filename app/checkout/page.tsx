import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your PUFFF Station order. WhatsApp EFT is live and Yoco card checkout is coming soon.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <CheckoutClient />
}
