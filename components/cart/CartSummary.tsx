'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export default function CartSummary() {
  const { items, totalPrice, totalQuantity, removeFromCart, clearCart } =
    useCart()

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Your cart</h1>
        <p className="text-sm text-slate-300">
          Cart is empty, bru. Go add a few flavours in the shop.
        </p>
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-[#D946EF] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Your cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-medium text-slate-400 hover:text-red-300"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-3 py-3 text-sm text-slate-100 sm:px-4"
          >
            <div className="flex flex-1 flex-col">
              <span className="font-semibold">{item.name}</span>
              <span className="text-xs text-slate-400">
                Qty: {item.quantity} • R {item.price.toFixed(2)} each
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">
                R {(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300 hover:border-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 sm:px-5">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Total items
          </span>
          <span className="text-base font-semibold">{totalQuantity}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Total
          </span>
          <span className="text-base font-semibold">
            R {totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        This is just a preview cart for now. Once your cousin&apos;s ready for
        full checkout, we hook it up to real payments.
      </p>
    </div>
  )
}