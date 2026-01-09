'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Flavour = {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function AdminFlavoursPage() {
  const [loading, setLoading] = useState(true)
  const [flavours, setFlavours] = useState<Flavour[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, Partial<Flavour>>>({})

  const canSubmit = useMemo(() => name.trim().length >= 2, [name])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('flavours')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      setError(error.message)
      setFlavours([])
    } else {
      setFlavours((data ?? []) as Flavour[])
    }
    setLoading(false)
  }

  async function addFlavour() {
    setError(null)
    setOk(null)

    const cleanName = name.trim()
    const cleanSlug = slug.trim() || slugify(cleanName)
    const order = Number(sortOrder || 0)

    if (!cleanName || !cleanSlug) {
      setError('Name and slug are required.')
      return
    }

    const { error } = await supabase.from('flavours').insert([
      {
        name: cleanName,
        slug: cleanSlug,
        sort_order: Number.isFinite(order) ? order : 0,
        is_active: isActive,
      },
    ])

    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setSlug('')
    setSortOrder('0')
    setIsActive(true)
    setOk('Flavour added.')
    await load()
  }

  async function saveFlavour(id: string) {
    setError(null)
    setOk(null)

    const current = flavours.find((f) => f.id === id)
    if (!current) return

    const edit = edits[id] || {}
    const nextName = (edit.name ?? current.name).trim()
    const nextSlug = (edit.slug ?? current.slug).trim()
    const nextOrder = Number(
      edit.sort_order ?? current.sort_order ?? 0
    )
    const nextActive = edit.is_active ?? current.is_active

    if (!nextName || !nextSlug) {
      setError('Name and slug are required.')
      return
    }

    const { error } = await supabase
      .from('flavours')
      .update({
        name: nextName,
        slug: nextSlug,
        sort_order: Number.isFinite(nextOrder) ? nextOrder : 0,
        is_active: nextActive,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setOk('Flavour updated.')
    await load()
  }

  async function removeFlavour(id: string) {
    setError(null)
    setOk(null)

    const { error } = await supabase.from('flavours').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setOk('Flavour removed.')
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
          Admin - Flavours
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Add or edit flavour tags used on the homepage and shop filters.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-5 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Flavour name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sweet, Ice Mint"
              className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sweet"
              className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Order
            </label>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-fuchsia-400"
            />
            Active
          </label>
          <button
            onClick={addFlavour}
            disabled={!canSubmit}
            className="rounded-2xl bg-fuchsia-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">Error: {error}</p>}
        {ok && <p className="mt-4 text-sm text-emerald-300">{ok}</p>}

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Current flavours
          </h2>

          {loading ? (
            <p className="mt-3 text-sm text-slate-400">Loading...</p>
          ) : flavours.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No flavours yet. Add the first one.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {flavours.map((f) => {
                const edit = edits[f.id] || {}
                const currentName = edit.name ?? f.name
                const currentSlug = edit.slug ?? f.slug
                const currentOrder =
                  edit.sort_order ?? f.sort_order ?? 0
                const currentActive =
                  edit.is_active ?? f.is_active

                return (
                  <li
                    key={f.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-4">
                      <input
                        value={currentName}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [f.id]: { ...prev[f.id], name: e.target.value },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
                      />
                      <input
                        value={currentSlug}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [f.id]: { ...prev[f.id], slug: e.target.value },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
                      />
                      <input
                        value={String(currentOrder)}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [f.id]: {
                              ...prev[f.id],
                              sort_order: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-300/60"
                      />
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <input
                          type="checkbox"
                          checked={Boolean(currentActive)}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [f.id]: {
                                ...prev[f.id],
                                is_active: e.target.checked,
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-fuchsia-400"
                        />
                        Active
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => saveFlavour(f.id)}
                        className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-500/15"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => removeFlavour(f.id)}
                        className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-200 transition hover:border-red-300/50 hover:bg-red-500/15"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
