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

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';').map((p) => p.trim())
  const found = parts.find((p) => p.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.split('=').slice(1).join('='))
}

export default function HeaderLinks() {
  const [isAdmin, setIsAdmin] = useState(false)
<<<<<<< HEAD
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      setIsAdmin(getCookie('pufff_is_admin') === 'true')
    }

    sync()

    const onAdminCookie = () => sync()
    window.addEventListener('pufff-admin-cookie', onAdminCookie)
    return () => window.removeEventListener('pufff-admin-cookie', onAdminCookie)
=======
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const admins = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    if (admins.length === 0) return

    const supabase = supabaseBrowser()
    const syncAdminCookie = async (token?: string | null) => {
      if (!token) return
      await fetch('/api/admin/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email?.toLowerCase() ?? ''
      if (data.session?.access_token) syncAdminCookie(data.session.access_token)
      setIsLoggedIn(Boolean(email))
      setIsAdmin(Boolean(email && admins.includes(email)))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const email = session?.user?.email?.toLowerCase() ?? ''
      if (session?.access_token) syncAdminCookie(session.access_token)
      setIsLoggedIn(Boolean(email))
      setIsAdmin(Boolean(email && admins.includes(email)))
    })

    return () => sub.subscription.unsubscribe()
>>>>>>> ai-build
  }, [])

  return (
    <>
      <div className="hidden items-center gap-7 md:flex">
<<<<<<< HEAD
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Shop
        </Link>
        <Link
          href="/support"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Support
        </Link>

        {isAdmin ? (
          <>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 transition hover:text-white"
            >
              Admin
            </Link>

            <Link
              href="/logout"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200 transition hover:text-white"
            >
              Logout
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
          >
            Login
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] font-semibold text-slate-100"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-slate-900/80 bg-black/95 px-4 pb-4 pt-3 md:hidden">
          <div className="grid gap-2">
            <Link
              href="/"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
=======
        <div className="relative group pt-2">
        <button
          type="button"
          aria-haspopup="menu"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Menu
        </button>
        <div className="pointer-events-none absolute left-0 top-full z-20 -mt-2 w-56 translate-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-3 opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
>>>>>>> ai-build
            >
              Home
            </Link>
            <Link
              href="/shop"
<<<<<<< HEAD
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
=======
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
>>>>>>> ai-build
            >
              Shop
            </Link>
            <Link
              href="/support"
<<<<<<< HEAD
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
=======
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
>>>>>>> ai-build
            >
              Support
            </Link>
            <Link
<<<<<<< HEAD
              href="/orders"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
            >
              My orders
            </Link>
            <Link
              href="/cart"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>

            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Admin dashboard
                </Link>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Admin panel
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Link
                      href="/admin/products"
                      className="rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-sm font-semibold text-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Products
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-sm font-semibold text-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/admin/categories"
                      className="rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-sm font-semibold text-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/admin/support"
                      className="rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-sm font-semibold text-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Support
                    </Link>
                  </div>
                </div>

                <Link
                  href="/logout"
                  className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100"
                  onClick={() => setOpen(false)}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-2xl bg-fuchsia-500 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_0_22px_rgba(217,70,239,0.85)]"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-center text-sm font-semibold text-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
=======
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
              href={isAdmin ? '/logout' : '/login'}
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
            >
              {isAdmin ? 'Logout' : 'Login'}
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
>>>>>>> ai-build
    </>
  )
}
