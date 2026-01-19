'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { Tables } from '@/lib/types/database'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReviewModeration() {
  const [reviews, setReviews] = useState<Tables<'reviews'>[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    const sb = supabaseBrowser()
    const { data } = await sb
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  async function updateStatus(id: string, approved: boolean) {
    setBusy(id)
    const sb = supabaseBrowser()
    const { error } = await sb
      .from('reviews')
      .update({ is_approved: approved, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) alert(error.message)
    await loadReviews()
    setBusy(null)
  }

  async function deleteReview(id: string) {
    if (!confirm('Permanently delete this review?')) return
    setBusy(id)
    const sb = supabaseBrowser()
    const { error } = await sb.from('reviews').delete().eq('id', id)
    if (error) alert(error.message)
    await loadReviews()
    setBusy(null)
  }

  if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Review Terminal</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Moderate customer feedback</p>
        </div>
        <button 
          onClick={loadReviews}
          className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition"
        >
          Refresh Feed
        </button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border p-5 transition ${r.is_approved ? 'border-white/[0.04] bg-slate-900/20' : 'border-amber-500/20 bg-amber-500/[0.02]'}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="flex gap-0.5 text-[8px]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={s <= r.rating ? 'text-amber-400' : 'text-slate-700'}>★</span>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{r.customer_name}</span>
                      {!r.is_approved && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[8px] font-bold text-amber-500 uppercase">Pending</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{r.text || 'No comment provided.'}"</p>
                    <p className="mt-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                      {r.created_at && new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {r.is_approved ? (
                      <button
                        disabled={busy === r.id}
                        onClick={() => updateStatus(r.id, false)}
                        className="rounded-xl border border-white/[0.05] bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition"
                      >
                        Hide
                      </button>
                    ) : (
                      <button
                        disabled={busy === r.id}
                        onClick={() => updateStatus(r.id, true)}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition shadow-lg"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      disabled={busy === r.id}
                      onClick={() => deleteReview(r.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/[0.05] py-12 text-center text-slate-500 text-xs italic">
              No reviews found in the system.
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
