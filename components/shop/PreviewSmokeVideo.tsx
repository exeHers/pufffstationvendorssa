'use client'
 
 import { useEffect, useMemo, useRef } from 'react'
 import SmokeFilter from '@/components/ui/SmokeFilter'
 
 type Props = {
   className?: string
   style?: React.CSSProperties
   src: string
   poster?: string
   id: string
   hex: string
 }
 
 export default function PreviewSmokeVideo({ className, style, src, poster, id, hex }: Props) {
  const aRef = useRef<HTMLVideoElement | null>(null)
  const bRef = useRef<HTMLVideoElement | null>(null)
  const fadingRef = useRef(false)
  const activeRef = useRef<'a' | 'b'>('a')

  useEffect(() => {
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    const fadeDuration = 1.05
    const leadIn = 1.4
    const baseOpacity =
      typeof style?.opacity === 'number'
        ? style.opacity
        : style?.opacity
          ? Number(style.opacity)
          : 1

    const setOpacity = (el: HTMLVideoElement, value: number) => {
      el.style.opacity = String(value)
    }

    a.style.transition = `opacity ${Math.round(fadeDuration * 1000)}ms linear`
    b.style.transition = `opacity ${Math.round(fadeDuration * 1000)}ms linear`
    setOpacity(a, baseOpacity)
    setOpacity(b, 0)

    const startCrossfade = async () => {
      if (fadingRef.current) return
      fadingRef.current = true

      const current = activeRef.current === 'a' ? a : b
      const next = activeRef.current === 'a' ? b : a

      try {
        next.currentTime = 0
        await next.play()
      } catch {
        // ignore autoplay failures
      }

      setOpacity(current, 0)
      setOpacity(next, baseOpacity)

      window.setTimeout(() => {
        current.pause()
        current.currentTime = 0
        activeRef.current = activeRef.current === 'a' ? 'b' : 'a'
        fadingRef.current = false
      }, Math.round(fadeDuration * 1000) + 50)
    }

    const handleTimeUpdate = () => {
      const current = activeRef.current === 'a' ? a : b
      if (!current.duration || Number.isNaN(current.duration)) return
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
  }, [])

  const { opacity: _opacity, ...restStyle } = style ?? {}
  const videoStyle = useMemo(() => restStyle, [restStyle])

  return (
    <>
      <SmokeFilter id={id} hex={hex} />
      <video
        ref={aRef}
        className={className}
        style={videoStyle}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className={className}
        style={videoStyle}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  )
}
