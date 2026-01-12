'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/cart/CartContext'
import { supabase } from '@/lib/supabaseClient'

type DeliveryMode = 'door' | 'pudo'

export default function CheckoutClient() {
  const router = useRouter()
  const { items, clearCart } = useCart()

  const subtotal = useMemo(() => {
    return items.reduce((total: number, item: any) => {
      const p = item.price !== null && item.price !== undefined ? Number(item.price) : 0
      const q = item.quantity !== null && item.quantity !== undefined ? Number(item.quantity) : 0
      if (Number.isNaN(p) || Number.isNaN(q)) return total
      return total + p * q
    }, 0)
  }, [items])

  const [userEmail, setUserEmail] = useState('')
  const [mode, setMode] = useState<DeliveryMode>('door')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [doorAddress, setDoorAddress] = useState('')
  const [pudoLocation, setPudoLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace('/login?next=/checkout')
        return
      }
      setUserEmail(user.email ?? '')
    })
  }, [router])

  const canCheckout = items.length > 0

  async function createOrderAndPay() {
    setError(null)
    if (!canCheckout) {
      setError('Your cart is empty.')
      return
    }

    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!phone.trim()) return setError('Please enter your phone number.')

    if (mode === 'door' && !doorAddress.trim()) {
      return setError('Please enter your delivery address.')
    }
    if (mode === 'pudo' && !pudoLocation.trim()) {
      return setError('Please enter the PUDO/locker location details.')
    }

    // Guard: if Ozow env vars aren't configured, don't pretend we can take payment.
    const ozowConfigured = Boolean(process.env.NEXT_PUBLIC_OZOW_ENABLED)
    if (!ozowConfigured) {
      setError(
        'Ozow is not configured yet. Add your Ozow keys to .env.local and set NEXT_PUBLIC_OZOW_ENABLED=true to enable payments.'
      )
      return
    }

    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/checkout')
        return
      }

      // 1) Create order (pending payment)
      const orderPayload: any = {
        user_id: user.id,
        status: 'pending_payment',
        total_amount: subtotal,
        currency: 'ZAR',
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: user.email ?? userEmail,
        delivery_type: mode,
        courier_name: 'Courier Guy / PUDO',
        notes: notes.trim() || null,
      }

      if (mode === 'door') {
        orderPayload.delivery_address = doorAddress.trim()
      } else {
        orderPayload.delivery_location = `Courier Guy / PUDO\n${pudoLocation.trim()}`
      }

      const { data: created, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('*')
        .single()

      if (orderErr) throw orderErr
      const orderId = created.id as string

      // 2) Insert order items
      const itemRows = items.map((it: any) => ({
        order_id: orderId,
        product_id: it.id,
        name: it.name,
        price: Number(it.price ?? 0),
        qty: Number(it.quantity ?? 1),
        image_url: it.image_url ?? null,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(itemRows)
      if (itemsErr) throw itemsErr

      // 3) Kick off Ozow payment
      const res = await fetch('/api/ozow/initiate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Payment initiation failed.')
      }

      const body = (await res.json()) as { redirectUrl: string }
      // Clear local cart before redirect (so user doesn't double-order)
      clearCart()
      window.location.href = body.redirectUrl
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            CHECKOUT
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Delivery + Payment
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Logged in as <span className="font-semibold text-slate-100">{userEmail || '...'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/cart"
            className="w-full rounded-full border border-slate-700 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-[#D946EF] hover:text-[#D946EF] sm:w-auto"
          >
            Back to cart
          </Link>
          <Link
            href="/shop"
            className="w-full rounded-full bg-[#D946EF] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] transition hover:brightness-110 active:scale-95 sm:w-auto"
          >
            Shop
          </Link>
        </div>
      </header>

      {!canCheckout && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <p className="text-sm font-semibold text-slate-100">Your cart is empty.</p>
          <p className="mt-1 text-xs text-slate-400">Go add a few items before checkout.</p>
        </section>
      )}

      {canCheckout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <section className="space-y-4 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              Delivery details
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Full name
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Your name and surname"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Phone
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="e.g. 072 123 4567"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Delivery method
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode('door')}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
                    mode === 'door'
                      ? 'bg-fuchsia-500 text-white shadow-[0_0_22px_rgba(217,70,239,0.85)]'
                      : 'border border-slate-800 bg-slate-950/60 text-slate-200 hover:border-fuchsia-500'
                  }`}
                >
                  Door delivery
                </button>
                <button
                  type="button"
                  onClick={() => setMode('pudo')}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
                    mode === 'pudo'
                      ? 'bg-fuchsia-500 text-white shadow-[0_0_22px_rgba(217,70,239,0.85)]'
                      : 'border border-slate-800 bg-slate-950/60 text-slate-200 hover:border-fuchsia-500'
                  }`}
                >
                  Courier Guy / PUDO
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Same provider. Choose door delivery for convenience, or PUDO/locker if that suits you.
              </p>
            </div>

            {mode === 'door' ? (
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Door delivery address
                </span>
                <textarea
                  value={doorAddress}
                  onChange={(e) => setDoorAddress(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Street address, suburb, city, province, postal code"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  PUDO / locker location (text for now)
                </span>
                <textarea
                  value={pudoLocation}
                  onChange={(e) => setPudoLocation(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Paste the locker/PUDO location address, locker name/code, and any notes"
                />
              </label>
            )}

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Notes (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                placeholder="Gate code, delivery instructions, etc."
              />
            </label>
          </section>

          <aside className="space-y-4 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
              Summary
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
                <span>Calculated by the shop</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Cart items
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                {items.map((it: any) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <span className="truncate">{it.name}</span>
                    <span className="text-slate-400">x{Number(it.quantity ?? 1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="text-xs font-semibold text-slate-300">Total</span>
              <span className="text-lg font-extrabold text-white">R {subtotal.toFixed(2)}</span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              disabled={loading || !canCheckout}
              onClick={createOrderAndPay}
              className="mt-2 w-full rounded-full bg-[#D946EF] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(217,70,239,0.8)] hover:brightness-110 active:scale-95 disabled:opacity-60 transition"
            >
              {loading ? 'Starting payment…' : 'Pay with Ozow'}
            </button>

            <p className="text-[11px] text-slate-400">
              After payment, you'll receive a full invoice email and your order will show under <Link href="/orders" className="text-fuchsia-300 hover:text-fuchsia-200">My orders</Link>.
            </p>
          </aside>
        </motion.div>
      )}
    </main>
  )
}
