'use client'

import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'pufff_age_ok'
const COOKIE_KEY = 'pufff_age_ok'
const COOKIE_DAYS = 30

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

function getCookie(name: string) {
  const parts = document.cookie.split(';').map((p) => p.trim())
  const found = parts.find((p) => p.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.split('=').slice(1).join('='))
}

export default function AgeGate() {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    // Determine state from localStorage + cookie fallback
    try {
      const ls = localStorage.getItem(STORAGE_KEY)
      const ck = getCookie(COOKIE_KEY)

      if (ls === 'true' || ck === 'true') {
        setAllowed(true)
      } else if (ls === 'false' || ck === 'false') {
        setAllowed(false)
      } else {
        setAllowed(null)
      }
    } catch {
      setAllowed(null)
    } finally {
      setReady(true)
    }
  }, [])

  const overlayClass = useMemo(() => {
    return 'fixed inset-0 z-[9999] flex items-center justify-center px-4'
  }, [])

  if (!ready) return null
  if (allowed === true) return null

  const handleYes = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    setCookie(COOKIE_KEY, 'true', COOKIE_DAYS)
    setAllowed(true)
  }

  const handleNo = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'false')
    } catch {}
    setCookie(COOKIE_KEY, 'false', COOKIE_DAYS)
    setAllowed(false)
  }

  return (
    <div className={overlayClass}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="pufff-haze opacity-50" />
        <div className="pufff-tile-breathe opacity-50" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/60 shadow-[0_0_60px_rgba(59,130,246,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/60" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(900px 380px at 20% 20%, rgba(217,70,239,0.35), transparent 60%), radial-gradient(900px 380px at 80% 80%, rgba(34,211,238,0.28), transparent 60%)',
          }}
        />

        <div className="relative p-7 sm:p-9">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Legal Notice
            </div>
            <div className="rounded-full border border-slate-800/70 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              18+ only
            </div>
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
            Confirm your age.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            This store sells disposable vape products intended for adults only.
            Please confirm you are <span className="font-semibold text-white">18 years or older</span>{' '}
            to continue.
          </p>

          {allowed === null ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleYes}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              >
                Yes, I am 18+
              </button>

              <button
                onClick={handleNo}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-fuchsia-500/40 hover:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
              >
                No, take me back
              </button>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5">
              <h3 className="text-base font-bold text-white">Access denied</h3>
              <p className="mt-2 text-sm text-rose-100/90">
                Sorry — you must be 18+ to view this website.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            By continuing, you confirm you meet the legal age requirement in your region.
          </p>
        </div>
      </div>
    </div>
  )
}