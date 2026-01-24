'use client'

import React, { useMemo } from 'react'

/**
 * Enhanced Smoke Filter for Mobile & Desktop
 * - Maps grayscale video to a deep, natural version of the target hex.
 * - Handles contrast and brightness inside the SVG for better mobile performance.
 * - Robust hex parsing and reliable SVG rendering.
 * - Uses a hash of the hex in the ID to force browser re-renders on color change.
 */
export default function SmokeFilter({ id, hex }: { id: string; hex: string }) {
  const normalizedHex = useMemo(() => {
    let h = (hex || '#7c3aed').trim().replace('#', '')
    if (h.length === 3) {
      h = h.split('').map(char => char + char).join('')
    }
    return h.padEnd(6, '0').slice(0, 6).toLowerCase()
  }, [hex])

  const r = parseInt(normalizedHex.slice(0, 2), 16) / 255
  const g = parseInt(normalizedHex.slice(2, 4), 16) / 255
  const b = parseInt(normalizedHex.slice(4, 6), 16) / 255

  // Matrix values for the tint
  // We apply a 0.65 multiplier for a natural, non-neon depth.
  const matrixValues = useMemo(() => {
    const factor = 0.65
    const rf = r * factor
    const gf = g * factor
    const bf = b * factor
    return `
      ${rf} ${rf} ${rf} 0 0
      ${gf} ${gf} ${gf} 0 0
      ${bf} ${bf} ${bf} 0 0
      0 0 0 1 0
    `.trim().replace(/\s+/g, ' ')
  }, [r, g, b])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        left: -1,
        top: -1,
        zIndex: -1,
        opacity: 0.01, // Keep it "rendered" but effectively invisible
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`smoke-filter-${id}-${normalizedHex}`} colorInterpolationFilters="sRGB">
          {/* 1. Tint the grayscale video */}
          <feColorMatrix type="matrix" values={matrixValues} result="tinted" />
          
          {/* 2. Apply Brightness and Contrast manually for mobile stability */}
          <feComponentTransfer in="tinted">
            <feFuncR type="linear" slope="1.3" intercept="-0.05" />
            <feFuncG type="linear" slope="1.3" intercept="-0.05" />
            <feFuncB type="linear" slope="1.3" intercept="-0.05" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
