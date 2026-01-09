'use client'

import Link from 'next/link'
import { useState } from 'react'

type MenuItem = {
  label: string
  href: string
}

export default function ShopFilters({
  brandLabel,
  flavourLabel,
  brandItems,
  flavourItems,
}: {
  brandLabel: string
  flavourLabel: string
  brandItems: MenuItem[]
  flavourItems: MenuItem[]
}) {
  const [brandOpen, setBrandOpen] = useState(false)
  const [flavourOpen, setFlavourOpen] = useState(false)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="group relative w-full rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-left sm:max-w-[220px]">
        <button
          type="button"
          onClick={() => {
            setBrandOpen((open) => !open)
            setFlavourOpen(false)
          }}
          aria-expanded={brandOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-200"
        >
          {brandLabel}
          <span className="text-slate-500">+</span>
        </button>
        <div
          className={`absolute left-0 right-0 z-20 mt-3 flex-col gap-1 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md ${
            brandOpen ? 'flex' : 'hidden'
          } md:block md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:flex`}
        >
          {brandItems.map((option) => (
            <Link
              key={`${option.label}-${option.href}`}
              href={option.href}
              onClick={() => setBrandOpen(false)}
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="group relative w-full rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-left sm:max-w-[220px]">
        <button
          type="button"
          onClick={() => {
            setFlavourOpen((open) => !open)
            setBrandOpen(false)
          }}
          aria-expanded={flavourOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-200"
        >
          {flavourLabel}
          <span className="text-slate-500">+</span>
        </button>
        <div
          className={`absolute left-0 right-0 z-20 mt-3 flex-col gap-1 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md ${
            flavourOpen ? 'flex' : 'hidden'
          } md:block md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:flex`}
        >
          {flavourItems.map((option) => (
            <Link
              key={`${option.label}-${option.href}`}
              href={option.href}
              onClick={() => setFlavourOpen(false)}
              className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
