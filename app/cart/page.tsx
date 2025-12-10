'use client'

import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cart</h1>
      <CartSummary />
    </div>
  )
}