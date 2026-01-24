import type { Metadata } from 'next'
import OrdersClient from './OrdersClient'

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track your PUFFF Station orders and delivery status.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <OrdersClient />
}
