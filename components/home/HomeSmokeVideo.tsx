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

    // Duration of the fade in/out effect in seconds
    const fadeDuration = 1.5

    const handleTimeUpdate = () => {
      const { currentTime, duration } = video
      if (!duration) return

      let nextOpacity = 0.8 // Base target opacity

      // Fade In at start
      if (currentTime < fadeDuration) {
        nextOpacity = (currentTime / fadeDuration) * 0.8
      } 
      // Fade Out at end
      else if (currentTime > duration - fadeDuration) {
        nextOpacity = ((duration - currentTime) / fadeDuration) * 0.8
      }

      setOpacity(nextOpacity)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.play().catch(() => {})

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="relative h-full w-full">
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
          transition: 'opacity 100ms linear' // Smooth out the timeupdate ticks
        }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
