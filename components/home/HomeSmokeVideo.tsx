'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomeSmokeVideo() {
  const aRef = useRef<HTMLVideoElement | null>(null)
  const bRef = useRef<HTMLVideoElement | null>(null)
  const fadingRef = useRef(false)
  const activeRef = useRef<'a' | 'b'>('a')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    const fadeDuration = 2000 // 2 second crossfade
    const leadIn = 2.5 // Start fade 2.5s before end

    const setOpacity = (el: HTMLVideoElement, value: number) => {
      el.style.opacity = String(value)
    }

    // Initial state
    a.style.transition = `opacity ${fadeDuration}ms ease-in-out`
    b.style.transition = `opacity ${fadeDuration}ms ease-in-out`
    setOpacity(a, 0.8)
    setOpacity(b, 0)

    const startCrossfade = async () => {
      if (fadingRef.current) return
      fadingRef.current = true

      const current = activeRef.current === 'a' ? a : b
      const next = activeRef.current === 'a' ? b : a

      try {
        next.currentTime = 0
        await next.play()
      } catch (e) {
        // ignore autoplay blocks
      }

      setOpacity(current, 0)
      setOpacity(next, 0.8)

      setTimeout(() => {
        current.pause()
        current.currentTime = 0
        activeRef.current = activeRef.current === 'a' ? 'b' : 'a'
        fadingRef.current = false
      }, fadeDuration + 100)
    }

    const handleTimeUpdate = () => {
      const current = activeRef.current === 'a' ? a : b
      if (!current.duration || isNaN(current.duration)) return
      
      const remaining = current.duration - current.currentTime
      if (remaining <= leadIn) {
        startCrossfade()
      }
    }

    a.addEventListener('timeupdate', handleTimeUpdate)
    b.addEventListener('timeupdate', handleTimeUpdate)

    a.play().catch(() => {})

    return () => {
      a.removeEventListener('timeupdate', handleTimeUpdate)
      b.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [mounted])

  if (!mounted) return null

  const videoClass = "absolute inset-0 h-full w-full object-cover object-center [filter:brightness(0.7)_contrast(1.1)_grayscale(0.1)] sm:[filter:brightness(0.6)_contrast(1.1)_grayscale(0.1)]"

  return (
    <>
      <video
        ref={aRef}
        className={videoClass}
        muted
        playsInline
        preload="auto"
        poster="/hero/neon-smoke.png"
        style={{ transform: 'translateZ(0) scale(1.01)', willChange: 'transform' }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className={videoClass}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ transform: 'translateZ(0) scale(1.01)', opacity: 0, willChange: 'transform' }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
    </>
  )
}
