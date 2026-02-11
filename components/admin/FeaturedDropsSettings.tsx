'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { motion } from 'framer-motion'

export default function FeaturedDropsSettings() {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    title: 'Featured Drops',
    description: 'Our top picks.'
  })
  const [ok, setOk] = useState(false)

  useEffect(() => {
    async function load() {
      const sb = supabaseBrowser()
      const { data } = await sb.from('settings').select('*').eq('key', 'featured_drops').single()
      if (data?.value) {
        setSettings(data.value)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setBusy(true)
    setOk(false)
    const sb = supabaseBrowser()
    const { error } = await sb.from('settings').upsert({
      key: 'featured_drops',
      value: settings,
      updated_at: new Date().toISOString()
    })
    
    if (!error) {
      setOk(true)
      setTimeout(() => setOk(false), 3000)
    } else {
      alert(error.message)
    }
    setBusy(false)
  }

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-3xl" />

  return (
    <section className="rounded-[2rem] border border-white/[0.04] bg-slate-900/40 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Featured Drops Controls</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Homepage Spotlight Configuration</p>
        </div>
        <button
          onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
          className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${settings.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}
        >
          {settings.enabled ? 'Live' : 'Hidden'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Section Title</label>
          <input
            value={settings.title}
            onChange={e => setSettings(s => ({ ...s, title: e.target.value }))}
            className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Subtitle / Description</label>
          <input
            value={settings.description}
            onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
            className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          disabled={busy}
          onClick={handleSave}
          className="rounded-full bg-cyan-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
        >
          {busy ? 'Saving...' : 'Update Settings'}
        </button>
        {ok && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-emerald-400 uppercase">Saved successfully!</motion.span>}
      </div>
    </section>
  )
}

