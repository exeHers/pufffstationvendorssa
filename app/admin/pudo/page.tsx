'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function AdminPudoPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  async function loadStatus() {
    try {
      const res = await fetch('/api/admin/pudo/status')
      const json = await res.json()
      setCount(json.count ?? 0)
    } catch {
      setCount(null)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function upload() {
    if (!file) return
    setBusy(true)
    setStatus('Uploading...')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('Not authenticated.')

      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/admin/pudo/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Upload failed.')

      setStatus(`Uploaded. Count: ${json.count ?? 'unknown'}`)
      await loadStatus()
    } catch (e: any) {
      setStatus(e?.message ?? 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin - PUDO Lockers</h1>
        <p className="mt-1 text-sm text-slate-300">
          Upload a full PUDO lockers JSON export to enable all lockers nationwide.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6">
        <div className="text-sm text-slate-300">
          Current locker count: <span className="font-semibold text-white">{count ?? 'unknown'}</span>
        </div>

        <div className="mt-4 grid gap-3">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm"
          />

          <button
            disabled={busy || !file}
            onClick={upload}
            className="rounded-full bg-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {busy ? 'Uploading...' : 'Upload lockers JSON'}
          </button>

          {status && <div className="text-xs text-slate-400">{status}</div>}

          <div className="mt-2 text-[11px] text-slate-400">
            Expected format: JSON array of lockers or an object with a "data" array.
          </div>
        </div>
      </div>
    </main>
  )
}
