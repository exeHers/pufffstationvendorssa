'use client'

import { useCart } from './CartProvider'

export default function CartSummary() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
        Your cart is empty.
      </div>
    )
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li
            key={item.product.id}
            className="flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{item.product.name}</div>
              <div className="text-xs text-slate-400">
                Qty: {item.quantity}
              </div>
            </div>
            <div className="text-sm font-semibold">
              R{' '}
              {(
                Number(item.product.price) * item.quantity
              ).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4 text-sm font-semibold">
        <span>Total</span>
        <span>R {total.toFixed(2)}</span>
      </div>
    </div>
  )
}