'use client'

import { useMemo, useState, useEffect } from 'react'
import { useCart } from '@/components/cart/CartContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { motion, AnimatePresence } from 'framer-motion'

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const PudoMap = useMemo(
    () => dynamic(() => import('@/components/checkout/PudoMap'), { ssr: false }),
    []
  )

  // Form State
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })

  // Delivery & Payment State
  const [deliveryMethod, setDeliveryMethod] = useState<'door' | 'pudo'>('door')
  const [pudoLocation, setPudoLocation] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'yoco' | 'whatsapp'>('whatsapp')
  const [showPudoMap, setShowPudoMap] = useState(false)

  // Calculate Totals
  const isFreeDelivery = subtotal >= 1000
  const deliveryFee = isFreeDelivery ? 0 : (deliveryMethod === 'door' ? 100 : 60)
  const total = subtotal + deliveryFee

  // Load User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || '',
            phone: profile.phone || ''
          }))
        }
      }
    }
    fetchProfile()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async () => {
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in your contact details.')
      return
    }

    if (deliveryMethod === 'door' && !formData.address) {
      alert('Please enter your delivery address.')
      return
    }

    if (deliveryMethod === 'pudo' && !pudoLocation) {
      alert('Please select a PUDO locker.')
      return
    }

    setLoading(true)
    const noteSuffix = formData.notes ? ` | Note: ${formData.notes}` : ''

    // 1. Create Order in Supabase
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id,
        total_amount: total,
        status: 'pending',
        shipping_address:
          deliveryMethod === 'pudo'
            ? `PUDO: ${pudoLocation}${noteSuffix}`
            : `${formData.address}, ${formData.city}, ${formData.postalCode}${noteSuffix}`,
        payment_method: paymentMethod,
        contact_number: formData.phone,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price, // Store price at time of purchase
          name: item.name
        }))
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order Error:', orderError)
      alert('Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    // 2. Handle Payment Redirect
    if (paymentMethod === 'whatsapp') {
      // Construct WhatsApp Message
      const itemsList = items
        .map((item) => `- ${item.quantity} x ${item.name} (R${item.price * item.quantity})`)
        .join('%0A')
      const deliveryText =
        deliveryMethod === 'pudo'
          ? `PUDO Locker: ${pudoLocation}`
          : `Delivery Address: ${formData.address}, ${formData.city}`

      const message =
        `*NEW ORDER REQUEST*%0A` +
        `Ref: #${order.id.slice(0, 8)}%0A%0A` +
        `Customer: ${formData.fullName}%0A` +
        `Phone: ${formData.phone}%0A%0A` +
        `Order Details:%0A${itemsList}%0A%0A` +
        `Delivery: ${deliveryMethod === 'door' ? 'Door-to-Door (fees included)' : `PUDO Locker (R${deliveryFee})`}%0A` +
        `${deliveryText}%0A%0A` +
        `TOTAL: R${total.toFixed(2)}%0A%0A` +
        `_Please confirm stock and send banking details._`

      // Clear cart and redirect
      clearCart()
      window.open(`https://wa.me/27712345678?text=${message}`, '_blank') // Replace with your number
      router.push('/success')
    } else {
      // Yoco Integration (Placeholder)
      alert('Yoco card checkout is coming soon. Please use WhatsApp for now.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">DRY HIT!</h1>
          <p className="text-slate-400 mb-8">Your cart is empty.</p>
          <Link href="/" className="bg-cyan-600 px-8 py-3 font-bold uppercase tracking-widest hover:bg-cyan-500 transition-colors">
            Reload
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-white pb-20">
      {/* Minimal Header */}
      <header className="border-b border-slate-900 py-6 mb-12">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="font-black text-2xl tracking-tighter">
            PUFFF<span className="text-cyan-400">.</span>
          </Link>
          <div className="text-xs font-mono text-slate-500">
            SECURE CHECKOUT // ENCRYPTED
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN - FORMS */}
        <div className="lg:col-span-7 space-y-20">
          
          {/* STEP 01: IDENTITY */}
          <section className="relative pl-16">
            <span className="absolute left-0 -top-4 text-8xl font-black text-slate-900 -z-10 select-none opacity-50">01</span>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-cyan-400">Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-slate-800 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                />
              </div>
              <div className="group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (WhatsApp)"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-slate-800 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>
          </section>

          {/* STEP 02: LOGISTICS */}
          <section className="relative pl-16">
            <span className="absolute left-0 -top-4 text-8xl font-black text-slate-900 -z-10 select-none opacity-50">02</span>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-cyan-500">Logistics</h2>

            {/* Delivery Method Selector */}
            <div className="flex gap-6 mb-8">
              <label className={`cursor-pointer px-6 py-3 border ${deliveryMethod === 'door' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500 hover:border-slate-600'} transition-all font-bold uppercase tracking-wider`}>
                <input
                  type="radio"
                  name="delivery"
                  value="door"
                  checked={deliveryMethod === 'door'}
                  onChange={() => setDeliveryMethod('door')}
                  className="hidden"
                />
                Door Delivery (Fees included)
              </label>
              <label className={`cursor-pointer px-6 py-3 border ${deliveryMethod === 'pudo' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500 hover:border-slate-600'} transition-all font-bold uppercase tracking-wider`}>
                <input
                  type="radio"
                  name="delivery"
                  value="pudo"
                  checked={deliveryMethod === 'pudo'}
                  onChange={() => setDeliveryMethod('pudo')}
                  className="hidden"
                />
                PUDO Locker (R60)
              </label>
            </div>

            {/* Dynamic Inputs based on Method */}
            <AnimatePresence mode="wait">
              {deliveryMethod === 'door' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-slate-800 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                  />
                  <div className="grid grid-cols-2 gap-8">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-slate-800 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      autoComplete="postal-code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-slate-800 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                    />
                  </div>
                  <textarea
                    name="notes"
                    placeholder="Delivery notes (optional)"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                    rows={3}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <p className="text-slate-400 text-sm">Select your preferred PUDO locker using the official map.</p>
                  
                  {/* Map Button */}
                  <button
                    onClick={() => {
                      setShowPudoMap(true)
                    }}
                    className="w-full bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 py-4 font-bold uppercase tracking-widest hover:bg-cyan-900/40 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Select Locker
                  </button>

                  <input
                    type="text"
                    onChange={(e) => setPudoLocation(e.target.value)}
                    value={pudoLocation}
                    placeholder="Selected locker location"
                    className="w-full bg-slate-900/50 border border-slate-800 p-4 text-white font-mono text-sm rounded"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* STEP 03: EXECUTION */}
          <section className="relative pl-16">
            <span className="absolute left-0 -top-4 text-8xl font-black text-slate-900 -z-10 select-none opacity-50">03</span>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-green-500">Execution</h2>

            <div className="space-y-4">
              <label className={`block cursor-pointer p-6 border ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-500/5' : 'border-slate-800 hover:border-slate-600'} transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-500' : 'border-slate-600'}`} />
                    <div>
                      <span className="block font-bold uppercase text-white">Manual via WhatsApp</span>
                      <span className="text-sm text-slate-500">Confirm stock & pay via EFT</span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  className="hidden"
                />
              </label>

              <label className={`block cursor-pointer p-6 border ${paymentMethod === 'yoco' ? 'border-slate-700 opacity-50' : 'border-slate-800 opacity-50'} transition-all`}>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-2 border-slate-600`} />
                    <div>
                      <span className="block font-bold uppercase text-slate-400">Card Checkout (Yoco)</span>
                      <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Currently Offline</span>
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="yoco"
                  disabled
                  className="hidden"
                />
              </label>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN - RECEIPT SUMMARY */}
        <div className="lg:col-span-5">
          <div className="sticky top-12">
            <div className="bg-white text-black p-8 font-mono relative pb-12" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), 95% 100%, 90% calc(100% - 20px), 85% 100%, 80% calc(100% - 20px), 75% 100%, 70% calc(100% - 20px), 65% 100%, 60% calc(100% - 20px), 55% 100%, 50% calc(100% - 20px), 45% 100%, 40% calc(100% - 20px), 35% 100%, 30% calc(100% - 20px), 25% 100%, 20% calc(100% - 20px), 15% 100%, 10% calc(100% - 20px), 5% 100%, 0 calc(100% - 20px))' }}>
              
              <div className="text-center border-b-2 border-dashed border-black pb-6 mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter">PUFFF RECEIPT</h3>
                <p className="text-xs mt-2">{new Date().toLocaleDateString()} {' | '} {new Date().toLocaleTimeString()}</p>
              </div>

              <div className="space-y-4 mb-8 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <span className="uppercase">{item.quantity} x {item.name}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-black pt-4 space-y-2 mb-8">
                <div className="flex justify-between text-sm">
                  <span>SUBTOTAL</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{deliveryMethod === 'door' ? 'DELIVERY FEES INCLUDED' : 'DELIVERY (PUDO)'}</span>
                  <span>R{deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end text-xl font-bold mb-8">
                <span>TOTAL</span>
                <span>R{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-slate-900 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? 'Processing...' : 'CONFIRM ORDER'}
                {!loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              </button>

              <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale">
                {/* Simple SVG Icons for Trust Badges */}
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[10px] mt-1 uppercase font-bold">Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="text-[10px] mt-1 uppercase font-bold">Instant</span>
                </div>
              </div>

            </div>
            
            {/* Free Delivery Progress */}
            {!isFreeDelivery && (
               <div className="mt-4 text-center">
                 <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Spend R{(1000 - subtotal).toFixed(0)} more for free shipping</p>
                 <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500" style={{ width: `${(subtotal / 1000) * 100}%` }} />
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
      {showPudoMap && (
        <PudoMap
          onClose={() => setShowPudoMap(false)}
          onSelect={(locker: any) => {
            setPudoLocation(`${locker.name} - ${locker.address}`)
            setShowPudoMap(false)
          }}
        />
      )}
    </div>
  )
}

