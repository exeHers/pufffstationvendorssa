'use client'

import { useEffect } from 'react'

export default function AndroidMotionGate() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent || ''
    if (/Android/i.test(ua)) {
      document.documentElement.dataset.android = 'true'
    } else {
      delete document.documentElement.dataset.android
    }
  }, [])

  return null
}
