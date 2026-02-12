'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/lib/types/database'
import { supabase } from '@/lib/supabaseClient'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

type Ticket = Tables<'support_messages'>

export default function AdminSupportPage() {
  const router = useRouter()

  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTickets, setLoadingTickets] = useState(true)

  const adminEmails = useMemo(() => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS), [])
  const isAdmin = adminEmails.length > 0 && adminEmails.includes(adminEmail.toLowerCase())

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [closeAfter, setCloseAfter] = useState(false)

  
  const active = useMemo(() => tickets.find((t) => t.id === activeId), [tickets, activeId])

  const fetchTickets = useCallback(async (firstLoad = false) => {
    setError(null)
    setOk(null)
    setLoadingTickets(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? `Failed to load tickets (HTTP ${res.status})`)

      const list = (json.tickets ?? []) as Ticket[]
      setTickets(list)

      if (firstLoad) {
        if (list.length > 0) setActiveId(list[0].id)
        else setActiveId(null)
      } else {
        // if current ticket disappeared, reset
        const currentActiveId = activeIdRef.current
        if (currentActiveId && !list.some((t) => t.id === currentActiveId)) {
          setActiveId(list[0]?.id ?? null)
        }
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load tickets.')
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      setOk(null)

      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/admin/support')
        return
      }

      const email = (user.email ?? '').toLowerCase()
      setAdminEmail(email)

      if (!adminEmails.includes(email)) {
        setError('Access denied. Add your admin email to NEXT_PUBLIC_ADMIN_EMAILS (Vercel + .env.local).')
        setLoading(false)
        return
      }

      setLoading(false)

      // Load tickets once admin confirmed
      await fetchTickets(true)
    })()
  }, [adminEmails, fetchTickets, router])

  async function setStatus(ticketId: string, status: 'open' | 'replied' | 'closed') {
    setError(null)
    setOk(null)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/support/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketId, status }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? `Failed to update status (HTTP ${res.status})`)

      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)))
      setOk(`Status updated -> ${status.toUpperCase()}`)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to update status.')
    }
  }

  async function sendReply() {
    if (!active) return
    if (!reply.trim()) {
      setError('Reply cannot be empty.')
      return
    }

    setSending(true)
    setError(null)
    setOk(null)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ticketId: active.id,
          reply: reply.trim(),
          closeAfter,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? `Failed to send reply (HTTP ${res.status})`)

      const newStatus = closeAfter ? 'closed' : 'replied'
      setTickets((prev) => prev.map((t) => (t.id === active.id ? { ...t, status: newStatus } : t)))

      setOk('Reply sent ...')
      setReply('')
      setCloseAfter(false)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to send reply.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      {/* HEADER (kept your vibe) */}
      <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">ADMIN</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">Support Terminal</h1>
          <p className="mt-1 text-xs text-slate-300">
            Signed in as <span className="font-semibold text-slate-100">{adminEmail || '...'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => fetchTickets(false)}
            className="w-full rounded-full border border-white/[0.05] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-400 sm:w-auto"
          >
            Refresh
          </button>

          <Link
            href="/admin"
            className="w-full rounded-full border border-white/[0.05] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-400 sm:w-auto"
          >
            Dashboard
          </Link>

          <Link
            href="/support"
            className="w-full rounded-full bg-cyan-600 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-cyan-500 active:scale-95 sm:w-auto"
          >
            Customer view
          </Link>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/')
            }}
            className="w-full rounded-full border border-slate-700 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-red-400 hover:text-red-200 sm:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Status banners */}
      {loading && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-200">
          Loading...
        </section>
      )}

      {!loading && !isAdmin && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Access denied.'}
        </section>
      )}

      {!loading && isAdmin && (
        <>
          {error && (
            <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
              {error}
            </section>
          )}
          {ok && (
            <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-200">
              {ok}
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* LEFT: tickets list */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-3 px-2 pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Tickets</p>
                <p className="text-[11px] text-slate-400">
                  {loadingTickets ? 'Loading...' : `${tickets.length} total`}
                </p>
              </div>

              {tickets.length === 0 && !loadingTickets && (
                <div className="px-2 py-4 text-sm text-slate-300">No tickets yet.</div>
              )}

              <div className="space-y-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      activeId === t.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-white/[0.05] bg-black/30 hover:bg-black/50'
                    }`}
                  >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {t.subject ?? 'Support request'}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {t.email ?? 'email unknown'} |{' '}
                          {t.created_at ? new Date(t.created_at).toLocaleString() : '-'}
                        </p>
                      </div>
                      <span className="self-start rounded-full border border-slate-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                        {(t.status ?? 'open').toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: ticket detail */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
              {!active ? (
                <p className="text-sm text-slate-300">Select a ticket on the left.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-white">{active.subject ?? 'Support request'}</h2>
                      <p className="mt-1 text-xs text-slate-400">
                        From: <span className="text-slate-200">{active.email ?? '-'}</span> |{' '}
                        {active.created_at ? new Date(active.created_at).toLocaleString() : '-'}
                      </p>
                    </div>

                    <select
                      value={(active.status ?? 'open').toLowerCase()}
                      onChange={(e) => setStatus(active.id, e.target.value as 'open' | 'replied' | 'closed')}
                      className="w-full rounded-full border border-slate-700 bg-black/40 px-3 py-2 text-sm text-slate-100 sm:w-auto"
                    >
                      <option value="open">Open</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-800 bg-black/30 p-4">
                    <p className="whitespace-pre-line text-sm text-slate-100">{active.message ?? '-'}</p>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Reply</p>

                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={6}
                      className="mt-2 w-full rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500/50"
                      placeholder="Type your reply to the customer..."
                    />

                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={closeAfter}
                        onChange={(e) => setCloseAfter(e.target.checked)}
                      />
                      Close ticket after sending reply
                    </label>

                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={sending}
                      className="mt-4 w-full rounded-full bg-cyan-600 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-cyan-500 active:scale-95 disabled:opacity-60"
                    >
                      {sending ? 'Sending...' : 'Send reply'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}








