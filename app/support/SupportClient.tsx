'use client'

import { useEffect, useMemo, useState } from 'react'
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

export default function SupportClient() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketRow[]>([])

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  // will come from env (public), fallback to something sane
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@pufffstationsa.co.za'

  async function refreshTickets() {
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
  }

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
  }, [router])

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

      // 1) Insert ticket into Supabase (your current flow)
      const payload: any = {
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      }

      const { error: insertErr } = await supabase.from('support_messages').insert(payload)
      if (insertErr) throw insertErr

      // 2) Email support inbox + optional auto-reply customer
      //    We use the logged in user's email + metadata name where possible
      const customerEmail = (user.email ?? '').trim()
      const customerName =
        String((user.user_metadata as any)?.full_name ?? (user.user_metadata as any)?.name ?? 'Customer').trim()

      // If you want: allow orderId from message text later; for now keep optional blank
      const orderId = ''

      // Call your Resend-backed API route
      const emailRes = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          subject: subject.trim(),
          message: message.trim(),
          orderId,
        }),
      })

      const emailJson = await emailRes.json().catch(() => ({}))

      // We DO NOT fail the whole ticket if email fails (because Supabase insert already succeeded).
      // But we show a warning so you know.
      if (!emailRes.ok) {
        setOk('Ticket submitted ✅ (Email failed — please check Resend env + logs)')
        console.warn('Support email failed:', emailJson)
      } else {
        setOk('Ticket submitted ✅ We’ll reply ASAP.')
      }

      // Reset form
      setSubject('')
      setMessage('')

      // Refresh list
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            SUPPORT
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Customer Support
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Submit a ticket and track it here. For urgent stuff, email{' '}
            <a className="font-semibold text-fuchsia-300 hover:text-fuchsia-200" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/shop"
            className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition"
          >
            Shop
          </Link>
        </div>
      </header>

      {/* FAQ (placeholder) */}
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
          FAQ (coming next)
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          We'll add the full FAQ + Ts&Cs next. For now, submit a ticket below.
        </p>
      </section>

      {/* Submit ticket */}
      <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.8)]">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
          Create support ticket
        </h2>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {ok && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            {ok}
          </div>
        )}

        <form onSubmit={submitTicket} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              placeholder="e.g. Payment issue / Delivery question"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              placeholder="Tell us what happened and include your order ID if you have one."
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-[#D946EF] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(217,70,239,0.8)] hover:brightness-110 active:scale-95 disabled:opacity-60 transition"
          >
            {sending ? 'Sending…' : 'Submit ticket'}
          </button>
        </form>
      </section>

      {/* Ticket list */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
          My tickets
        </h2>

        {loading && (
          <div className="space-y-3">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5"
              >
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
        )}

        {!loading && tickets.length === 0 && (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
            <p className="text-sm font-semibold text-slate-100">No tickets yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              When you submit a ticket it will show here.
            </p>
          </div>
        )}

        {!loading && tickets.length > 0 &&
          tickets.map((t) => (
            <article
              key={t.id}
              className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t.subject || 'Support request'}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  {(t.status || 'open').toUpperCase()}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-xs text-slate-200">{t.message || '—'}</p>
            </article>
          ))}
      </section>
    </main>
  )
}
