'use client'

import { useEffect } from 'react'

export default function SiteVisitTracker() {
  useEffect(() => {
    try {
      const key = `visit:${new Date().toISOString().slice(0, 10)}`
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')

      fetch('/api/analytics/visit', { method: 'POST' }).catch(() => {})
    } catch {
      // ignore tracker failures
    }
  }, [])

  return null
}
