'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type TicketRow = {
  id: string
  subject?: string | null
  message?: string | null
  status?: string | null
  created_at?: string | null
}

type ReplyRow = {
  id: string
  ticket_id: string
  admin_email: string
  body: string
  created_at: string
}

export default function SupportClient() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [repliesByTicket, setRepliesByTicket] = useState<Record<string, ReplyRow[]>>({})
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [requestingAgent, setRequestingAgent] = useState(false)

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@pufffstationsa.co.za'

  const refreshReplies = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession()
    const token = sess.session?.access_token
    if (!token) return

    const res = await fetch('/api/support/replies', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return

    const grouped: Record<string, ReplyRow[]> = {}
    for (const reply of (json.replies ?? []) as ReplyRow[]) {
      if (!grouped[reply.ticket_id]) grouped[reply.ticket_id] = []
      grouped[reply.ticket_id].push(reply)
    }
    setRepliesByTicket(grouped)
  }, [])

  const refreshTickets = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (err) {
      setError(err.message)
      setTickets([])
      return
    }
    setTickets((data ?? []) as TicketRow[])
    await refreshReplies()
  }, [refreshReplies])

  const maybeSendQueueNotice = useCallback(async (ticket: TicketRow) => {
    if (!ticket.id || (ticket.status ?? '').toLowerCase() !== 'waiting_agent') return
    if (!ticket.created_at) return

    const ageMs = Date.now() - new Date(ticket.created_at).getTime()
    if (ageMs < 5 * 60 * 1000) return

    const hasAnyReply = (repliesByTicket[ticket.id]?.length ?? 0) > 0
    if (hasAnyReply) return

    const { data: sess } = await supabase.auth.getSession()
    const token = sess.session?.access_token
    if (!token) return

    await fetch('/api/support/queue-notice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ticketId: ticket.id }),
    })
  }, [repliesByTicket])

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      setError(null)

      const { data: sess } = await supabase.auth.getSession()
      if (!sess.session?.user) {
        router.replace('/login?next=/support')
        return
      }

      await refreshTickets()
      if (!mounted) return
      setLoading(false)
    }

    run()
    return () => {
      mounted = false
    }
  }, [refreshTickets, router])

  useEffect(() => {
    if (loading) return
    const timer = window.setInterval(async () => {
      await refreshTickets()
    }, 15000)
    return () => window.clearInterval(timer)
  }, [loading, refreshTickets])

  useEffect(() => {
    const run = async () => {
      for (const t of tickets) {
        await maybeSendQueueNotice(t)
      }
    }
    void run()
  }, [maybeSendQueueNotice, tickets])

  async function requestLiveAgent() {
    if (!message.trim()) {
      setError('Please describe your issue so the live agent can assist properly.')
      return
    }

    setError(null)
    setOk(null)
    setRequestingAgent(true)

    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) {
        router.replace('/login?next=/support')
        return
      }

      const res = await fetch('/api/support/live-agent-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim() || 'Live agent request',
          message: message.trim(),
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `Failed to request live agent (HTTP ${res.status})`)

      setSubject('')
      setMessage('')
      setOk('Live agent requested. We notified support and put you in queue.')
      await refreshTickets()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to request live agent.')
    } finally {
      setRequestingAgent(false)
    }
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(null)

    if (!subject.trim()) return setError('Please add a subject.')
    if (!message.trim()) return setError('Please describe the problem.')

    setSending(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/support')
        return
      }

      const payload: any = {
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      }

      const { error: insertErr } = await supabase.from('support_messages').insert(payload)
      if (insertErr) throw insertErr

      const customerEmail = (user.email ?? '').trim()
      const customerName = String((user.user_metadata as any)?.full_name ?? (user.user_metadata as any)?.name ?? 'Customer').trim()

      const emailRes = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          subject: subject.trim(),
          message: message.trim(),
          orderId: '',
        }),
      })

      const emailJson = await emailRes.json().catch(() => ({}))
      if (!emailRes.ok) {
        setOk('Ticket submitted. Email notification failed, please check server settings.')
        console.warn('Support email failed:', emailJson)
      } else {
        setOk('Ticket submitted. We will reply as soon as possible.')
      }

      setSubject('')
      setMessage('')
      await refreshTickets()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to submit ticket. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Support</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Customer Support</h1>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            Submit a ticket and track it here. For urgent issues, email{' '}
            <a className="font-semibold text-cyan-300 hover:text-cyan-200" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/shop"
            className="rounded-full bg-cyan-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] transition hover:brightness-110 active:scale-95"
          >
            Shop
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">FAQ (coming next)</h2>
        <p className="mt-2 text-xs text-slate-400">We will add the full FAQ and order support guides here.</p>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.8)]">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Create support ticket</h2>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>
        ) : null}
        {ok ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{ok}</div>
        ) : null}

        <form onSubmit={submitTicket} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
              placeholder="e.g. Payment issue / Delivery question"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
              placeholder="Tell us what happened and include your order ID if you have one."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-cyan-600 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(6,182,212,0.6)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Submit ticket'}
            </button>

            <button
              type="button"
              onClick={requestLiveAgent}
              disabled={requestingAgent}
              className="w-full rounded-full border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20 active:scale-95 disabled:opacity-60"
            >
              {requestingAgent ? 'Requesting...' : 'Request live agent'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">My tickets</h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((idx) => (
              <div key={idx} className="animate-pulse rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded-full bg-slate-800/80" />
                    <div className="h-3 w-28 rounded-full bg-slate-800/80" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-800/80" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded-full bg-slate-800/70" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-800/70" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && tickets.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
            <p className="text-sm font-semibold text-slate-100">No tickets yet.</p>
            <p className="mt-1 text-xs text-slate-400">When you submit a ticket it will show here.</p>
          </div>
        ) : null}

        {!loading && tickets.length > 0
          ? tickets.map((t) => (
              <article key={t.id} className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{t.subject || 'Support request'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : '-'}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {(t.status || 'open').toUpperCase()}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-xs text-slate-200">{t.message || '-'}</p>

                {(repliesByTicket[t.id]?.length ?? 0) > 0 && (
                  <div className="mt-4 space-y-2 border-t border-white/[0.05] pt-4">
                    {repliesByTicket[t.id].map((reply) => {
                      const isSystem = reply.admin_email === 'system@pufffstation.local'
                      return (
                        <div
                          key={reply.id}
                          className={`rounded-2xl border px-3 py-2 text-xs ${
                            isSystem
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
                          }`}
                        >
                          <p className="font-semibold uppercase tracking-[0.16em] text-[10px]">
                            {isSystem ? 'System' : 'Live agent'}
                          </p>
                          <p className="mt-1 whitespace-pre-line">{reply.body}</p>
                          <p className="mt-1 text-[10px] opacity-70">{new Date(reply.created_at).toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </article>
            ))
          : null}
      </section>
    </main>
  )
}
