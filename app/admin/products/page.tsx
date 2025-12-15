'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

type Product = {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  image_url: string | null
  in_stock: boolean
  is_deleted?: boolean
  deleted_at?: string | null
  created_at?: string
}

export default function AdminProductsPage() {
  const [email, setEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [showRemoved, setShowRemoved] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [inStock, setInStock] = useState(true)
  const [image, setImage] = useState<File | null>(null)

  const adminEmails = useMemo(() => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS), [])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const em = (data.session?.user?.email ?? '').toLowerCase()
      setEmail(em)
      setIsAdmin(Boolean(em && adminEmails.includes(em)))
    })()
  }, [adminEmails])

  async function refreshProducts() {
    setErr(null)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErr(error.message)
      return
    }
    if (data) setProducts(data as any)
  }

  useEffect(() => {
    refreshProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function adminAction(body: any) {
    setErr(null)
    setOk(null)

    if (!isAdmin) {
      setErr('Access denied. (You are not admin.)')
      return
    }

    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Admin action failed.')

      setOk('Updated ✅')
      await refreshProducts()
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function onCreate() {
    setErr(null)
    setOk(null)

    if (!isAdmin) {
      setErr('Access denied. (You are not admin.)')
      return
    }

    if (!name.trim() || !category.trim() || !price.trim()) {
      setErr('Fill in: name, category, price.')
      return
    }

    const priceNum = Number(price)
    if (!Number.isFinite(priceNum)) {
      setErr('Price must be a valid number.')
      return
    }

    setLoading(true)
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('category', category.trim())
      fd.append('price', String(priceNum))
      fd.append('description', description.trim())
      fd.append('in_stock', inStock ? 'true' : 'false')
      if (image) fd.append('image', image)

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to create product.')

      setOk('Product created and uploaded successfully ✅')
      setName('')
      setCategory('')
      setPrice('')
      setDescription('')
      setInStock(true)
      setImage(null)

      await refreshProducts()
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (showRemoved) return products
    return products.filter((p) => !p.is_deleted)
  }, [products, showRemoved])

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-slate-800 bg-black/50 p-6">
          <h1 className="text-2xl font-bold">Admin – Products</h1>
          <p className="mt-2 text-sm text-slate-300">
            Access denied. Add your admin email to NEXT_PUBLIC_ADMIN_EMAILS (Vercel + .env.local).
          </p>
          <p className="mt-2 text-xs text-slate-400">Signed in as: {email || '—'}</p>
          <div className="mt-6">
            <Link href="/admin" className="underline text-fuchsia-300">
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-slate-300">
            Add products + manage stock + remove/restore products (no code edits needed).
          </p>
        </div>
        <Link href="/admin" className="rounded-full border border-slate-700 px-4 py-2 text-sm">
          Back
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* CREATE */}
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6">
          <h2 className="text-lg font-bold">Create product</h2>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          )}
          {ok && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {ok}
            </div>
          )}

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Name</span>
              <input
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Category</span>
              <input
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Nasty Bar"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Price (ZAR)</span>
              <input
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 280"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Description</span>
              <textarea
                className="min-h-[110px] rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Image</span>
              <input
                type="file"
                accept="image/*"
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              <p className="text-[11px] text-slate-400">
                Uploads to Supabase Storage → saves public URL.
              </p>
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
              In stock
            </label>

            <button
              onClick={onCreate}
              disabled={loading}
              className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)] disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </div>

        {/* LIST + MANAGE */}
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Latest products</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showRemoved}
                  onChange={(e) => setShowRemoved(e.target.checked)}
                />
                Show removed
              </label>
              <button onClick={refreshProducts} className="rounded-full border border-slate-700 px-4 py-2 text-sm">
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length === 0 && <p className="text-sm text-slate-400">No products yet.</p>}

            {filtered.slice(0, 18).map((p) => {
              const removed = Boolean(p.is_deleted)
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 rounded-2xl border bg-slate-950/40 p-4 ${
                    removed ? 'border-red-500/30 opacity-80' : 'border-slate-800'
                  }`}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-800 bg-black/40">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {p.name}{' '}
                      {removed ? <span className="text-xs text-red-300">(removed)</span> : null}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.category} • R{Number(p.price).toFixed(2)} • {p.in_stock ? 'In stock' : 'Out of stock'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!removed ? (
                      <>
                        <button
                          disabled={loading}
                          onClick={() =>
                            adminAction({ action: 'set_stock', id: p.id, in_stock: !p.in_stock })
                          }
                          className="rounded-full border border-slate-700 px-3 py-1.5 text-xs hover:border-fuchsia-500/40 disabled:opacity-60"
                        >
                          {p.in_stock ? 'Set out of stock' : 'Set in stock'}
                        </button>

                        <button
                          disabled={loading}
                          onClick={() => {
                            const ok = window.confirm(
                              `Remove "${p.name}" from the shop?\n\nThis is a soft delete — you can restore it later.`
                            )
                            if (ok) adminAction({ action: 'soft_delete', id: p.id })
                          }}
                          className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={loading}
                        onClick={() => adminAction({ action: 'restore', id: p.id })}
                        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}