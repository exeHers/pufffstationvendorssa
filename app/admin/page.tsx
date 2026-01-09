'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Profile = {
  id: string
  role: string | null
}

export default function AdminHomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)

      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user

      if (!user) {
        router.replace('/login?next=/admin')
        return
      }

      setEmail(user.email ?? '')

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single<Profile>()

      if (profileErr || !profile) {
        setError('Profile not found. Make sure this user exists in the profiles table.')
        setLoading(false)
        return
      }

      setRole(profile.role ?? 'user')

      if (profile.role !== 'admin') {
        setError('Access denied. Your account is not marked as admin in the database.')
        setLoading(false)
        return
      }

      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAdmin = role === 'admin'

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">
            ADMIN
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Signed in as{' '}
            <span className="font-semibold text-slate-100">
              {email || '...'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition"
          >
            Shop
          </Link>

          <Link
            href="/logout"
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-red-400 hover:text-red-200 transition"
          >
            Logout
          </Link>
        </div>
      </header>

      {loading && (
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-200">
          Loading…
        </section>
      )}

      {!loading && !isAdmin && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Access denied.'}
          <p className="mt-2 text-[11px] text-red-200/80">
            Fix: Set this user’s role to{' '}
            <span className="font-mono">admin</span> inside the{' '}
            <span className="font-mono">profiles</span> table on Supabase.
          </p>
        </section>
      )}

      {!loading && isAdmin && (
        <section className="grid gap-4 sm:grid-cols-2">
          <AdminCard
            title="Products"
            desc="Add/edit products, upload images, toggle stock, set accent colors."
            href="/admin/products"
          />
          <AdminCard
            title="Orders"
            desc="Mark shipped/delivered, add tracking, manage customer requests."
            href="/admin/orders"
          />
          <AdminCard
            title="Categories"
            desc="Manage categories & brand groupings."
            href="/admin/categories"
          />
          <AdminCard
            title="Flavours"
            desc="Manage flavour tags shown on the homepage and shop filters."
            href="/admin/flavours"
          />
          <AdminCard
            title="Support"
            desc="View support tickets and respond to customers."
            href="/admin/support"
          />
        </section>
      )}
    </main>
  )
}

function AdminCard({
  title,
  desc,
  href,
}: {
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 hover:border-[#D946EF] transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-white group-hover:text-[#D946EF] transition">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{desc}</p>
        </div>
        <div className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 group-hover:border-[#D946EF] group-hover:text-[#D946EF] transition">
          Open
        </div>
      </div>
    </Link>
  )
}
