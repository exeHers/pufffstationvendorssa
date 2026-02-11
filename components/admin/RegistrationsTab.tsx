'use client'

import { useMemo, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function RegistrationsTab() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const sb = supabaseBrowser()
        const { data } = await sb
          .from('profiles')
          .select('id, email, role, full_name, phone, created_at')
          .order('created_at', { ascending: false })

        setRows(data || [])
      } catch (e) {
        console.error('Registrations load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      const isAdmin = String(r.role || '').toLowerCase() === 'admin'
      if (roleFilter === 'admin' && !isAdmin) return false
      if (roleFilter === 'customer' && isAdmin) return false

      if (!q) return true
      const hay = `${r.full_name || ''} ${r.email || ''} ${r.phone || ''} ${r.id || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [rows, query, roleFilter])

  if (loading) {
    return (
      <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-8 text-sm text-slate-400">
        Loading registrations...
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Registrations</h2>
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">
            {filtered.length} users
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone"
            className="rounded-2xl border border-slate-800 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-800 bg-black/40 px-4 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="admin">Admins</option>
            <option value="customer">Customers</option>
          </select>
        </div>
      </div>

      <div className="hidden md:block rounded-[2rem] border border-slate-800 bg-slate-950/40 overflow-hidden">
        <div className="grid grid-cols-[1.2fr,1.6fr,1fr,1fr,1fr] gap-4 border-b border-slate-800 px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Role</div>
          <div>Created</div>
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-[1.2fr,1.6fr,1fr,1fr,1fr] gap-4 border-b border-slate-900 px-6 py-4 text-sm">
              <div className="font-semibold text-white">{r.full_name || 'Unknown'}</div>
              <div className="text-slate-300 break-all">{r.email || 'N/A'}</div>
              <div className="text-slate-400">{r.phone || 'N/A'}</div>
              <div className="text-slate-300 uppercase text-xs">{r.role || 'customer'}</div>
              <div className="text-slate-500 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{r.full_name || 'Unknown'}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{r.role || 'customer'}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2 break-all">{r.email || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-1">{r.phone || 'N/A'}</p>
            <p className="text-[10px] text-slate-500 mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
