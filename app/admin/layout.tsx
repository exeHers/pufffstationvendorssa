'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const checkingRef = useRef(false)

  const verifyAdmin = useCallback(async (token: string, userEmail: string) => {
    if (checkingRef.current) return
    checkingRef.current = true
    
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      
      if (json?.isAdmin) {
        setEmail(userEmail)
        setAuthorized(true)
      } else {
        setAuthorized(false)
      }
    } catch (err) {
      console.error('Admin layout verify error:', err)
      setAuthorized(false)
    } finally {
      checkingRef.current = false
    }
  }, [])

  useEffect(() => {
    const supabase = supabaseBrowser()
    let mounted = true

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session?.user && session.access_token) {
        await verifyAdmin(session.access_token, session.user.email ?? '')
      } else {
        setAuthorized(false)
        router.replace('/login?next=/admin')
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      if (event === 'SIGNED_OUT') {
        setAuthorized(false)
        router.replace('/login?next=/admin')
      } else if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        if (session?.user && session.access_token) {
          verifyAdmin(session.access_token, session.user.email ?? '')
        }
      }
    })

    checkAuth()

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [verifyAdmin, router])

  if (authorized === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-violet-500" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Securing Admin Terminal...
        </p>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-500">
           ⚠
        </div>
        <h2 className="text-lg font-extrabold text-white mb-2 uppercase">Access Prohibited</h2>
        <p className="text-xs text-red-200/70 max-w-md mx-auto mb-6">
          Your account is not authorized for administrative access.
        </p>
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white underline decoration-slate-800 underline-offset-8">
          Return to surface
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
