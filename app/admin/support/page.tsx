'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export default function AdminSupportPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const adminEmails = useMemo(() => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS), [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) {
        router.replace('/login?next=/admin/support')
        return
      }
      setAdminEmail(user.email ?? '')
      if (!adminEmails.includes((user.email ?? '').toLowerCase())) {
        setError('Access denied. Add your admin email to NEXT_PUBLIC_ADMIN_EMAILS (Vercel + .env.local).')
      }
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAdmin = adminEmails.length > 0 && adminEmails.includes(adminEmail.toLowerCase())

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">ADMIN</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Support</h1>
          <p className="mt-1 text-xs text-slate-300">Signed in as <span className="font-semibold text-slate-100">{adminEmail || '...'}</span></p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition">Dashboard</Link>
          <Link href="/support" className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition">Customer view</Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/')
            }}
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-red-400 hover:text-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {loading && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-200">Loading…</section>
      )}

      {!loading && !isAdmin && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Access denied.'}
        </section>
      )}

      {!loading && isAdmin && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6">
          <p className="text-sm font-semibold text-slate-100">Support dashboard is ready as a route.</p>
          <p className="mt-2 text-sm text-slate-300">
            Next we’ll wire this to <span className="font-mono">support_messages</span> so your cousin can view tickets and mark them open/in_progress/closed.
          </p>
        </section>
      )}
    </main>
  )
}
