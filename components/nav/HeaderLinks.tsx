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