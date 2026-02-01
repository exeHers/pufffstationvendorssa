'use client'

import React, { useMemo } from 'react'

/**
 * Enhanced Smoke Filter for Mobile & Desktop
 * - Maps grayscale video to a deep, natural version of the target hex.
 * - Uses correct grayscale-to-tint matrix math for maximum compatibility.
 * - Ensures visibility in the DOM for Safari/Mobile.
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

  // Matrix: Maps any source color (via luminance) to the target tint.
  // Standard Luminance coefficients: 0.2126, 0.7152, 0.0722
  const matrixValues = useMemo(() => {
    const matteFactor = 0.55 // Increased for visibility
    const rf = r * matteFactor
    const gf = g * matteFactor
    const bf = b * matteFactor
    
    return `
      ${rf * 0.2126} ${rf * 0.7152} ${rf * 0.0722} 0 0
      ${gf * 0.2126} ${gf * 0.7152} ${gf * 0.0722} 0 0
      ${bf * 0.2126} ${bf * 0.7152} ${bf * 0.0722} 0 0
      0 0 0 1 0
    `.trim().replace(/\s+/g, ' ')
  }, [r, g, b])

  const filterId = `smoke-filter-${id}-${normalizedHex}`

  return (
    <svg
      key={filterId}
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      style={{
        position: 'absolute',
        top: -1,
        left: -1,
        width: 1,
        height: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.01, // Minimal opacity to stay in render tree but invisible
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrixValues} />
        </filter>
      </defs>
    </svg>
  )
}
