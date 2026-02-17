'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useCart } from '@/components/cart/CartContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DEFAULT_WHATSAPP_CONFIG,
  normalizeWhatsAppNumber,
  renderCheckoutTemplate,
  type WhatsAppConfig,
} from '@/lib/whatsapp-config'

type AddressSuggestion = {
  lat: number
  lng: number
  label: string
  address?: Record<string, string>
}

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const PudoSelector = useMemo(
    () => dynamic(() => import('@/components/checkout/PudoSelector'), { ssr: false }),
    []
  )

  // Form State
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  })

  // Delivery & Payment State
  const [deliveryMethod, setDeliveryMethod] = useState<'door' | 'pudo'>('door')
  const [pudoLocation, setPudoLocation] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'yoco' | 'whatsapp'>('whatsapp')
  const [showPudoMap, setShowPudoMap] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressOptions, setAddressOptions] = useState<any[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
  const [lockerResults, setLockerResults] = useState<any[]>([])
  const [lockerLoading, setLockerLoading] = useState(false)
  const [lockerError, setLockerError] = useState<string | null>(null)
  const [selectedLocker, setSelectedLocker] = useState<any | null>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>(DEFAULT_WHATSAPP_CONFIG)
  const [doorAddressOptions, setDoorAddressOptions] = useState<AddressSuggestion[]>([])
  const [doorAddressLoading, setDoorAddressLoading] = useState(false)
  const [doorAddressError, setDoorAddressError] = useState<string | null>(null)
  const [doorLocationLoading, setDoorLocationLoading] = useState(false)

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
        setFormData(prev => ({
          ...prev,
          email: user.email || prev.email
        }))
      }
    }
    fetchProfile()
  }, [supabase])

  useEffect(() => {
    const loadWhatsappConfig = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_config')
        .maybeSingle()

      if (!error && data?.value) {
        setWhatsappConfig((prev) => ({
          ...prev,
          ...(data.value as Partial<WhatsAppConfig>),
        }))
      }
    }

    void loadWhatsappConfig()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const applyDoorAddress = useCallback((option: AddressSuggestion) => {
    const addr = option?.address || {}
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || ''
    const province = addr.state || addr.province || ''
    const postalCode = addr.postcode || ''
    const streetFromParts = [addr.house_number, addr.road].filter(Boolean).join(' ').trim()
    const street = streetFromParts || option.label.split(',')[0]?.trim() || ''

    setFormData((prev) => ({
      ...prev,
      address: street || prev.address,
      city: city || prev.city,
      province: province || prev.province,
      postalCode: postalCode || prev.postalCode,
    }))
  }, [])

  useEffect(() => {
    if (deliveryMethod !== 'door') return

    const q = formData.address.trim()
    if (q.length < 3) {
      setDoorAddressOptions([])
      setDoorAddressError(null)
      return
    }

    let cancelled = false
    setDoorAddressLoading(true)
    setDoorAddressError(null)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=6`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Address lookup failed.')
        if (cancelled) return

        const list = (Array.isArray(json?.data) ? json.data : []) as AddressSuggestion[]
        setDoorAddressOptions(list)
        if (!list.length) setDoorAddressError('No physical addresses found yet. Keep typing.')
      } catch (err: any) {
        if (!cancelled) {
          setDoorAddressOptions([])
          setDoorAddressError(err?.message || 'Could not load suggestions.')
        }
      } finally {
        if (!cancelled) setDoorAddressLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [deliveryMethod, formData.address])

  const useMyDoorLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDoorAddressError('Geolocation is not supported on this device.')
      return
    }

    setDoorAddressError(null)
    setDoorLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
          const json = await res.json().catch(() => ({}))
          if (!res.ok || !json?.data) {
            throw new Error(json?.error || 'Could not resolve your location.')
          }

          const result = json.data as AddressSuggestion
          applyDoorAddress(result)
          setDoorAddressOptions([result])
        } catch (err: any) {
          setDoorAddressError(err?.message || 'Unable to use your location right now.')
        } finally {
          setDoorLocationLoading(false)
        }
      },
      () => {
        setDoorLocationLoading(false)
        setDoorAddressError('Unable to access your location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [applyDoorAddress])

  const fetchLockers = useCallback(async (lat: number, lng: number) => {
    setLockerLoading(true)
    setLockerError(null)
    try {
      const res = await fetch(`/api/pudo/lockers?lat=${lat}&lng=${lng}`)
      const json = await res.json()
      const list = Array.isArray(json) ? json : json?.data || []
      if (!list.length) {
        setLockerResults([])
        setLockerError('No lockers found near that location.')
        return
      }
      setLockerResults(list)
    } catch (err: any) {
      console.error('Locker lookup failed', err)
      setLockerResults([])
      setLockerError(err?.message || 'Failed to fetch lockers.')
    } finally {
      setLockerLoading(false)
    }
  }, [])

  const selectAddress = useCallback(async (option: any) => {
    setSelectedAddress(option)
    setAddressQuery(option?.label || '')
    setLockerResults([])
    if (typeof option?.lat === 'number' && typeof option?.lng === 'number') {
      await fetchLockers(option.lat, option.lng)
    }
  }, [fetchLockers])

  const selectLocker = useCallback((locker: any) => {
    if (!locker) return
    setSelectedLocker(locker)
    setPudoLocation(`${locker.name}${locker.city ? ` (${locker.city})` : ''}`)
  }, [])

  const handleCheckout = async () => {
    if (!formData.fullName || !formData.phone || !formData.email) {
      alert('Please fill in your contact details (name, email, phone).')
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
    try {
      const noteSuffix = formData.notes ? ` | Note: ${formData.notes}` : ''
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert('Please log in before checking out.')
        router.push('/login?next=/checkout')
        return
      }

      const lockerAddress = selectedLocker?.address ?? null
      const lockerCity = selectedLocker?.city ?? null
      const lockerProvince = selectedLocker?.province ?? null
      const lockerPostal = selectedLocker?.postalCode ?? null

      const orderPayload = {
        user_id: user.id,
        total_amount: total,
        status: 'pending_payment',
        delivery_type: deliveryMethod,
        pudo_location: deliveryMethod === 'pudo' ? pudoLocation : null,
        address_line1: deliveryMethod === 'door' ? formData.address : lockerAddress,
        city: deliveryMethod === 'door' ? formData.city : lockerCity,
        province: deliveryMethod === 'door' ? formData.province : lockerProvince,
        postal_code: deliveryMethod === 'door' ? formData.postalCode : lockerPostal,
        delivery_notes:
          deliveryMethod === 'pudo'
            ? `Collect from locker: ${pudoLocation}${noteSuffix}`
            : formData.notes || null,
        currency: 'ZAR',
        email: formData.email,
        phone: formData.phone,
        full_name: formData.fullName,
        payment_provider: paymentMethod === 'whatsapp' ? 'manual_whatsapp' : paymentMethod
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderError || !order) {
        throw new Error(orderError?.message || 'Failed to create order.')
      }

      if (items.length) {
        const lineItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
        const { error: lineError } = await supabase.from('order_items').insert(lineItems)
        if (lineError) {
          await supabase.from('orders').delete().eq('id', order.id)
          throw new Error('Failed to save order items. Please try again.')
        }
      }

      try {
        await fetch('/api/email/order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        })
      } catch (emailErr) {
        console.warn('Order confirmation email failed:', emailErr)
      }

      if (paymentMethod === 'whatsapp') {
        const itemsList = items
          .map((item) => `- ${item.quantity} x ${item.name} (R${(item.price * item.quantity).toFixed(2)})`)
          .join('\n')
        const deliveryText =
          deliveryMethod === 'pudo'
            ? `PUDO Locker: ${pudoLocation}`
            : `Delivery Address: ${formData.address}, ${formData.city}`

        const template =
          whatsappConfig.checkout_message_template ||
          DEFAULT_WHATSAPP_CONFIG.checkout_message_template
        const message = renderCheckoutTemplate(template, {
          order_ref: order.id.slice(0, 8),
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          items_list: itemsList,
          delivery_method:
            deliveryMethod === 'door'
              ? 'Door-to-Door (fees included)'
              : `PUDO Locker (R${deliveryFee})`,
          delivery_text: deliveryText,
          total: total.toFixed(2),
        })

        const whatsappNumber = normalizeWhatsAppNumber(whatsappConfig.whatsapp_number)

        clearCart()
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
        router.push('/success')
      } else {
        alert('Yoco card checkout is coming soon. Please use WhatsApp for now.')
      }
    } catch (error) {
      console.error('Order Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cart status</p>
          <h1 className="text-4xl font-black tracking-tight">Nothing queued yet.</h1>
          <p className="text-slate-400 max-w-sm mx-auto">Add your favourite PUFFF Station drops first, then slide back into checkout to reserve a locker or door delivery.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 font-semibold uppercase tracking-wider text-slate-950"
          >
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white selection:bg-cyan-400 selection:text-slate-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]" />
      </div>

      <header className="relative border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black tracking-tight">
            PUFFF<span className="text-cyan-400">/</span>Checkout
          </Link>
          <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Secure • Encrypted • Same-day dispatch
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-10">
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-8 py-8 shadow-xl shadow-black/30">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Step 01</p>
                  <h2 className="text-2xl font-black tracking-tight">Customer Identity</h2>
                </div>
                <span className="text-xs font-mono text-slate-500">Required</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-base focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-base focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-base focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur px-8 py-8 shadow-xl shadow-black/30">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Step 02</p>
                  <h2 className="text-2xl font-black tracking-tight">Delivery logistics</h2>
                </div>
                <span className="text-xs font-semibold text-cyan-300">Fees included in total</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { id: 'door', title: 'Door delivery', subtitle: 'Anywhere in SA' },
                  { id: 'pudo', title: 'PUDO locker', subtitle: 'Collect when ready' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id as 'door' | 'pudo')}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      deliveryMethod === option.id
                        ? 'border-cyan-400 bg-cyan-400/10 text-white'
                        : 'border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{option.subtitle}</p>
                    <p className="text-lg font-semibold">{option.title}</p>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {deliveryMethod === 'door' ? (
                  <motion.div
                    key="door"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Street address</label>
                        <button
                          type="button"
                          onClick={useMyDoorLocation}
                          disabled={doorLocationLoading}
                          className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 hover:bg-cyan-400/20 disabled:opacity-60"
                        >
                          {doorLocationLoading ? 'Locating…' : 'Use my location'}
                        </button>
                      </div>
                      <input
                        type="text"
                        name="address"
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Start typing your physical street address"
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 focus:border-cyan-400 focus:outline-none"
                      />
                      {doorAddressLoading && <p className="text-xs text-cyan-300">Finding addresses…</p>}
                      {doorAddressError && <p className="text-xs text-red-400">{doorAddressError}</p>}
                      {!doorAddressLoading && doorAddressOptions.length > 0 && (
                        <div className="grid gap-2">
                          {doorAddressOptions.slice(0, 5).map((option) => (
                            <button
                              key={`${option.lat}-${option.lng}-${option.label}`}
                              type="button"
                              onClick={() => applyDoorAddress(option)}
                              className="rounded-2xl border border-white/10 px-4 py-3 text-left text-xs text-slate-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">City</label>
                        <input
                          type="text"
                          name="city"
                          autoComplete="address-level2"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Province</label>
                        <input
                          type="text"
                          name="province"
                          autoComplete="address-level1"
                          value={formData.province}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          autoComplete="postal-code"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Notes</label>
                        <textarea
                          name="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pudo"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Search suburb or landmark</label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="text"
                          value={addressQuery}
                          onChange={(e) => setAddressQuery(e.target.value)}
                          placeholder="e.g. Sandton City, Johannesburg"
                          className="flex-1 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setAddressError(null)
                              if (!addressQuery.trim()) {
                                setAddressError('Enter an address or suburb to search.')
                                return
                              }
                              setAddressLoading(true)
                              try {
                                const res = await fetch(`/api/geocode?q=${encodeURIComponent(addressQuery)}`)
                                const json = await res.json()
                                if (!res.ok) {
                                  throw new Error(json?.error || 'Failed to geocode address.')
                                }
                                const list = json.data || []
                                if (!list.length) {
                                  setAddressOptions([])
                                  setSelectedAddress(null)
                                  setAddressError('No matches found. Try refining your search.')
                                  return
                                }
                                setAddressOptions(list)
                                selectAddress(list[0])
                              } catch (err: any) {
                                setAddressOptions([])
                                setSelectedAddress(null)
                                setAddressError(err?.message || 'Search failed.')
                              } finally {
                                setAddressLoading(false)
                              }
                            }}
                            className="rounded-2xl bg-cyan-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-950 hover:bg-cyan-400"
                          >
                            {addressLoading ? 'Searching…' : 'Locate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window === 'undefined' || !navigator.geolocation) {
                                setAddressError('Geolocation is not supported on this device.')
                                return
                              }
                              setAddressError(null)
                              setAddressLoading(true)
                              navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                  setAddressLoading(false)
                                  const { latitude, longitude } = pos.coords
                                  const label = `Current location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                                  setSelectedAddress({ lat: latitude, lng: longitude, label })
                                  setAddressQuery(label)
                                  await fetchLockers(latitude, longitude)
                                },
                                () => {
                                  setAddressLoading(false)
                                  setAddressError('Unable to access your location.')
                                }
                              )
                            }}
                            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white hover:border-white/30"
                          >
                            Use my location
                          </button>
                        </div>
                      </div>
                      {addressError && <p className="text-xs text-red-400">{addressError}</p>}
                      {addressOptions.length > 1 && (
                        <div className="grid gap-2">
                          {addressOptions.slice(0, 3).map((option) => (
                            <button
                              key={`${option.lat}-${option.lng}`}
                              type="button"
                              onClick={() => selectAddress(option)}
                              className={`rounded-2xl border px-4 py-3 text-left text-xs transition ${
                                selectedAddress?.lat === option.lat && selectedAddress?.lng === option.lng
                                  ? 'border-cyan-400 bg-cyan-400/10'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                        <span>Nearest lockers</span>
                        {lockerLoading && <span className="text-cyan-300">Syncing…</span>}
                      </div>
                      {lockerError && <p className="text-xs text-red-400">{lockerError}</p>}
                      {!lockerLoading && lockerResults.length === 0 && (
                        <p className="text-xs text-slate-500">Search an address to load nearby lockers.</p>
                      )}
                      <div className="grid gap-2">
                        {lockerResults.slice(0, 5).map((locker) => (
                          <button
                            key={locker.code}
                            type="button"
                            onClick={() => selectLocker(locker)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              selectedLocker?.code === locker.code
                                ? 'border-cyan-400 bg-cyan-400/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">{locker.name}</p>
                                <p className="text-[11px] text-slate-400">{locker.address}</p>
                              </div>
                              {typeof locker.distance === 'number' && (
                                <span className="text-[11px] text-cyan-300 font-semibold">{locker.distance.toFixed(1)} km</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <input
                        type="text"
                        readOnly
                        value={pudoLocation}
                        placeholder="Selected locker"
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm font-mono text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPudoMap(true)}
                          className="rounded-2xl border border-cyan-400/60 bg-cyan-400/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-200 hover:bg-cyan-400/20"
                        >
                          Browse locker list
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocker(null)
                            setPudoLocation('')
                          }}
                          className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400 hover:border-white/30"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-8 py-8 shadow-xl shadow-black/30">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Step 03</p>
                  <h2 className="text-2xl font-black tracking-tight">Payment preference</h2>
                </div>
                <span className="text-xs text-slate-400">Card coming soon</span>
              </div>
              <div className="space-y-4">
                <label className={`flex items-center justify-between gap-4 rounded-2xl border px-6 py-5 transition ${
                  paymentMethod === 'whatsapp' ? 'border-green-400 bg-green-400/10' : 'border-white/10 hover:border-white/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <span className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === 'whatsapp' ? 'border-green-400 bg-green-400' : 'border-white/40'
                    }`} />
                    <div>
                      <p className="text-base font-semibold">WhatsApp / EFT</p>
                      <p className="text-xs text-slate-400">Manual confirmation with the PUFFF team</p>
                    </div>
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

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-6 py-5 opacity-60">
                  <div className="flex items-center gap-4">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30" />
                    <div>
                      <p className="text-base font-semibold text-slate-400">Card via Yoco</p>
                      <p className="text-xs text-red-400 uppercase tracking-[0.3em]">Offline for calibration</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="yoco" disabled className="hidden" />
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-12">
              <div className="rounded-[32px] bg-white text-slate-900 p-8 shadow-2xl shadow-cyan-500/20">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <div>
                    <p className="text-xs tracking-[0.4em] text-slate-500">Receipt</p>
                    <p className="text-xl font-black">PUFFF Station</p>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between">
                      <span className="font-semibold">
                        {item.quantity} × {item.name}
                      </span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{deliveryMethod === 'door' ? 'Door delivery' : 'PUDO handling'}</span>
                    <span>R{deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Total</p>
                    <p className="text-3xl font-black">R{total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {loading ? 'Processing…' : 'Confirm order'}
                    {!loading && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {!isFreeDelivery && (
                  <div className="mt-6 text-xs text-slate-500">
                    Spend R{(1000 - subtotal).toFixed(0)} more for free shipping
                    <div className="mt-2 h-1 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400"
                        style={{ width: `${Math.min((subtotal / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center">Ssl-secured</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center">Same-day</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center">PUDO partner</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showPudoMap && (
        <PudoSelector
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

