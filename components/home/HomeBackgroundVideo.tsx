'use client'

import React from 'react'

export default function HomeBackgroundVideo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <video
        className="h-full w-full object-cover object-center opacity-[0.8] [filter:brightness(0.7)_contrast(1.1)_grayscale(0.1)] sm:[filter:brightness(0.6)_contrast(1.1)_grayscale(0.1)]"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero/neon-smoke.png"
        aria-hidden="true"
        style={{ transform: 'translateZ(0) scale(1.01)', willChange: 'transform' }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
      
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
            'radial-gradient(700px 380px at 75% 35%, rgba(217,70,239,0.18), transparent 68%),' +
            'radial-gradient(800px 480px at 65% 80%, rgba(59,130,246,0.15), transparent 70%)',
        }}
      />
    </div>
  )
}
