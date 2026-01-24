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
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const syncAdminCookie = async (token?: string | null) => {
    if (!token) return null
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return await res.json()
    } catch (err) {
      console.error('Session sync error:', err)
      return null
    }
  }

  useEffect(() => {
    let mounting = true

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounting) return
      
      const session = data.session
      if (session?.user) {
        // If heading to admin, we MUST wait for sync
        if (session.access_token) {
          const sync = await syncAdminCookie(session.access_token)
          const isAdmin = !!sync?.isAdmin
          
          if (nextPath.startsWith('/admin') && !isAdmin) {
            router.replace('/shop')
          } else {
            router.replace(nextPath)
          }
        } else if (!nextPath.startsWith('/admin')) {
          router.replace(nextPath)
        }
      }
    }

    initAuth()

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounting) return
      
      if (session?.user && event === 'SIGNED_IN') {
        // Wait for sync so the cookie is set before we move
        if (session.access_token) {
          const sync = await syncAdminCookie(session.access_token)
          const isAdmin = !!sync?.isAdmin
          
          if (nextPath.startsWith('/admin') && !isAdmin) {
            router.replace('/shop')
          } else {
            router.replace(nextPath)
          }
        } else if (!nextPath.startsWith('/admin')) {
          router.replace(nextPath)
        }
      }
    })

    return () => {
      mounting = false
      sub.subscription.unsubscribe()
    }
  }, [router, nextPath])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    if (mode === 'signup') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your first and last name.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
            password,
          })
          if (err) throw err
          // onAuthStateChange will handle the redirect after sync
        } else {
        // Sign Up
        const { data: signUpData, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              phone: phone.trim() || null,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: `${firstName.trim()} ${lastName.trim()}`,
            }
          }
        })
        
        if (err) throw err

        // Manual profile update for phone if user is auto-confirmed (common in some Supabase configs)
        if (signUpData.user && phone.trim()) {
           await supabase
            .from('profiles')
            .update({ 
              phone: phone.trim(),
              full_name: `${firstName.trim()} ${lastName.trim()}`
            })
            .eq('id', signUpData.user.id)
        }

        setInfo('Transmission complete. Please check your inbox for the verification link to initialize your terminal.')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function onForgotPassword() {
    setError(null)
    setInfo(null)
    
    if (!email.trim()) {
      setError('Please enter your email first.')
      return
    }
    
    setLoading(true)
    try {
      const verifyRes = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const verifyJson = await verifyRes.json()
      
      if (!verifyJson.exists) {
        setError('This email is not registered in our system.')
        setLoading(false)
        return
      }

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetErr) throw resetErr
      
      setInfo('A recovery link has been dispatched to your inbox. Please check your spam folder if it does not appear within a few minutes.')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-10">
      <div className="mb-4 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/30 px-4 py-1 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-400">
          Security Patch v1.6 Active
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
          ACCOUNT
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          {mode === 'login' ? 'Login' : 'Create an account'}
        </h1>
        <p className="mt-1 text-xs text-slate-300">
          Access the PUFFF terminal to track orders and manage your profile.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  First Name
                </span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="First name"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Last Name
                </span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                  placeholder="Last name"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Email Address
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

          {mode === 'signup' && (
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Phone Number (Optional)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
                placeholder="+27..."
              />
            </label>
          )}

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Password
            </span>
            <div className="relative mt-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                )}
              </button>
            </div>
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
            {loading ? 'Processing...' : mode === 'login' ? 'Authorize' : 'Initialize Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 border-t border-slate-800/50 pt-4 text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-fuchsia-400"
            >
              <span className="underline decoration-fuchsia-500/30 underline-offset-4">Recover Password</span>
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              setError(null)
              setInfo(null)
              setMode((m) => (m === 'login' ? 'signup' : 'login'))
            }}
            className="underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
          >
            {mode === 'login' ? 'New here? Register' : 'Existing user? Login'}
          </button>
          <Link
            href="/shop"
            className="underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
          >
            Return to shop
          </Link>
        </div>
      </div>
    </main>
  )
}
