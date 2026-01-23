'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomeSmokeVideo() {
  const aRef = useRef<HTMLVideoElement | null>(null)
  const bRef = useRef<HTMLVideoElement | null>(null)
  const [active, setActive] = useState<'a' | 'b'>('a')
  const [mounted, setMounted] = useState(false)
  const isTransitioning = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    // Start the first video
    a.play().catch(() => {})

    const checkTime = () => {
      const current = active === 'a' ? a : b
      const next = active === 'a' ? b : a

      if (!current.duration) return

      // Trigger crossfade 3 seconds before the video ends
      // Most smoke videos are 10-20s, so 3s is a nice smooth blend
      const triggerTime = current.duration - 3

      if (current.currentTime >= triggerTime && !isTransitioning.current) {
        isTransitioning.current = true
        
        // Prepare and play next video
        next.currentTime = 0
        next.play().then(() => {
          setActive(active === 'a' ? 'b' : 'a')
          
          // Wait for the fade to complete before allowing another transition
          setTimeout(() => {
            current.pause()
            isTransitioning.current = false
          }, 3000)
        }).catch(() => {
          isTransitioning.current = false
        })
      }
    }

    const interval = setInterval(checkTime, 100)
    return () => clearInterval(interval)
  }, [mounted, active])

  if (!mounted) return null

  const baseClass = "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[3000ms] ease-in-out [filter:brightness(0.7)_contrast(1.1)_grayscale(0.1)] sm:[filter:brightness(0.6)_contrast(1.1)_grayscale(0.1)]"

  return (
    <div className="relative h-full w-full">
      <video
        ref={aRef}
        className={`${baseClass} ${active === 'a' ? 'opacity-80' : 'opacity-0'}`}
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
        className={`${baseClass} ${active === 'b' ? 'opacity-80' : 'opacity-0'}`}
        muted
        playsInline
        preload="auto"
        style={{ transform: 'translateZ(0) scale(1.01)', willChange: 'transform' }}
      >
        <source src="/hero/neon-smoke.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
