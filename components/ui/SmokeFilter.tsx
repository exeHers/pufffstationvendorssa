'use client'

import React, { useMemo } from 'react'

/**
 * Enhanced Smoke Filter for Mobile & Desktop
 * - Maps grayscale video to a deep, natural version of the target hex.
 * - TOTAL NEON REMOVAL: Using a low factor (0.35) for a matte, natural look.
 * - No contrast or brightness boosting.
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
  // Using 0.35 factor for a very dark, natural matte appearance.
  const matrixValues = useMemo(() => {
    const factor = 0.35
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
        opacity: 0,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`smoke-filter-${id}-${normalizedHex}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrixValues} />
        </filter>
      </defs>
    </svg>
  )
}
