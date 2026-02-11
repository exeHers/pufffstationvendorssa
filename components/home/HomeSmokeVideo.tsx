'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Enhanced Home Smoke Video with frame-perfect fading logic.
 * Uses requestAnimationFrame instead of timeupdate to prevent visible jumps/cuts.
 */
export default function HomeSmokeVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const requestRef = useRef<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const video = videoRef.current
    if (!video) return

    // Fading parameters (in seconds)
    const fadeInDuration = 1.5
    const fadeOutDuration = 4.0 // Long fade out for smoothness
    const targetOpacity = 0.7   // Maximum visibility

    const updateFade = () => {
      if (!video) return
      
      const currentTime = video.currentTime
      const duration = video.duration

      if (duration > 0) {
        let nextOpacity = targetOpacity

        // 1. Fade In from the start
        if (currentTime < fadeInDuration) {
          nextOpacity = (currentTime / fadeInDuration) * targetOpacity
        } 
        // 2. Fade Out towards the end
        else if (currentTime > duration - fadeOutDuration) {
          const timeRemaining = duration - currentTime
          // Ensure it hits 0 exactly at duration
          nextOpacity = (timeRemaining / fadeOutDuration) * targetOpacity
        }

        setOpacity(Math.max(0, nextOpacity))
      }

      requestRef.current = requestAnimationFrame(updateFade)
    }

    video.play().catch(() => {})
    requestRef.current = requestAnimationFrame(updateFade)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="relative h-full w-full bg-[#0a0a0c]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        muted
        loop
        playsInline
        preload="auto"
        style={{ 
          transform: 'translateZ(0) scale(1.05)', // Slightly larger to prevent edge artifacts
          willChange: 'opacity',
          opacity: opacity,
          filter: 'brightness(0.6) contrast(1.2) grayscale(0.2)', // Slightly moodier for the home screen
        }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle overlay to help blend with background if the cut is still micro-visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c] opacity-40 pointer-events-none" />
    </div>
  )
}
