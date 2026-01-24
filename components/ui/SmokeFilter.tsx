'use client'

import React from 'react'

/**
 * Provides SVG filters to map grayscale video to exact hex colors.
 * Optimized for rich color reproduction and mobile performance.
 */
export default function SmokeFilter({ id, hex }: { id: string; hex: string }) {
  // Convert hex to normalized RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Proper tint matrix: 
  // It takes the luminance of the input (weighted R,G,B) 
  // and multiplies it by our target color.
  const matrix = `
    ${r} ${r} ${r} 0 0
    ${g} ${g} ${g} 0 0
    ${b} ${b} ${b} 0 0
    0 0 0 1 0
  `.trim().replace(/\s+/g, ' ')

  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
      <defs>
        <filter id={`smoke-filter-${id}`} colorInterpolationFilters="sRGB">
          {/* 1. Map grayscale to color */}
          <feColorMatrix type="matrix" values={matrix} result="colored" />
          
          {/* 2. Boost contrast and gamma to make it "Neon" */}
          <feComponentTransfer in="colored">
            <feFuncR type="gamma" exponent="0.8" amplitude="1.2" />
            <feFuncG type="gamma" exponent="0.8" amplitude="1.2" />
            <feFuncB type="gamma" exponent="0.8" amplitude="1.2" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
