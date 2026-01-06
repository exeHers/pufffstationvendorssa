'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';').map((p) => p.trim())
  const found = parts.find((p) => p.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.split('=').slice(1).join('='))
}

export default function HeaderLinks() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      setIsAdmin(getCookie('pufff_is_admin') === 'true')
    }

    sync()

    const onAdminCookie = () => sync()
    window.addEventListener('pufff-admin-cookie', onAdminCookie)
    return () => window.removeEventListener('pufff-admin-cookie', onAdminCookie)
  }, [])

  return (
    <>
      <div className="hidden items-center gap-7 md:flex">
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
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/support"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
            <Link
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
    </>
  )
}
