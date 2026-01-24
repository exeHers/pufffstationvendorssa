'use client'

import React from 'react'

/**
 * Natural Smoke Filter
 * Maps grayscale video to a darker, natural version of the target hex.
 */
export default function SmokeFilter({ id, hex }: { id: string; hex: string }) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Darkened tint matrix (multiplied by 0.6 for a deeper, non-neon look)
  const matrix = `
    ${r * 0.6} ${r * 0.6} ${r * 0.6} 0 0
    ${g * 0.6} ${g * 0.6} ${g * 0.6} 0 0
    ${b * 0.6} ${b * 0.6} ${b * 0.6} 0 0
    0 0 0 1 0
  `.trim().replace(/\s+/g, ' ')

  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
      <defs>
        <filter id={`smoke-filter-${id}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matrix} />
        </filter>
      </defs>
    </svg>
  )
}
