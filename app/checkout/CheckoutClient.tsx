'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/cart/CartContext'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'

// Dynamic import for Map to avoid SSR errors
const PudoMap = dynamic(() => import('@/components/checkout/PudoMap'), { ssr: false })

type DeliveryMode = 'door' | 'pudo'
type PaymentMethod = 'ozow' | 'whatsapp'

export default function CheckoutClient() {
  const router = useRouter()
  const { items, clearCart } = useCart()

  const subtotal = useMemo(() => {
    return items.reduce((total: number, item) => {
      const p = item.price !== null && item.price !== undefined ? Number(item.price) : 0
      const q = item.quantity !== null && item.quantity !== undefined ? Number(item.quantity) : 0
      if (Number.isNaN(p) || Number.isNaN(q)) return total
      return total + p * q
    }, 0)
  }, [items])

  const [userEmail, setUserEmail] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('door')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ozow')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [doorAddress, setDoorAddress] = useState('')
  const [pudoLocation, setPudoLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace('/login?next=/checkout')
        return
      }
      setUserEmail(user.email ?? '')
      
      // Auto-fill from profile if possible
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            if (profile.full_name) setFullName(profile.full_name)
            if (profile.phone) setPhone(profile.phone)
          }
        })
    })
  }, [router])

  const canCheckout = items.length > 0

  async function handleCheckout() {
    setError(null)
    if (!canCheckout) return setError('Your cart is empty.')
    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!phone.trim()) return setError('Please enter your phone number.')

    if (deliveryMode === 'door' && !doorAddress.trim()) {
      return setError('Please enter your delivery address.')
    }
    if (deliveryMode === 'pudo' && !pudoLocation.trim()) {
      return setError('Please enter the PUDO/locker location details.')
    }

    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) throw new Error('Session expired. Please login again.')

      // 1) Create order record
      const orderPayload = {
        user_id: user.id,
        status: 'pending_payment',
        total_amount: subtotal,
        currency: 'ZAR',
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: user.email ?? userEmail,
        delivery_type: deliveryMode,
        courier_name: 'Courier Guy / PUDO',
        delivery_notes: notes.trim() || null,
        payment_provider: paymentMethod
      }

      if (deliveryMode === 'door') {
        ;(orderPayload as any).address_line1 = doorAddress.trim()
      } else {
        ;(orderPayload as any).pudo_location = pudoLocation.trim()
      }

      const { data: created, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('*')
        .single()

      if (orderErr) throw orderErr
      const orderId = created.id

      // 2) Insert items
      const itemRows = items.map((it) => ({
        order_id: orderId,
        product_id: it.id,
        name: it.name,
        price: Number(it.price ?? 0),
        qty: Number(it.quantity ?? 1),
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(itemRows)
      if (itemsErr) throw itemsErr

      if (paymentMethod === 'ozow') {
        const res = await fetch('/api/ozow/initiate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        if (!res.ok) throw new Error('Ozow initiation failed.')
        const body = await res.json()
        clearCart()
        window.location.href = body.redirectUrl
      } else {
        // WHATSAPP FLOW
        const cartText = items.map(it => {
           const lineTotal = (Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)
           return `- ${it.quantity} x ${it.name} (R${lineTotal})`
        }).join('%0A')
        
        const addressText = deliveryMode === 'door' ? doorAddress.trim() : `PUDO: ${pudoLocation.trim()}`
        
        const message = `*NEW ORDER REQUEST*%0A` +
          `Ref: ${orderId.slice(0, 8)}%0A%0A` +
          `*Customer:* ${fullName.trim()}%0A` +
          `*Phone:* ${phone.trim()}%0A` +
          `*Email:* ${user.email}%0A%0A` +
          `*Order Details:*%0A${cartText}%0A%0A` +
          `*Delivery Mode:* ${deliveryMode === 'door' ? 'Door' : 'PUDO'}%0A` +
          `*Location:* ${addressText}%0A%0A` +
          `*TOTAL: R ${subtotal.toFixed(2)}*%0A%0A` +
          `Please confirm stock and send banking details to proceed.`;

        const waNumber = "27712065512" 
        clearCart()
        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
        router.push('/orders')
      }
    } catch (e: any) {
      setError(e.message ?? 'Checkout failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      <header className="border-b border-slate-800/70 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">CHECKOUT</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase italic">Finalize Transmission</h1>
      </header>

      {canCheckout && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">1. Identify Recipient</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (+27...)" className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500" />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">2. Logistics Terminal</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex gap-2">
                  {['door', 'pudo'].map(m => (
                    <button key={m} onClick={() => setDeliveryMode(m as DeliveryMode)} className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition ${deliveryMode === m ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'border border-slate-800 text-slate-500 hover:text-white'}`}>
                      {m === 'door' ? 'Door Delivery' : 'PUDO Locker'}
                    </button>
                  ))}
                </div>
                
                {deliveryMode === 'pudo' && (
                  <button 
                    onClick={() => setMapOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-violet-400 animate-pulse" />
                    Find a Locker
                  </button>
                )}
              </div>
              <textarea 
                value={deliveryMode === 'door' ? doorAddress : pudoLocation} 
                onChange={e => {
                  if (deliveryMode === 'door') {
                    setDoorAddress(e.target.value)
                  } else {
                    setPudoLocation(e.target.value)
                  }
                }} 
                placeholder={deliveryMode === 'door' ? "Street Address, Suburb, City, Code" : "PUDO Locker Name or Address"} 
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500 min-h-[100px]" 
              />
            </section>

            <section className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">3. Payment Channel</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => setPaymentMethod('ozow')} className={`flex flex-col items-start rounded-2xl border p-4 transition ${paymentMethod === 'ozow' ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800 bg-slate-950/60'}`}>
                  <span className="text-xs font-bold text-white">Instant EFT (Ozow)</span>
                  <span className="text-[10px] text-slate-500">Secure digital payment</span>
                </button>
                <button onClick={() => setPaymentMethod('whatsapp')} className={`flex flex-col items-start rounded-2xl border p-4 transition ${paymentMethod === 'whatsapp' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/60'}`}>
                  <span className="text-xs font-bold text-white">Manual via WhatsApp</span>
                  <span className="text-[10px] text-slate-500">Chat & Pay manually</span>
                </button>
              </div>
            </section>
          </div>

          <aside className="h-fit sticky top-24 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 p-6">
             <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Final Tally</h2>
             <div className="space-y-3 mb-6">
                {items.map(it => (
                  <div key={it.id} className="flex justify-between text-xs">
                    <span className="text-slate-400">{it.name} <span className="text-slate-600 ml-1">x{it.quantity}</span></span>
                    <span className="text-white font-bold">R {(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
             </div>
             <div className="flex justify-between items-center border-t border-slate-800 pt-4 mb-6">
               <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Due</span>
               <span className="text-2xl font-black text-white italic">R {subtotal.toFixed(2)}</span>
             </div>

             {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-xl mb-4">{error}</div>}

             <button 
               disabled={loading} 
               onClick={handleCheckout} 
               className={`w-full py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition active:scale-95 ${
                 paymentMethod === 'ozow' 
                   ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500' 
                   : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500'
               }`}
             >
               {loading ? 'Processing...' : paymentMethod === 'ozow' ? 'Authorize Payment' : 'Initialize WhatsApp'}
             </button>
          </aside>
        </div>
      )}

      {/* PUDO Map Modal */}
      {mapOpen && (
        <Suspense fallback={null}>
          <PudoMap 
            onClose={() => setMapOpen(false)}
            onSelect={(locker) => {
              setPudoLocation(`${locker.name} - ${locker.address}`)
              setMapOpen(false)
            }}
          />
        </Suspense>
      )}
    </main>
  )
}
