'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart, type CartItem } from '@/components/cart/CartContext'

export default function CartPage() {
  const { items, removeFromCart, clearCart, updateQuantity, subtotal } = useCart()

  const hasItems = items.length > 0

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      {/* Page header */}
      <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            CART · YOUR STASH
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Your PUFFF Station Order
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Check your items my bru. Checkout for that quick FIX!
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/"
            className="w-full rounded-full border border-white/[0.08] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-violet-500/50 hover:text-violet-400 sm:w-auto"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="w-full rounded-full bg-violet-600 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-violet-500 active:scale-95 sm:w-auto"
          >
            Back to Shop
          </Link>
        </div>
      </header>

      {/* Empty state */}
      {!hasItems && (
        <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/90 px-6 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
          <p className="text-sm font-semibold text-slate-100">
            Haibo, your cart is mos empty, my bru.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Go hit the stash and add a few flavours before you try to checkout. No ghost orders here.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-violet-600 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-violet-500 active:scale-95"
            >
              Browse the Stash
            </Link>
          </div>
        </section>
      )}

      {/* Cart content */}
      <AnimatePresence mode="wait">
        {hasItems ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 lg:grid-cols-[2fr,1fr]"
          >
            {/* Items list */}
            <section className="space-y-4 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
                  ITEMS IN CART
                </h2>
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 hover:text-red-400 transition"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item: CartItem) => {
                    const priceNumber = Number(item.price) || 0
                    const lineTotal = priceNumber * (item.quantity ?? 1)

                    return (
                      <motion.article
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 sm:flex-row sm:items-center"
                      >
                    {/* Image */}
                    <div className="h-20 w-full overflow-hidden rounded-xl bg-slate-900/80 sm:h-20 sm:w-24">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                          PUFFF
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-slate-50">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          R {priceNumber.toFixed(2)} each
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>In the stash and ready to move.</span>
                        </div>
                      </div>

                      {/* Quantity + remove */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, (item.quantity ?? 1) - 1))
                            }
                            className="px-2 text-slate-300 hover:text-white"
                          >
                            -
                          </button>
                          <span className="min-w-[2ch] text-center">
                            {item.quantity ?? 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity ?? 1) + 1)
                            }
                            className="px-2 text-slate-300 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-red-400 transition"
                        >
                          Remove
                        </button>

                        {/* Line total */}
                        <p className="text-sm font-semibold text-slate-50">
                          R {lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                      </motion.article>
                    )
                  })}
                </AnimatePresence>
              </div>
            </section>

            {/* Summary / checkout side */}
            <aside className="space-y-4 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              ORDER SUMMARY
            </h2>

            <div className="space-y-2 text-sm text-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Subtotal</span>
                <span>R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Delivery</span>
                <span>Calculated when your cousin confirms the drop-off</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="text-xs font-semibold text-slate-300">
                Estimated total
              </span>
              <span className="text-lg font-extrabold text-white">
                R {subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Once you're happy, send this order through. No worries, your info and
              chelete stay safe. We provide safe and trustworthy services, not some dodgy street corner deal.
            </p>

            <Link
              href="/checkout"
              className="mt-2 block w-full rounded-full bg-violet-600 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-violet-500 active:scale-95"
            >
              Checkout & Pay
            </Link>
            <Link
              href="/shop"
              className="block w-full rounded-full border border-slate-700 px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-slate-500"
            >
              Continue shopping
            </Link>

            <p className="pt-2 text-[10px] text-right text-slate-500">
              Site by <span className="font-semibold text-slate-200">DNVN Digital</span>
            </p>
            </aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
