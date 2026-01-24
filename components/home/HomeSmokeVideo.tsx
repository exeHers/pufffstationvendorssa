'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomeSmokeVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const video = videoRef.current
    if (!video) return

    // Slower, smoother fade for the home screen loop
    // Fade in over 2s, Fade out over 5s
    const fadeInDuration = 2.0
    const fadeOutDuration = 5.0

    const handleTimeUpdate = () => {
      const { currentTime, duration } = video
      if (!duration) return

      let nextOpacity = 0.8 // Target max opacity

      // 1. Fade In from dark
      if (currentTime < fadeInDuration) {
        nextOpacity = (currentTime / fadeInDuration) * 0.8
      } 
      // 2. Fade Out to dark (start fading out much earlier)
      else if (currentTime > duration - fadeOutDuration) {
        nextOpacity = ((duration - currentTime) / fadeOutDuration) * 0.8
      }

      setOpacity(Math.max(0, nextOpacity))
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.play().catch(() => {})

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="relative h-full w-full bg-[#0a0a0c]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center [filter:brightness(0.7)_contrast(1.1)_grayscale(0.1)] sm:[filter:brightness(0.6)_contrast(1.1)_grayscale(0.1)]"
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/neon-smoke.png"
        style={{ 
          transform: 'translateZ(0) scale(1.01)', 
          willChange: 'transform, opacity',
          opacity: opacity,
          transition: 'opacity 400ms linear' // Linear and slightly longer transition for stability
        }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
