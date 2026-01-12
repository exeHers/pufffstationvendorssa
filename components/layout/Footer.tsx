'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    async function getUser() {
      const sb = supabaseBrowser()
      const { data: { user } } = await sb.auth.getUser()
      setUser(user)
      setLoadingUser(false)
    }
    getUser()
  }, [])

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('You must be signed in to leave a review, my bru.')
      return
    }

    setBusy(true)
    const { error } = await supabaseBrowser()
      .from('reviews')
      .insert({ 
        rating, 
        text, 
        customer_name: name || user.email?.split('@')[0] || 'Authenticated User', 
        is_approved: false,
        user_id: user.id 
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
    <footer className="mt-14 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="text-sm font-extrabold text-white">
              PUFFF Station Vendors SA
            </div>
            <div className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
              Premium disposables intended for adults only. 18+ required.
              <span className="block mt-2 text-slate-500">
                Support: support@pufffstationsa.co.za
              </span>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => setShowReviewForm(true)}
                className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D946EF] hover:brightness-110 transition flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-[#D946EF] shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
                Give Us a Review
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
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-600">DNVN Digital</span>
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
                <div className="py-12 text-center text-slate-400 text-sm italic">Checking session...</div>
              ) : !user ? (
                <div className="py-8 text-center">
                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-3xl text-rose-500">
                      !
                   </div>
                   <h2 className="text-xl font-extrabold text-white">Login Required</h2>
                   <p className="mt-2 text-sm text-slate-400">You must be signed in to leave a review, my bru.</p>
                   <div className="mt-8 flex flex-col gap-3">
                      <Link 
                        href="/login"
                        onClick={() => setShowReviewForm(false)}
                        className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-slate-200 transition"
                      >
                        Sign In Now
                      </Link>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition"
                      >
                        Maybe Later
                      </button>
                   </div>
                </div>
              ) : !sent ? (
                <>
                  <h2 className="text-xl font-extrabold text-white mb-2">Drop a Review</h2>
                  <p className="text-xs text-slate-400 mb-6 italic">Signed in as: <span className="text-fuchsia-400 not-italic font-bold">{user.email}</span></p>
                  
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Rating</span>
                      <div className="mt-2 flex gap-2 justify-center bg-black/20 p-3 rounded-2xl border border-slate-900">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition ${rating >= star ? 'text-fuchsia-500 grayscale-0' : 'text-slate-700 grayscale'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Display Name</span>
                      <input 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Name or handle"
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-white outline-none focus:border-fuchsia-500/50"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Comment</span>
                      <textarea 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={3}
                        placeholder="Optional details..."
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-white outline-none focus:border-fuchsia-500/50"
                      />
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 rounded-full border border-slate-800 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-900 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={busy}
                        className="flex-[2] rounded-full bg-fuchsia-500 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50"
                      >
                        {busy ? 'SENDING...' : 'SUBMIT REVIEW'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/10 text-3xl text-fuchsia-500">
                      ✓
                   </div>
                   <h2 className="text-xl font-extrabold text-white">Lekker!</h2>
                   <p className="mt-2 text-sm text-slate-400">Review sent. Our team will check it out shortly.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  )
}
