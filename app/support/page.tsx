import type { Metadata } from 'next'
import SupportClient from './SupportClient'

export const metadata: Metadata = {
  title: 'Customer Support',
  description: 'Need help with your PUFFF Station order? Submit a support ticket and we’ll get back to you ASAP.',
}

export default function Page() {
  return <SupportClient />
}
