'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import {
  DEFAULT_WHATSAPP_CONFIG,
  normalizeWhatsAppNumber,
  type WhatsAppConfig,
} from '@/lib/whatsapp-config'

const DEFAULT_CONFIG = DEFAULT_WHATSAPP_CONFIG

export default function WhatsAppSettingsTab() {
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabaseBrowser()
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_config')
        .maybeSingle()

      if (!error && data?.value) {
        setConfig((prev) => ({ ...prev, ...(data.value as Partial<WhatsAppConfig>) }))
      }
      setLoading(false)
    }

    void load()
  }, [])

  const onSave = async () => {
    const cleanNumber = normalizeWhatsAppNumber(config.whatsapp_number)
    if (!cleanNumber.trim()) {
      alert('Please enter a valid WhatsApp number.')
      return
    }

    setBusy(true)
    const payload: WhatsAppConfig = {
      ...config,
      whatsapp_number: cleanNumber,
    }

    const { error } = await supabaseBrowser().from('settings').upsert({
      key: 'whatsapp_config',
      value: payload,
      updated_at: new Date().toISOString(),
    })

    setBusy(false)

    if (error) {
      alert(error.message)
      return
    }

    setConfig(payload)
    alert('WhatsApp settings saved.')
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
          <h2 className="text-lg font-black uppercase tracking-tight text-white">WhatsApp Commerce Settings</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Support + checkout message controls</p>
        </div>

        <div className="space-y-5 p-8">
          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">WhatsApp Number</span>
            <input
              value={config.whatsapp_number}
              onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
              placeholder="27712345678"
            />
            <p className="text-[10px] text-slate-500">Use international format digits only, no + or spaces.</p>
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Support Button Message</span>
            <textarea
              value={config.support_message}
              onChange={(e) => setConfig((prev) => ({ ...prev, support_message: e.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </label>

          <button
            onClick={onSave}
            disabled={busy}
            className="w-full rounded-full bg-cyan-600 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save WhatsApp Settings'}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-slate-900/30 shadow-2xl">
        <div className="border-b border-white/[0.05] bg-slate-900/40 px-8 py-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Checkout Message Template</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rendered and sent to WhatsApp checkout</p>
        </div>

        <div className="space-y-4 p-8">
          <textarea
            value={config.checkout_message_template}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, checkout_message_template: e.target.value }))
            }
            rows={16}
            className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-5 py-4 font-mono text-xs text-white outline-none focus:border-cyan-500/50"
          />

          <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-4 text-[11px] text-slate-300">
            <p className="mb-2 font-bold uppercase tracking-widest text-slate-400">Available variables</p>
            <p>{'{order_ref}'} {'{customer_name}'} {'{customer_phone}'} {'{items_list}'}</p>
            <p>{'{delivery_method}'} {'{delivery_text}'} {'{total}'}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
