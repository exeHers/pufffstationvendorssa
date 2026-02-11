'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="rounded-full border border-slate-800/70 bg-slate-950/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-cyan-500/50 hover:text-white"
    >
      Back
    </button>
  )
}
