'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Link from 'next/link'

export default function Footer() {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const sb = supabaseBrowser()
    sb.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
      setLoadingUser(false)
    })

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoadingUser(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('You must be signed in to leave a review.')
      return
    }

    setBusy(true)
    const { error } = await supabaseBrowser().from('reviews').insert({
      rating,
      text,
      customer_name: name || user.email?.split('@')[0] || 'Authenticated User',
      is_approved: false,
    })

    if (error) {
      alert(error.message)
    } else {
      setSent(true)
      setTimeout(() => {
        setShowReviewForm(false)
        setSent(false)
        setText('')
        setName('')
      }, 3000)
    }
    setBusy(false)
  }

  return (
    <footer className={`relative z-10 mt-14 border-t border-white/5 ${isHome ? 'bg-slate-950' : 'bg-black/40 backdrop-blur-md'}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="text-sm font-extrabold text-white">PUFFF Station Vendors SA</div>
            <div className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
              Premium disposables intended for adults only. 18+ required.
              <span className="mt-2 block text-slate-500">Support: support@pufffstationsa.co.za</span>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-300 transition hover:text-cyan-200"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
                Leave a Review
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <div className="text-[10px] text-slate-500">Policies</div>
            <Link href="/terms" className="block transition hover:text-white">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="block transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/refunds" className="block transition hover:text-white">
              Refunds & Returns
            </Link>
          </div>

          <div className="space-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <div className="text-[10px] text-slate-500">Quick Links</div>
            <Link href="/support" className="block transition hover:text-white">
              Support
            </Link>
            <Link href="/shop" className="block transition hover:text-white">
              Shop
            </Link>
            <Link href="/" className="block transition hover:text-white">
              Home
            </Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800/60 pt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span>© {new Date().getFullYear()} PUFFF Station Vendors SA</span>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <span className="text-slate-600">PUFFF Station</span>
          </div>
          <span>Adults only. 18+.</span>
        </div>
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950 p-8 shadow-2xl"
            >
              {loadingUser ? (
                <div className="py-12 text-center text-sm italic text-slate-400">Checking session...</div>
              ) : !user ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-3xl text-rose-500">
                    !
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Login Required</h2>
                  <p className="mt-2 text-sm text-slate-400">You must be signed in to leave a review.</p>
                  <div className="mt-8 flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setShowReviewForm(false)}
                      className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-slate-200"
                    >
                      Sign In
                    </Link>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-500 transition hover:text-white"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              ) : !sent ? (
                <>
                  <h2 className="mb-2 text-xl font-extrabold text-white">Leave a Review</h2>
                  <p className="mb-6 text-xs italic text-slate-400">
                    Signed in as: <span className="not-italic font-bold text-cyan-300">{user.email}</span>
                  </p>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rating</span>
                      <div className="mt-2 flex justify-center gap-2 rounded-2xl border border-slate-900 bg-black/20 p-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition ${rating >= star ? 'text-cyan-400 grayscale-0' : 'text-slate-700 grayscale'}`}
                          >
                            *
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="grid gap-2">
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Display Name</span>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name or handle"
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Comment</span>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        placeholder="Optional details..."
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                      />
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 rounded-full border border-slate-800 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition hover:bg-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex-[2] rounded-full bg-cyan-600 py-3 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
                      >
                        {busy ? 'SENDING...' : 'SUBMIT REVIEW'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-3xl text-cyan-400">
                    +
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Thank you</h2>
                  <p className="mt-2 text-sm text-slate-400">Review submitted. Our team will review it shortly.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  )
}
