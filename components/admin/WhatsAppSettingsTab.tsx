'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import {
  DEFAULT_WHATSAPP_CONFIG,
  normalizeWhatsAppNumber,
  renderCheckoutTemplate,
  type WhatsAppConfig,
} from '@/lib/whatsapp-config'

const DEFAULT_CONFIG = DEFAULT_WHATSAPP_CONFIG
const CHECKOUT_PREVIEW_CONTEXT = {
  order_ref: 'PUFFF-1234',
  customer_name: 'Sample Customer',
  customer_phone: '+27 71 234 5678',
  items_list: '- 1 x Sample Device (R299.00)',
  delivery_method: 'Door-to-Door (fees included)',
  delivery_text: 'Delivery Address: 10 Rivonia Rd, Sandton, Johannesburg, 2196',
  total: '299.00',
}

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

  const prettifiedNumber = useMemo(() => {
    if (!config.whatsapp_number) return 'Not configured'
    const digits = config.whatsapp_number.replace(/\D+/g, '')
    if (!digits) return 'Not configured'
    const formatted = digits.startsWith('0') || digits.startsWith('27') ? `+${digits.replace(/^0/, '27')}` : `+${digits}`
    return formatted
  }, [config.whatsapp_number])

  const supportPreview = config.support_message?.trim() || DEFAULT_CONFIG.support_message
  const whatsappPreviewHref = useMemo(() => {
    const digits = normalizeWhatsAppNumber(config.whatsapp_number)
    if (!digits) return null
    return `https://wa.me/${digits}?text=${encodeURIComponent(supportPreview)}`
  }, [config.whatsapp_number, supportPreview])

  const checkoutPreview = useMemo(() => {
    const template = config.checkout_message_template || DEFAULT_CONFIG.checkout_message_template
    return renderCheckoutTemplate(template, CHECKOUT_PREVIEW_CONTEXT)
  }, [config.checkout_message_template])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
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

      <section className="grid gap-6 rounded-[2.5rem] border border-white/[0.04] bg-slate-900/30 p-8 shadow-2xl lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Live support button preview</p>
          <p className="mt-3 text-2xl font-black text-white">{prettifiedNumber}</p>
          <p className="mt-2 text-sm text-slate-300">{supportPreview}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-slate-500">
            <span>Widget + support page</span>
            <span>Floating button</span>
          </div>
          {whatsappPreviewHref ? (
            <a
              href={whatsappPreviewHref}
              target="_blank"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-cyan-400/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 transition hover:border-cyan-300/80 hover:text-white"
            >
              Preview WhatsApp flow
            </a>
          ) : (
            <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-500">Enter a valid number to preview</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-black/30 p-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Checkout message preview</p>
          <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/[0.04] bg-slate-950/70 p-4 text-xs text-slate-200">
            {checkoutPreview}
          </pre>
          <p className="mt-3 text-[10px] text-slate-500">
            Customers receive this template when they pick WhatsApp checkout. Adjust copy above or include payment instructions for your ops team.
          </p>
        </div>
      </section>
    </div>
  )
}
