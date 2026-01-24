'use client'

import { useEffect } from 'react'

export default function LuxeAtmosphere() {
  useEffect(() => {
    // prevent scroll-jank on mobile by ensuring body background stays stable
    document.documentElement.classList.add('luxe-ready')
    return () => document.documentElement.classList.remove('luxe-ready')
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 luxe-bg" />

      {/* Bloom lights */}
      <div className="absolute -left-40 top-[-180px] h-[520px] w-[520px] luxe-bloom luxe-bloom-a" />
      <div className="absolute -right-44 bottom-[-220px] h-[620px] w-[620px] luxe-bloom luxe-bloom-b" />

      {/* Moving sheen */}
      <div className="absolute inset-0 luxe-sheen" />

      {/* Film grain */}
      <div className="absolute inset-0 luxe-grain opacity-[0.16]" />
    </div>
  )
}