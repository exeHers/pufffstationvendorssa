'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import {
  DEFAULT_SUPPORT_BOT_CONFIG,
  sanitizeSupportBotConfig,
  type SupportBotConfig,
} from '@/lib/support-bot-config'

export default function SupportBotSettingsTab() {
  const [config, setConfig] = useState<SupportBotConfig>(DEFAULT_SUPPORT_BOT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabaseBrowser()
        .from('settings')
        .select('value')
        .eq('key', 'support_bot_config')
        .maybeSingle()

      if (!error && data?.value) {
        setConfig(sanitizeSupportBotConfig(data.value))
      }
      setLoading(false)
    }

    void load()
  }, [])

  const setFaq = (index: number, key: 'question' | 'answer', value: string) => {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  const addFaq = () => {
    setConfig((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }))
  }

  const removeFaq = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  const save = async () => {
    setBusy(true)
    const payload = sanitizeSupportBotConfig(config)

    const { error } = await supabaseBrowser().from('settings').upsert({
      key: 'support_bot_config',
      value: payload,
      updated_at: new Date().toISOString(),
    })

    setBusy(false)
    if (error) {
      alert(error.message)
      return
    }

    setConfig(payload)
    alert('Support bot settings saved.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-slate-900/40 shadow-2xl">
        <div className="border-b border-white/[0.05] bg-slate-900/40 px-8 py-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Support Bot Core</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Greeting, fallback and queue messaging</p>
        </div>

        <div className="space-y-5 p-8">
          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Widget Title</span>
            <input
              value={config.widget_title}
              onChange={(e) => setConfig((prev) => ({ ...prev, widget_title: e.target.value }))}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Welcome Message</span>
            <textarea
              value={config.welcome_message}
              onChange={(e) => setConfig((prev) => ({ ...prev, welcome_message: e.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Busy Queue Message</span>
            <textarea
              value={config.busy_message}
              onChange={(e) => setConfig((prev) => ({ ...prev, busy_message: e.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Fallback Support Email</span>
            <input
              value={config.fallback_email}
              onChange={(e) => setConfig((prev) => ({ ...prev, fallback_email: e.target.value }))}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </label>

          <button
            onClick={save}
            disabled={busy}
            className="w-full rounded-full bg-cyan-600 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save Bot Settings'}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-slate-900/30 shadow-2xl">
        <div className="border-b border-white/[0.05] bg-slate-900/40 px-8 py-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">FAQ Editor</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Intent/answer pairs used by bot</p>
        </div>

        <div className="space-y-4 p-8">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-white/[0.05] bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">FAQ #{idx + 1}</p>
                <button
                  onClick={() => removeFaq(idx)}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
              <input
                value={faq.question}
                onChange={(e) => setFaq(idx, 'question', e.target.value)}
                placeholder="Question"
                className="w-full rounded-xl border border-white/[0.05] bg-black/40 px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => setFaq(idx, 'answer', e.target.value)}
                placeholder="Answer"
                rows={3}
                className="w-full rounded-xl border border-white/[0.05] bg-black/40 px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
          ))}

          <button
            onClick={addFaq}
            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200"
          >
            Add FAQ
          </button>
        </div>
      </section>
    </div>
  )
}
