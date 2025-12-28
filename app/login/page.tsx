import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-xl px-4 pb-16 pt-10">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-200">
            Loading…
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  )
}