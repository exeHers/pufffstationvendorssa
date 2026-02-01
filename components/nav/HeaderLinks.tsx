'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CartBadge from '@/components/cart/CartBadge'
import { supabaseBrowser } from '@/lib/supabase/browser'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) =>
      s
        .trim()
        .replace(/^"+|"+$/g, '')
        .replace(/^'+|'+$/g, '')
        .toLowerCase()
    )
    .filter(Boolean)
}

export default function HeaderLinks() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const admins = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    if (admins.length === 0) return

    const supabase = supabaseBrowser()
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email?.toLowerCase() ?? ''
      setIsLoggedIn(Boolean(email))
      setIsAdmin(Boolean(email && admins.includes(email)))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const email = session?.user?.email?.toLowerCase() ?? ''
      setIsLoggedIn(Boolean(email))
      setIsAdmin(Boolean(email && admins.includes(email)))
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <>
      <div className="hidden items-center gap-7 md:flex">
        <div className="relative group pt-2">
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
          >
            Menu
          </button>
          <div className="pointer-events-none absolute left-0 top-full z-20 -mt-2 w-56 translate-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-3 opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Shop
              </Link>
              <Link
                href="/support"
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Support
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Cart
                <CartBadge />
              </Link>
              <Link
                href="/orders"
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                My orders
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-slate-800/70 hover:text-white"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href={isLoggedIn ? '/logout' : '/login'}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="rounded-full border border-slate-800/70 bg-slate-950/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200"
        >
          Menu
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-30 mt-3 w-60 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Shop
              </Link>
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Support
              </Link>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                Cart
                <CartBadge />
              </Link>
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                My orders
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-slate-800/70 hover:text-white"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href={isLoggedIn ? '/logout' : '/login'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
