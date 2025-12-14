'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type ProductRow = {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  category?: string | null
  price: number
  bulk_price?: number | null
  bulk_min_qty?: number | null
  in_stock: boolean
  created_at?: string | null
}

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string>('')
  const [products, setProducts] = useState<ProductRow[]>([])

  const adminEmails = useMemo(() => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS), [])
  const isAdmin = useMemo(() => {
    if (!adminEmail) return false
    if (adminEmails.length === 0) return false
    return adminEmails.includes(adminEmail.toLowerCase())
  }, [adminEmail, adminEmails])

  // form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkMinQty, setBulkMinQty] = useState('')
  const [inStock, setInStock] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function loadProducts() {
    setLoading(true)
    setError(null)

    const { data: sess } = await supabase.auth.getSession()
    const user = sess.session?.user
    if (!user) {
      router.replace('/login?next=/admin/products')
      return
    }

    setAdminEmail(user.email ?? '')
    if (!adminEmails.includes((user.email ?? '').toLowerCase())) {
      setError('Access denied. Add your admin email to NEXT_PUBLIC_ADMIN_EMAILS (Vercel + .env.local).')
      setProducts([])
      setLoading(false)
      return
    }

    try {
      const { data, error: err } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(500)
      if (err) throw err
      setProducts((data ?? []) as ProductRow[])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function uploadImageIfAny(): Promise<string | null> {
    if (!imageFile) return null
    const safe = slugify(name || 'product') || 'product'
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${safe}_${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage.from('product-images').upload(path, imageFile, {
      cacheControl: '3600',
      upsert: false,
    })
    if (upErr) throw upErr

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function createProduct() {
    setError(null)
    if (!isAdmin) {
      setError('Access denied.')
      return
    }
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const p = Number(price)
    if (!Number.isFinite(p) || p <= 0) {
      setError('Price must be a valid number > 0.')
      return
    }

    setSaving(true)
    try {
      const imageUrl = await uploadImageIfAny()
      const payload: any = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        category: category.trim() ? category.trim() : null,
        price: p,
        bulk_price: bulkPrice.trim() ? Number(bulkPrice) : null,
        bulk_min_qty: bulkMinQty.trim() ? Number(bulkMinQty) : null,
        in_stock: inStock,
        image_url: imageUrl,
      }

      const { error: insErr } = await supabase.from('products').insert(payload)
      if (insErr) throw insErr

      // reset
      setName('')
      setCategory('')
      setDescription('')
      setPrice('')
      setBulkPrice('')
      setBulkMinQty('')
      setInStock(true)
      setImageFile(null)

      await loadProducts()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStock(id: string, value: boolean) {
    setError(null)
    try {
      const { error: upErr } = await supabase.from('products').update({ in_stock: value }).eq('id', id)
      if (upErr) throw upErr
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: value } : p)))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update stock.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D946EF]">ADMIN</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Products</h1>
          <p className="mt-1 text-xs text-slate-300">Signed in as <span className="font-semibold text-slate-100">{adminEmail || '...'}</span></p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition">Dashboard</Link>
          <Link href="/shop" className="rounded-full bg-[#D946EF] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:brightness-110 active:scale-95 transition">Shop</Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/')
            }}
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-red-400 hover:text-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {!isAdmin && (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Access denied.'}
          <p className="mt-2 text-[11px] text-red-200/80">
            Fix: set <span className="font-mono">NEXT_PUBLIC_ADMIN_EMAILS</span> in Vercel + .env.local.
          </p>
        </section>
      )}

      {isAdmin && (
        <>
          {error && (
            <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">{error}</section>
          )}

          <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5">
            <h2 className="text-lg font-extrabold tracking-tight text-white">Add a product</h2>
            <p className="mt-1 text-xs text-slate-300">Fill in the details, pick an image, and it uploads + saves automatically.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <div className="mb-1 text-white/70">Name</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nasty Bar 8500" />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-white/70">Category (text)</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Nasty Bar" />
              </label>

              <label className="text-sm sm:col-span-2">
                <div className="mb-1 text-white/70">Description</div>
                <textarea className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short description" />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-white/70">Price (ZAR)</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="e.g. 250" />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-white/70">In stock</div>
                <select className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={inStock ? 'yes' : 'no'} onChange={(e) => setInStock(e.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="text-sm">
                <div className="mb-1 text-white/70">Bulk price (optional)</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} inputMode="decimal" placeholder="e.g. 220" />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-white/70">Bulk min qty (optional)</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" value={bulkMinQty} onChange={(e) => setBulkMinQty(e.target.value)} inputMode="numeric" placeholder="e.g. 5" />
              </label>

              <label className="text-sm sm:col-span-2">
                <div className="mb-1 text-white/70">Image</div>
                <input className="w-full rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                <div className="mt-1 text-[11px] text-slate-400">Uploads to Supabase Storage bucket: <span className="text-slate-200">product-images</span></div>
              </label>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={createProduct}
              className="mt-4 w-full rounded-full bg-fuchsia-500 px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(217,70,239,0.85)] hover:brightness-110 active:scale-95 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create product'}
            </button>
          </section>

          <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">Products list</h2>
                <p className="mt-1 text-xs text-slate-300">Tap stock to toggle. Newest first.</p>
              </div>
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-[#D946EF] hover:text-[#D946EF] transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-4 text-sm text-slate-200">Loading…</div>
            ) : products.length === 0 ? (
              <div className="mt-4 text-sm text-slate-300">No products yet.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="flex gap-3 rounded-2xl border border-slate-800 bg-black/30 p-4">
                    <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-white">{p.name}</p>
                          <p className="mt-0.5 text-xs text-slate-300">
                            {(p.category ?? 'No category')} • R{Number(p.price).toFixed(2)}
                            {p.bulk_price != null && p.bulk_min_qty != null ? (
                              <>
                                {' '}• Bulk R{Number(p.bulk_price).toFixed(2)} @ {p.bulk_min_qty}+
                              </>
                            ) : null}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStock(p.id, !p.in_stock)}
                          className={`rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] transition ${
                            p.in_stock
                              ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 hover:brightness-110'
                              : 'bg-red-500/15 text-red-200 border border-red-500/30 hover:brightness-110'
                          }`}
                        >
                          {p.in_stock ? 'In stock' : 'Out of stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
