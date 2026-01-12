'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { motion } from 'framer-motion'

interface Review {
  id: string
  customer_name: string
  rating: number
  text: string
  is_approved: boolean
  created_at: string
}

interface PulseConfig {
  header_title: string
  header_subtitle: string
  accent_color: string
  card_blur: boolean
}

export default function PulseTab() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [config, setConfig] = useState<PulseConfig>({
    header_title: 'Wall of PUFFF',
    header_subtitle: 'Vendor Feedback',
    accent_color: '#D946EF',
    card_blur: true
  })
  const [busy, setBusy] = useState(false)

  const refreshData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    else setRefreshing(true)
    
    try {
      const sb = supabaseBrowser()
      const [reviewsRes, configRes] = await Promise.all([
        sb.from('reviews').select('*').order('created_at', { ascending: false }),
        sb.from('settings').select('*').eq('key', 'review_config').single()
      ])

      if (reviewsRes.error) throw reviewsRes.error
      
      setReviews(reviewsRes.data || [])
      if (configRes.data?.value) {
        if (isInitial) {
          setConfig(prev => ({ ...prev, ...configRes.data.value }))
        }
      }
    } catch (e) {
      console.error('Pulse: Refresh error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  async function handleSaveConfig() {
    setBusy(true)
    const { error } = await supabaseBrowser()
      .from('settings')
      .upsert({
        key: 'review_config',
        value: config,
        updated_at: new Date().toISOString()
      })
    if (error) {
      alert(error.message)
    } else {
      alert('Pulse Display Config Saved!')
    }
    setBusy(false)
  }

  async function toggleApproval(id: string, current: boolean) {
    const { error } = await supabaseBrowser()
      .from('reviews')
      .update({ is_approved: !current })
      .eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      refreshData()
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review permanently?')) return
    const { error } = await supabaseBrowser().from('reviews').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      refreshData()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Initializing Pulse...</span>
      </div>
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
      {/* Config Panel */}
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-800/80 bg-slate-950/40 shadow-2xl">
          <div className="border-b border-slate-800/80 bg-slate-900/40 px-8 py-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Pulse Configuration</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Appearance Control</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Main Header</span>
                <input 
                  value={config.header_title} 
                  onChange={e => setConfig({ ...config, header_title: e.target.value })} 
                  className="w-full rounded-2xl border border-slate-800 bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-fuchsia-500/50 transition-colors" 
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Sub Header</span>
                <input 
                  value={config.header_subtitle} 
                  onChange={e => setConfig({ ...config, header_subtitle: e.target.value })} 
                  className="w-full rounded-2xl border border-slate-800 bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-fuchsia-500/50 transition-colors" 
                />
              </label>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Theme Accent</span>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={config.accent_color} 
                    onChange={e => setConfig({ ...config, accent_color: e.target.value })} 
                    className="h-11 w-20 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer p-1" 
                  />
                  <input 
                    value={config.accent_color} 
                    onChange={e => setConfig({ ...config, accent_color: e.target.value })} 
                    className="flex-1 rounded-xl border border-slate-800 bg-black/40 px-4 text-xs font-mono text-white outline-none focus:border-fuchsia-500/50" 
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group">
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Visual Blur</span>
                   <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Toggle Glassmorphism</span>
                 </div>
                 <input 
                   type="checkbox" 
                   checked={config.card_blur} 
                   onChange={e => setConfig({ ...config, card_blur: e.target.checked })} 
                   className="h-5 w-5 accent-fuchsia-500 rounded-lg" 
                 />
              </label>
            </div>

            <button 
              onClick={handleSaveConfig} 
              disabled={busy} 
              className="w-full relative group overflow-hidden rounded-full bg-white py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                {busy ? 'SYNCHRONIZING...' : 'Deploy Changes'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Feedback Terminal</h2>
            {refreshing && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-ping rounded-full bg-fuchsia-500" />
                <span className="text-[8px] font-black uppercase text-fuchsia-500 tracking-[0.2em]">Live Sync</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-slate-900 border border-slate-800 px-4 py-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} Logs Found</span>
          </div>
        </div>

        <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {reviews.map((r, i) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-3xl border border-slate-800 bg-slate-950/40 p-6 flex items-start justify-between gap-6 transition-all hover:border-slate-700 hover:bg-slate-950/60"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                   <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
                     <span className="text-[10px] font-black text-white">{r.customer_name[0].toUpperCase()}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-black text-white tracking-tight">{r.customer_name}</span>
                     <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-[10px] ${s <= r.rating ? 'text-amber-400' : 'text-slate-800'}`}>★</span>
                        ))}
                     </div>
                   </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 top-0 text-2xl text-slate-800 opacity-20 font-serif">"</div>
                  <p className="text-xs text-slate-300 italic leading-relaxed px-2">{r.text || 'No commentary provided.'}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">
                    {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-800" />
                  <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">
                    ID: {r.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => toggleApproval(r.id, r.is_approved)} 
                  className={`min-w-[80px] rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                    r.is_approved 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10' 
                      : 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  {r.is_approved ? 'Visible' : 'Pending'}
                </button>
                <button 
                  onClick={() => deleteReview(r.id)} 
                  className="rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  Erase
                </button>
              </div>
            </motion.div>
          ))}
          {reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] border border-dashed border-slate-800 bg-slate-950/20">
              <span className="text-4xl grayscale opacity-20 mb-4">📭</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">No review logs detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
