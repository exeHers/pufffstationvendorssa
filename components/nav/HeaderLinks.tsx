'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CartBadge from '@/components/cart/CartBadge'

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';').map((p) => p.trim())
  const found = parts.find((p) => p.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.split('=').slice(1).join('='))
}

export default function HeaderLinks() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(getCookie('pufff_is_admin') === 'true')
  }, [])

  return (
    <div className="hidden items-center gap-7 md:flex">
      <div className="relative group">
        <button
          type="button"
          aria-haspopup="menu"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Menu
        </button>
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-3 w-56 translate-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-3 opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
              href={isAdmin ? '/logout' : '/login'}
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
            >
              {isAdmin ? 'Logout' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
