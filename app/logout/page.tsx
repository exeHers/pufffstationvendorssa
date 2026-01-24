'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        await fetch('/api/admin/cookie', { method: 'DELETE' })
        await supabase.auth.signOut()
      } catch {
        // ignore
      }

      // clear admin cookie
      document.cookie =
        'pufff_is_admin=false; path=/; max-age=0; samesite=lax'
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pufff-admin-cookie'))
      }

      router.replace('/shop')
    }

    run()
  }, [router])

  return (
    <main className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-lg flex-col justify-center px-4 py-14">
      <div className="rounded-[2.25rem] border border-slate-800/60 bg-slate-950/50 p-7 text-center shadow-[0_0_60px_rgba(34,211,238,0.06)]">
        <p className="text-sm font-semibold text-slate-300">
          Logging you out…
        </p>
      </div>
    </main>
  )
}
