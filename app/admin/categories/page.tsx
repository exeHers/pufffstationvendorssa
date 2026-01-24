'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Category = {
  id: string
  name: string
  created_at: string
}

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const canSubmit = useMemo(() => name.trim().length >= 2, [name])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setCategories([])
    } else {
      setCategories((data ?? []) as Category[])
    }
    setLoading(false)
  }

  async function addCategory() {
    setError(null)
    setOk(null)

    const clean = name.trim()
    if (clean.length < 2) return

    const { error } = await supabase
      .from('categories')
      .insert([{ name: clean }])

    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setOk('Category added ✅')
    await load()
  }

  async function removeCategory(id: string) {
    setError(null)
    setOk(null)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setOk('Category removed ✅')
    await load()
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-14 pt-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Admin · Categories
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Add or remove brand categories for the shop. Keep it clean, keep it lekker.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-5 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Category name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elfbar, Vapengin, IQOS..."
              className="mt-2 w-full rounded-2xl border border-white/[0.05] bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/50"
            />
          </div>
 
          <button
            onClick={addCategory}
            disabled={!canSubmit}
            className="rounded-2xl bg-violet-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-300">
            Eish: {error}
          </p>
        )}

        {ok && (
          <p className="mt-4 text-sm text-emerald-300">
            {ok}
          </p>
        )}

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Current categories
          </h2>

          {loading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No categories yet. Add the first one, my bru.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeCategory(c.id)}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-200 transition hover:border-red-300/50 hover:bg-red-500/15"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}