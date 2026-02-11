'use client'

import React from 'react'
import HomeSmokeVideo from './HomeSmokeVideo'

export default function HomeBackgroundVideo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <HomeSmokeVideo />
      
      {/* Dynamic Overlays for depth and contrast */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
      
      {/* Ambient Radial Glows */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(900px 420px at 15% 20%, rgba(34,211,238,0.2), transparent 70%),' +
            'radial-gradient(700px 380px at 75% 35%, rgba(16,185,129,0.18), transparent 68%),' +
            'radial-gradient(800px 480px at 65% 80%, rgba(59,130,246,0.15), transparent 70%)',
        }}
      />
    </div>
  )
}
