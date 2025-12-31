'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Product, Category } from '@/lib/types'

type Profile = { id: string; role: string | null }

function safeNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function money(v: any) {
  const n = safeNum(v)
  return `R${n.toFixed(2)}`
}

function isValidHex(hex: string) {
  const h = hex.trim()
  return /^#[0-9a-fA-F]{6}$/.test(h)
}

const BG_REMOVE_PRIMARY = 'https://express.adobe.com/tools/remove-background'
const BG_REMOVE_BACKUP = 'https://pixlr.com/remove-background/'

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // filters
  const [q, setQ] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStock, setFilterStock] = useState<'all' | 'in' | 'out'>('all')
  const [showRemoved, setShowRemoved] = useState(false)

  // create form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkMin, setBulkMin] = useState('')
  const [description, setDescription] = useState('')
  const [inStock, setInStock] = useState(true)
  const [accentHex, setAccentHex] = useState('#D946EF')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)

  // drawer form (edit)
  const [eName, setEName] = useState('')
  const [eCategory, setECategory] = useState('')
  const [ePrice, setEPrice] = useState('')
  const [eBulkPrice, setEBulkPrice] = useState('')
  const [eBulkMin, setEBulkMin] = useState('')
  const [eDescription, setEDescription] = useState('')
  const [eInStock, setEInStock] = useState(true)
  const [eAccentHex, setEAccentHex] = useState('#D946EF')
  const [eImageUrl, setEImageUrl] = useState<string>('')

  // drawer image replace
  const [eImageFile, setEImageFile] = useState<File | null>(null)
  const [eImagePreview, setEImagePreview] = useState<string>('')

  // ---- Auth + role check ----
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr(null)
      setOk(null)

      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user

      if (!user) {
        setLoading(false)
        setErr('Not logged in. Please login first.')
        return
      }

      setEmail(user.email ?? '')

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single<Profile>()

      if (profileErr || !profile) {
        setLoading(false)
        setErr('Profile not found. Ensure this user exists in the profiles table.')
        return
      }

      const admin = profile.role === 'admin'
      setIsAdmin(admin)

      if (!admin) {
        setLoading(false)
        setErr('Access denied. You are not marked as admin in profiles.role.')
        return
      }

      await Promise.all([refreshProducts(), refreshCategories()])
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // cleanup object urls
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      if (eImagePreview) URL.revokeObjectURL(eImagePreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErr(error.message)
      return
    }
    setProducts((data ?? []) as any)
  }

  async function refreshCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return
    }
    setCategories((data ?? []) as any)
  }

  function openDrawer(p: Product) {
    setSelected(p)
    setDrawerOpen(true)

    setOk(null)
    setErr(null)

    setEName(p.name ?? '')
    setECategory(p.category ?? '')
    setEPrice(p.price != null ? String(p.price) : '')
    setEBulkPrice(p.bulk_price != null ? String(p.bulk_price) : '')
    setEBulkMin(p.bulk_min != null ? String(p.bulk_min) : '')
    setEDescription(p.description ?? '')
    setEInStock(p.in_stock !== false)
    setEAccentHex(p.accent_hex && isValidHex(p.accent_hex) ? p.accent_hex : '#D946EF')
    setEImageUrl(p.image_url ?? '')

    setEImageFile(null)
    if (eImagePreview) URL.revokeObjectURL(eImagePreview)
    setEImagePreview('')
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setSelected(null)
    setOk(null)
    setErr(null)

    setEImageFile(null)
    if (eImagePreview) URL.revokeObjectURL(eImagePreview)
    setEImagePreview('')
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (!showRemoved) list = list.filter((p) => !p.is_deleted)

    if (filterCategory !== 'all') {
      list = list.filter((p) => (p.category ?? '').toLowerCase() === filterCategory.toLowerCase())
    }

    if (filterStock !== 'all') {
      list = list.filter((p) =>
        filterStock === 'in' ? p.in_stock !== false : p.in_stock === false
      )
    }

    const query = q.trim().toLowerCase()
    if (query) {
      list = list.filter((p) => {
        return (
          (p.name ?? '').toLowerCase().includes(query) ||
          (p.category ?? '').toLowerCase().includes(query) ||
          (p.description ?? '').toLowerCase().includes(query)
        )
      })
    }

    return list
  }, [products, showRemoved, filterCategory, filterStock, q])

  // ---- Image helpers ----
  function setCreateImage(file: File | null) {
    setImage(file)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  function setEditImage(file: File | null) {
    setEImageFile(file)
    if (eImagePreview) URL.revokeObjectURL(eImagePreview)
    setEImagePreview(file ? URL.createObjectURL(file) : '')
  }

  async function uploadEditImage() {
    setErr(null)
    setOk(null)

    if (!selected) return
    if (!eImageFile) {
      setErr('Choose an image first.')
      return
    }

    setBusy(true)

    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const fd = new FormData()
      fd.append('id', selected.id)
      fd.append('name', eName.trim() || selected.name || 'product')
      fd.append('image', eImageFile)

      const res = await fetch('/api/admin/products/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to replace image.')

      setOk('Image updated ✅')

      setEImageFile(null)
      if (eImagePreview) URL.revokeObjectURL(eImagePreview)
      setEImagePreview('')

      await refreshProducts()

      // re-open drawer with updated product
      const updated = (products ?? []).find((p) => p.id === selected.id)
      if (updated) openDrawer(updated)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to replace image.')
    } finally {
      setBusy(false)
    }
  }

  // ---- Create ----
  async function onCreate() {
    setErr(null)
    setOk(null)

    if (!isAdmin) {
      setErr('Access denied.')
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

    const bp = bulkPrice.trim() ? Number(bulkPrice) : null
    if (bulkPrice.trim() && !Number.isFinite(bp as any)) {
      setErr('Bulk price must be a valid number.')
      return
    }

    const bm = bulkMin.trim() ? Number(bulkMin) : null
    if (bulkMin.trim() && !Number.isFinite(bm as any)) {
      setErr('Bulk min must be a valid number.')
      return
    }

    if (accentHex.trim() && !isValidHex(accentHex)) {
      setErr('Accent hex must be like #D946EF')
      return
    }

    setBusy(true)

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
      fd.append('accent_hex', accentHex.trim())
      if (bp != null) fd.append('bulk_price', String(bp))
      if (bm != null) fd.append('bulk_min', String(bm))
      if (image) fd.append('image', image)

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to create product.')

      setOk('Product created ✅')
      setName('')
      setCategory('')
      setPrice('')
      setBulkPrice('')
      setBulkMin('')
      setDescription('')
      setInStock(true)
      setAccentHex('#D946EF')
      setCreateImage(null)

      await refreshProducts()
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  // ---- Update product (drawer) ----
  async function onSaveEdit() {
    setErr(null)
    setOk(null)

    if (!selected) return

    if (!eName.trim() || !eCategory.trim() || !ePrice.trim()) {
      setErr('Fill in: name, category, price.')
      return
    }

    const priceNum = Number(ePrice)
    if (!Number.isFinite(priceNum)) {
      setErr('Price must be a valid number.')
      return
    }

    const bp = eBulkPrice.trim() ? Number(eBulkPrice) : null
    if (eBulkPrice.trim() && !Number.isFinite(bp as any)) {
      setErr('Bulk price must be a valid number.')
      return
    }

    const bm = eBulkMin.trim() ? Number(eBulkMin) : null
    if (eBulkMin.trim() && !Number.isFinite(bm as any)) {
      setErr('Bulk min must be a valid number.')
      return
    }

    if (eAccentHex.trim() && !isValidHex(eAccentHex)) {
      setErr('Accent hex must be like #D946EF')
      return
    }

    setBusy(true)

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: eName.trim(),
          category: eCategory.trim(),
          price: priceNum,
          bulk_price: bp,
          bulk_min: bm,
          description: eDescription.trim(),
          in_stock: eInStock,
          accent_hex: eAccentHex.trim(),
          image_url: eImageUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id)

      if (error) throw new Error(error.message)

      setOk('Saved ✅')
      await refreshProducts()

      const updated = products.find((p) => p.id === selected.id)
      if (updated) openDrawer(updated)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to save.')
    } finally {
      setBusy(false)
    }
  }

  async function onToggleStock(p: Product) {
    setBusy(true)
    setErr(null)
    setOk(null)

    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !(p.in_stock !== false), updated_at: new Date().toISOString() })
        .eq('id', p.id)

      if (error) throw new Error(error.message)

      await refreshProducts()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(p: Product) {
    const confirmed = window.confirm(
      `Remove "${p.name}" from the shop?\n\nThis is a soft delete — you can restore it later.`
    )
    if (!confirmed) return

    setBusy(true)
    setErr(null)
    setOk(null)

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', p.id)

      if (error) throw new Error(error.message)

      await refreshProducts()
      setOk('Removed ✅')
      closeDrawer()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onRestore(p: Product) {
    setBusy(true)
    setErr(null)
    setOk(null)

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_deleted: false,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', p.id)

      if (error) throw new Error(error.message)

      await refreshProducts()
      setOk('Restored ✅')
      closeDrawer()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6 text-sm text-slate-200">
          Loading…
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-slate-800 bg-black/50 p-6">
          <h1 className="text-2xl font-bold">Admin – Products</h1>
          <p className="mt-2 text-sm text-slate-300">{err || 'Access denied.'}</p>
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
            Create, edit, colour-code flavours, and manage stock — no code edits needed.
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
              <select
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
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
                <span className="text-xs text-slate-300">In stock</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-slate-200">{inStock ? 'Yes' : 'No'}</span>
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Bulk price (optional)</span>
                <input
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="e.g. 250"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Bulk minimum (optional)</span>
                <input
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                  value={bulkMin}
                  onChange={(e) => setBulkMin(e.target.value)}
                  placeholder="e.g. 10"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Accent colour</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <input
                  type="color"
                  value={isValidHex(accentHex) ? accentHex : '#D946EF'}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-slate-700 bg-transparent"
                />
                <input
                  value={accentHex}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="#D946EF"
                />
                <div
                  className="h-10 w-10 rounded-xl border border-slate-700"
                  style={{ background: isValidHex(accentHex) ? accentHex : '#D946EF' }}
                />
              </div>
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

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold text-slate-200">Make the image clean (free)</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Remove the background first → download PNG → upload here.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={BG_REMOVE_PRIMARY}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)]"
                >
                  Remove background (Adobe – Free)
                </a>
                <a
                  href={BG_REMOVE_BACKUP}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500"
                >
                  Backup remover (Pixlr)
                </a>
              </div>

              <div className="mt-3 text-[11px] text-slate-400">
                <span className="text-slate-200 font-semibold">Steps:</span> Upload → Remove BG → Download PNG → Upload here.
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Image</span>
              <input
                type="file"
                accept="image/*"
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                onChange={(e) => setCreateImage(e.target.files?.[0] ?? null)}
              />

              {imagePreview ? (
                <div className="mt-3 rounded-2xl border border-slate-800 bg-black/40 p-3">
                  <p className="text-[11px] text-slate-400 mb-2">Preview</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-[260px] object-contain rounded-xl bg-black/40"
                  />
                </div>
              ) : null}

              <p className="text-[11px] text-slate-400">
                Uploads to Supabase Storage → auto converts & optimizes to WebP behind the scenes.
              </p>
            </label>

            <button
              onClick={onCreate}
              disabled={busy}
              className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)] disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </div>

        {/* LIST + MANAGE */}
        <div className="rounded-3xl border border-slate-800 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Products</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setErr(null)
                  setOk(null)
                  refreshProducts()
                  refreshCategories()
                }}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, category, description…"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
              >
                <option value="all">All stock</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>

              <label className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={showRemoved}
                  onChange={(e) => setShowRemoved(e.target.checked)}
                />
                Show removed
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length === 0 && <p className="text-sm text-slate-400">No products found.</p>}

            {filtered.slice(0, 30).map((p) => {
              const removed = Boolean(p.is_deleted)
              const accent = p.accent_hex && isValidHex(p.accent_hex) ? p.accent_hex : '#334155'
              return (
                <button
                  key={p.id}
                  onClick={() => openDrawer(p)}
                  className={`w-full text-left flex items-center gap-4 rounded-2xl border bg-slate-950/40 p-4 transition hover:border-fuchsia-500/40 ${
                    removed ? 'border-red-500/30 opacity-80' : 'border-slate-800'
                  }`}
                >
                  <div
                    className="h-12 w-12 rounded-xl border border-slate-800 bg-black/40 relative overflow-hidden"
                    style={{ boxShadow: `0 0 22px ${accent}33` }}
                  >
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-900/40" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {p.name}{' '}
                      {removed ? <span className="text-xs text-red-300">(removed)</span> : null}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(p.category ?? '—')} • {money(p.price)} •{' '}
                      {p.in_stock === false ? 'Out' : 'In stock'}
                      {p.bulk_price && p.bulk_min ? (
                        <span className="text-slate-500">
                          {' '}
                          • Bulk {money(p.bulk_price)} (min {p.bulk_min})
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="text-xs font-bold text-fuchsia-300">EDIT</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && selected ? (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/70" onClick={closeDrawer} />

          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950/85 backdrop-blur-xl">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-400">
                    Edit product
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                    {selected.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    ID: <span className="font-mono">{selected.id}</span>
                  </p>

                  {selected.is_deleted ? (
                    <p className="mt-2 text-xs text-red-300 font-semibold">
                      This product is currently removed from the shop.
                    </p>
                  ) : null}
                </div>

                <button
                  onClick={closeDrawer}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  Close
                </button>
              </div>

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

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Name</span>
                  <input
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Category</span>
                  <select
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                    value={eCategory}
                    onChange={(e) => setECategory(e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs text-slate-300">Price</span>
                    <input
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                      value={ePrice}
                      onChange={(e) => setEPrice(e.target.value)}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs text-slate-300">In stock</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={eInStock}
                        onChange={(e) => setEInStock(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-slate-200">{eInStock ? 'Yes' : 'No'}</span>
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs text-slate-300">Bulk price</span>
                    <input
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                      value={eBulkPrice}
                      onChange={(e) => setEBulkPrice(e.target.value)}
                      placeholder="optional"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs text-slate-300">Bulk minimum</span>
                    <input
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                      value={eBulkMin}
                      onChange={(e) => setEBulkMin(e.target.value)}
                      placeholder="optional"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Accent colour</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <input
                      type="color"
                      value={isValidHex(eAccentHex) ? eAccentHex : '#D946EF'}
                      onChange={(e) => setEAccentHex(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border border-slate-700 bg-transparent"
                    />
                    <input
                      value={eAccentHex}
                      onChange={(e) => setEAccentHex(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                      placeholder="#D946EF"
                    />
                    <div
                      className="h-10 w-10 rounded-xl border border-slate-700"
                      style={{ background: isValidHex(eAccentHex) ? eAccentHex : '#D946EF' }}
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Description</span>
                  <textarea
                    className="min-h-[110px] rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                    value={eDescription}
                    onChange={(e) => setEDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Image URL</span>
                  <input
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                    value={eImageUrl}
                    onChange={(e) => setEImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-sm font-bold text-white">Replace product image (auto)</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Remove background first (free), then upload — system optimizes + uploads + replaces automatically.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={BG_REMOVE_PRIMARY}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)]"
                    >
                      Remove background (Adobe – Free)
                    </a>
                    <a
                      href={BG_REMOVE_BACKUP}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500"
                    >
                      Backup remover (Pixlr)
                    </a>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                      onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
                    />

                    {eImagePreview ? (
                      <div className="rounded-2xl border border-slate-800 bg-black/40 p-3">
                        <p className="text-[11px] text-slate-400 mb-2">New image preview</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={eImagePreview}
                          alt="New image preview"
                          className="w-full max-h-[260px] object-contain rounded-xl bg-black/40"
                        />
                      </div>
                    ) : null}

                    <button
                      onClick={uploadEditImage}
                      disabled={busy || !eImageFile}
                      className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)] disabled:opacity-60"
                    >
                      {busy ? 'Uploading…' : 'Upload & replace image'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={onSaveEdit}
                  disabled={busy}
                  className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-bold shadow-[0_0_22px_rgba(217,70,239,0.85)] disabled:opacity-60"
                >
                  {busy ? 'Saving…' : 'Save changes'}
                </button>

                <div className="mt-2 grid gap-3">
                  {selected.is_deleted ? (
                    <button
                      onClick={() => onRestore(selected)}
                      disabled={busy}
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                    >
                      {busy ? 'Working…' : 'Restore product'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onRemove(selected)}
                      disabled={busy}
                      className="rounded-full border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                    >
                      {busy ? 'Working…' : 'Remove product'}
                    </button>
                  )}

                  <button
                    onClick={() => onToggleStock(selected)}
                    disabled={busy}
                    className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:opacity-60"
                  >
                    Toggle stock (quick)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}