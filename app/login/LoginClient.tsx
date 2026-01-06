'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function LoginClient() {
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = useMemo(() => params.get('next') ?? '/orders', [params])

  const initialMode = useMemo(
    () => (params.get('mode') === 'signup' ? 'signup' : 'login'),
    [params]
  )
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  type AuthSession = { user: { id: string }; access_token: string }

  async function syncAdminCookie(session: AuthSession | null) {
    if (!session?.user?.id) return null

    const res = await fetch('/api/admin/cookie', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: session.user.id }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload?.error ?? 'Failed to set admin cookie.')
    }

    const payload = await res.json().catch(() => ({}))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pufff-admin-cookie'))
    }
    return typeof payload?.isAdmin === 'boolean' ? payload.isAdmin : null
  }

  async function handleSessionRedirect(session: AuthSession | null) {
    if (!session?.user) return

    const isAdmin = await syncAdminCookie(session)
    if (nextPath.startsWith('/admin') && isAdmin === false) {
      setError('Access denied. Your account is not marked as admin in the database.')
      return
    }

    router.replace(nextPath)
  }

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    let active = true

    const boot = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session?.user) {
        try {
          await handleSessionRedirect(data.session as AuthSession)
        } catch (err: any) {
          if (active) setError(err?.message ?? 'Failed to load admin session.')
        }
      }
    }

    boot()

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        handleSessionRedirect(session as AuthSession).catch((err: any) => {
          if (active) setError(err?.message ?? 'Failed to load admin session.')
        })
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [router, nextPath])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (err) throw err
        if (data.session?.user) {
          await handleSessionRedirect(data.session as AuthSession)
        }
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (err) throw err
        setInfo('Account created. If email confirmation is enabled, check your inbox.')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-10">
      <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
          ACCOUNT
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          {mode === 'login' ? 'Login' : 'Create an account'}
        </h1>
        <p className="mt-1 text-xs text-slate-300">
          Login is required before checkout so orders and payments stay clean.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Password
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D946EF] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(217,70,239,0.8)] hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              setError(null)
              setInfo(null)
              setMode((m) => (m === 'login' ? 'signup' : 'login'))
            }}
            className="underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
          >
            {mode === 'login' ? 'No account? Sign up' : 'Already have an account? Login'}
          </button>
          <Link
            href="/shop"
            className="underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  )
}
