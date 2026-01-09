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

  useEffect(() => {
    setIsAdmin(getCookie('pufff_is_admin') === 'true')
  }, [])

  const flavours = [
    { label: 'Sweet', value: 'sweet' },
    { label: 'Fruity', value: 'fruity' },
    { label: 'Ice / Mint', value: 'ice-mint' },
    { label: 'Tobacco', value: 'tobacco' },
    { label: 'Soda', value: 'soda' },
    { label: 'Berry', value: 'berry' },
    { label: 'Exotic', value: 'exotic' },
  ]

  return (
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
      <div className="relative group">
        <button
          type="button"
          aria-haspopup="menu"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
        >
          Flavours
        </button>
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-3 w-56 translate-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-3 opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="flex flex-col gap-1">
            {flavours.map((flavour) => (
              <Link
                key={flavour.value}
                href={`/shop?flavour=${flavour.value}`}
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
              >
                {flavour.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
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
  )
}
