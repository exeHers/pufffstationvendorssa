'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/components/cart/CartContext'
import { supabase } from '@/lib/supabaseClient'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const { items } = useCart()
  const [isAdmin, setIsAdmin] = useState(false)

  const cartCount = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + Number(item.quantity ?? 1), 0)
  }, [items])

  useEffect(() => {
    ;(async () => {
      const adminEmails = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
      if (adminEmails.length === 0) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      const email = data.session?.user?.email?.toLowerCase() ?? ''
      setIsAdmin(Boolean(email && adminEmails.includes(email)))
    })()
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Thin purple line on very top */}
      <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500" />

      <div className="border-b border-slate-900/80 bg-black/95 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {/* LEFT: brand */}
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex flex-col leading-none">
              <span className="text-[16px] font-semibold tracking-[0.18em] text-white uppercase sm:text-[19px] sm:tracking-[0.25em]">
                PUFFF <span className="text-fuchsia-400">STATION</span>
              </span>
              <span className="mt-1 text-[10px] tracking-[0.28em] text-slate-400 uppercase sm:text-[11px] sm:tracking-[0.35em]">
                VENDORS
              </span>
            </div>
          </Link>

          {/* RIGHT: desktop nav */}
          <nav className="hidden items-center gap-2 text-xs font-medium sm:flex">
            <Link
              href="/"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Shop
            </Link>
            <Link
              href="/support"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Support
            </Link>

            <Link
              href="/cart"
              className="relative rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-[0_0_18px_rgba(217,70,239,0.9)]">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/orders"
              className="rounded-full px-4 py-1.5 text-slate-200 transition hover:bg-slate-800/80 hover:text-white"
            >
              My orders
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-1.5 text-slate-100 transition hover:bg-fuchsia-500/20 hover:text-white"
              >
                Admin
              </Link>
            )}

            <Link
              href="/login"
              className="rounded-full bg-slate-50 px-5 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition hover:bg-white active:scale-95"
            >
              Login
            </Link>
          </nav>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/cart"
              className="relative rounded-full border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] font-semibold text-slate-100"
              onClick={() => setOpen(false)}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] font-semibold text-slate-100"
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="border-t border-slate-900/80 bg-black/95 px-4 pb-4 pt-3 sm:hidden">
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

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/login"
                className="rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-[0_0_22px_rgba(217,70,239,0.85)]"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
