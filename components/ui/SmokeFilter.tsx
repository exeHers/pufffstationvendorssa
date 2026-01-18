'use client'

import React from 'react'

/**
 * Provides SVG filters to map grayscale video to exact hex colors.
 * Usage: Apply `filter: url(#smoke-filter-{id})` to the video element.
 */
export default function SmokeFilter({ id, hex }: { id: string; hex: string }) {
  // Convert hex to normalized RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Matrix that maps grayscale intensity to the target RGB
  // We use the red channel as the driver for the target color
  const matrix = `
    ${r} 0 0 0 0
    ${g} 0 0 0 0
    ${b} 0 0 0 0
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
