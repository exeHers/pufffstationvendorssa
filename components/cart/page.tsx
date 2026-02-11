'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartContext'

export default function CartPage() {
  const { items, removeFromCart, clearCart, updateQuantity, subtotal } = useCart()
  const router = useRouter()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Your Cart
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your stash, ready to move.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Check your items, adjust quantities, and remove anything you do not want. No stress.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/shop"
            className="rounded-full border border-slate-700 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
          >
            Back to shop
          </Link>

          <button
            type="button"
            onClick={clearCart}
            disabled={items.length === 0}
            className="rounded-full bg-slate-800/70 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear cart
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-8 text-center">
          <p className="text-sm text-slate-300">
            Dry hit! Your cart is empty. Go juice it up.
          </p>
          <div className="mt-4">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-cyan-600 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_0_22px_rgba(6,182,212,0.45)] transition hover:brightness-110 active:scale-95"
            >
              Browse shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr,0.9fr]">
          <section className="space-y-4">
            {items.map((item) => {
              const price = Number(item.price) || 0
              const lineTotal = price * item.quantity

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-900/70">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      {item.description ? (
                        <p className="max-w-lg text-[11px] text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500">Lekker choice.</p>
                      )}
                      <p className="text-[11px] font-semibold text-slate-300">
                        R {price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/40 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-full text-slate-200 transition hover:bg-slate-800/60"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="min-w-[2ch] text-center text-[12px] font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-full text-slate-200 transition hover:bg-slate-800/60"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">Line total</p>
                      <p className="text-sm font-extrabold text-white">
                        R {lineTotal.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-full border border-red-400/40 bg-red-950/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-200 transition hover:border-red-400 hover:bg-red-950/40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-200">
              Order summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="h-px w-full bg-slate-800" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Total</span>
                <span className="text-lg font-extrabold text-white">
                  R {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-full bg-cyan-600 px-6 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(6,182,212,0.45)] transition hover:brightness-110 active:scale-95"
              onClick={() => router.push('/checkout')}
            >
              Checkout
            </button>

            <p className="mt-3 text-[11px] text-slate-500">
              Secure payment via WhatsApp EFT. Yoco card checkout is coming soon.
            </p>
          </aside>
        </div>
      )}
    </main>
  )
}
