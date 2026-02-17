'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import {
  DEFAULT_SUPPORT_BOT_CONFIG,
  sanitizeSupportBotConfig,
  type SupportBotConfig,
} from '@/lib/support-bot-config'

type ChatMessage = {
  role: 'bot' | 'user' | 'system'
  text: string
}

export default function SupportBotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [config, setConfig] = useState<SupportBotConfig>(DEFAULT_SUPPORT_BOT_CONFIG)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: DEFAULT_SUPPORT_BOT_CONFIG.welcome_message },
  ])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabaseBrowser()
        .from('settings')
        .select('value')
        .eq('key', 'support_bot_config')
        .maybeSingle()

      if (!error && data?.value) {
        const cfg = sanitizeSupportBotConfig(data.value)
        setConfig(cfg)
        setMessages([{ role: 'bot', text: cfg.welcome_message }])
      }
    }

    void load()
  }, [])

  const quickFaqs = useMemo(() => config.faqs.slice(0, 3), [config])

  const pushMessage = (msg: ChatMessage) => setMessages((prev) => [...prev, msg])

  const matchFaq = (query: string) => {
    const q = query.toLowerCase()
    return config.faqs.find((faq) => {
      const words = faq.question.toLowerCase().split(/\s+/).filter(Boolean)
      return words.some((w) => w.length > 3 && q.includes(w))
    })
  }

  const requestLiveAgent = async (seedMessage?: string) => {
    setBusy(true)
    try {
      const { data: sess } = await supabaseBrowser().auth.getSession()
      const token = sess.session?.access_token
      if (!token) {
        pushMessage({ role: 'system', text: 'Please log in to request a live agent. Redirecting to login...' })
        window.location.href = '/login?next=/support'
        return
      }

      const res = await fetch('/api/support/live-agent-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Live agent request from support bot',
          message: seedMessage?.trim() || 'User requested a live agent from support bot.',
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to request live agent')

      pushMessage({ role: 'system', text: 'Live agent requested. We notified support. Please keep this chat open.' })
    } catch (e: any) {
      pushMessage({ role: 'system', text: e?.message || 'Could not request a live agent right now.' })
    } finally {
      setBusy(false)
    }
  }

  const send = async (textRaw?: string) => {
    const text = (textRaw ?? input).trim()
    if (!text) return

    setInput('')
    pushMessage({ role: 'user', text })

    const lower = text.toLowerCase()
    if (lower.includes('live agent') || lower.includes('human') || lower.includes('person')) {
      await requestLiveAgent(text)
      return
    }

    const faq = matchFaq(text)
    if (faq) {
      pushMessage({ role: 'bot', text: faq.answer })
      return
    }

    pushMessage({ role: 'bot', text: `I couldn't fully resolve that. You can request a live agent or email ${config.fallback_email}.` })
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] sm:bottom-8 sm:right-8">
      {open ? (
        <div className="mb-3 w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{config.widget_title}</p>
              <p className="text-[10px] text-slate-400">Bot + live agent escalation</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-slate-300 hover:text-white">
              Close
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`rounded-2xl px-3 py-2 text-xs ${
                  m.role === 'user'
                    ? 'ml-8 bg-cyan-500/15 text-cyan-100'
                    : m.role === 'system'
                    ? 'bg-amber-500/15 text-amber-100'
                    : 'mr-8 bg-slate-800/80 text-slate-100'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="grid gap-2 border-t border-white/10 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickFaqs.map((faq) => (
                <button
                  key={faq.question}
                  onClick={() => send(faq.question)}
                  className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  {faq.question}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void send()
                }}
                placeholder="Type your support question..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={() => void send()}
                className="rounded-xl bg-cyan-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
              >
                Send
              </button>
            </div>

            <button
              onClick={() => void requestLiveAgent(messages.filter((m) => m.role === 'user').map((m) => m.text).join('\n'))}
              disabled={busy}
              className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200 disabled:opacity-60"
            >
              {busy ? 'Requesting...' : 'Request live agent'}
            </button>

            <p className="text-[10px] text-slate-500">If unavailable, we will notify you here. Email fallback: {config.fallback_email}</p>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-[0_8px_30px_rgba(8,145,178,0.5)] transition hover:scale-105"
        aria-label="Open support assistant"
      >
        💬
      </button>
    </div>
  )
}
