'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already logged in, bounce to admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) router.replace('/admin')
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      setLoading(false)
      setError(error?.message || 'Login failed.')
      return
    }

    // Check admin role in profiles table
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const isAdmin = !profileErr && profile?.role === 'admin'

    // Set cookie for middleware
    document.cookie = `pufff_is_admin=${isAdmin ? 'true' : 'false'}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`

    setLoading(false)

    if (isAdmin) {
      router.replace(nextUrl)
    } else {
      router.replace('/shop')
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-lg flex-col justify-center px-4 py-14">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-800/60 bg-slate-950/50 p-7 shadow-[0_0_60px_rgba(34,211,238,0.06)]">
        <div className="absolute inset-0 pufff-haze opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-950/50 to-slate-900/60" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(900px 380px at 20% 20%, rgba(217,70,239,0.30), transparent 60%), radial-gradient(900px 380px at 80% 80%, rgba(34,211,238,0.22), transparent 60%)',
          }}
        />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Admin Only
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            Login
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            This section is restricted. Only admin accounts can access the panel.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.25)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            If you’re not an admin, you’ll be redirected to the shop.
          </p>
        </div>
      </div>
    </main>
  )
}