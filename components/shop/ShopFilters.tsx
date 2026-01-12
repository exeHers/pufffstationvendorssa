'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const brandRef = useRef<HTMLDivElement>(null)
  const flavourRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setBrandOpen(false)
      }
      if (flavourRef.current && !flavourRef.current.contains(event.target as Node)) {
        setFlavourOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div
        ref={brandRef}
        className="relative w-full rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-left transition-all duration-300 hover:border-[#D946EF]/50 sm:max-w-[220px]"
      >
        <button
          type="button"
          onClick={() => {
            setBrandOpen((open) => !open)
            setFlavourOpen(false)
          }}
          aria-expanded={brandOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.24em] text-slate-100"
        >
          {brandLabel}
          <motion.span
            animate={{ rotate: brandOpen ? 45 : 0 }}
            className="text-[#D946EF]"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence>
          {brandOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 right-0 z-20 mt-4 flex flex-col gap-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="max-h-[240px] overflow-y-auto overflow-x-hidden p-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
                {brandItems.map((option) => (
                  <Link
                    key={`${option.label}-${option.href}`}
                    href={option.href}
                    onClick={() => setBrandOpen(false)}
                    className="flex rounded-xl px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-[#D946EF]/10 hover:text-[#D946EF]"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={flavourRef}
        className="relative w-full rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-left transition-all duration-300 hover:border-[#D946EF]/50 sm:max-w-[220px]"
      >
        <button
          type="button"
          onClick={() => {
            setFlavourOpen((open) => !open)
            setBrandOpen(false)
          }}
          aria-expanded={flavourOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.24em] text-slate-100"
        >
          {flavourLabel}
          <motion.span
            animate={{ rotate: flavourOpen ? 45 : 0 }}
            className="text-[#D946EF]"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence>
          {flavourOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 right-0 z-20 mt-4 flex flex-col gap-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="max-h-[240px] overflow-y-auto overflow-x-hidden p-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
                {flavourItems.map((option) => (
                  <Link
                    key={`${option.label}-${option.href}`}
                    href={option.href}
                    onClick={() => setFlavourOpen(false)}
                    className="flex rounded-xl px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-[#D946EF]/10 hover:text-[#D946EF]"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
