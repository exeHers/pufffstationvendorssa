'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Tables } from '@/lib/types/database'
import { supabase } from '@/lib/supabaseClient'
import imageCompression from 'browser-image-compression'
import type { Product } from '@/lib/types'
import { supabaseBrowser } from '@/lib/supabase/browser'
import ProductCard from '@/components/products/ProductCard'

type Category = Tables<'categories'>

type Profile = { id: string; role: string | null }

function safeNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function money(v: unknown) {
  const n = safeNum(v)
  return `R${n.toFixed(2)}`
}

function isValidHex(hex: string) {
  const h = (hex || '').trim()
  return /^#[0-9a-fA-F]{6}$/.test(h)
}

function clampCategoryLabel(input: string) {
  const s = (input || '').trim()
  if (!s) return 'Other'
  return s.length > 28 ? `${s.slice(0, 28)}…` : s
}

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const removerOptions = [
    {
      value: 'adobe',
      label: 'Adobe Express (Recommended)',
      url: 'https://www.adobe.com/express/feature/image/remove-background',
    },
    {
      value: 'pixlr',
      label: 'Pixlr Remove BG',
      url: 'https://pixlr.com/remove-background/',
    },
    {
      value: 'foco',
      label: 'FocoClipping',
      url: 'https://www.fococlipping.com/',
    },
    {
      value: 'cutout',
      label: 'Cutout.pro',
      url: 'https://www.cutout.pro/remove-background',
    },
  ]
  const [remover, setRemover] = useState(removerOptions[0])

  const [email, setEmail] = useState('')

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
  const [isFeatured, setIsFeatured] = useState(false)

  // brand accent (UI glow)
  const [accentHex, setAccentHex] = useState('#D946EF')

  // ✅ NEW: smoke colours
  const [smokeHexScroll, setSmokeHexScroll] = useState('#00FFFF')
  const [smokeHexPreview, setSmokeHexPreview] = useState('#D946EF')

  const [image, setImage] = useState<File | null>(null)

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
  const [eIsFeatured, setEIsFeatured] = useState(false)

  const [eAccentHex, setEAccentHex] = useState('#D946EF')

  // ✅ NEW: edit smoke
  const [eSmokeHexScroll, setESmokeHexScroll] = useState('#00FFFF')
  const [eSmokeHexPreview, setESmokeHexPreview] = useState('#D946EF')

  const [eImageUrl, setEImageUrl] = useState<string>('')

  // ---- Auth + role check ----
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const sb = supabaseBrowser()
      const { data: { user } } = await sb.auth.getUser()
      if (user?.email) setEmail(user.email)

      await Promise.all([refreshProducts(), refreshCategories()])
      setLoading(false)
    })()
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
    setProducts(data ?? [])
  }

  async function refreshCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) return
    setCategories(data ?? [])
  }

  function openDrawer(p: Product) {
    setSelected(p)
    setDrawerOpen(true)
    setOk(null)
    setErr(null)

    const pp = p

    setEName(p.name ?? '')
    setECategory(pp.category ?? '')
    setEPrice(p.price != null ? String(p.price) : '')
    setEBulkPrice(pp.bulk_price != null ? String(pp.bulk_price) : '')
    setEBulkMin(pp.bulk_min != null ? String(pp.bulk_min) : '')
    setEDescription(pp.description ?? '')
    setEInStock(pp.in_stock !== false)
    setEIsFeatured(Boolean(pp.is_featured))

    setEAccentHex(pp.accent_hex && isValidHex(pp.accent_hex) ? pp.accent_hex : '#D946EF')

    // ✅ smoke defaults
    setESmokeHexScroll(
      pp.smoke_hex_scroll && isValidHex(pp.smoke_hex_scroll) ? pp.smoke_hex_scroll : '#00FFFF'
    )
    setESmokeHexPreview(
      pp.smoke_hex_preview && isValidHex(pp.smoke_hex_preview) ? pp.smoke_hex_preview : '#D946EF'
    )

    setEImageUrl(pp.image_url ?? '')
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setSelected(null)
    setOk(null)
    setErr(null)
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

    return list as Product[]
  }, [products, showRemoved, filterCategory, filterStock, q])

  // Preview data for "Create" section
  const createPreviewProduct = useMemo(() => {
    return {
      id: 'preview',
      name: name || 'Product Name',
      category: category || 'Category',
      price: Number(price) || 0,
      description: description || 'Product description goes here.',
      image_url: image ? URL.createObjectURL(image) : null,
      in_stock: inStock,
      accent_hex: accentHex,
      smoke_hex_scroll: smokeHexScroll,
      smoke_hex_preview: smokeHexPreview,
      is_featured: isFeatured,
    } as Product
  }, [name, category, price, description, image, inStock, accentHex, smokeHexScroll, smokeHexPreview, isFeatured])

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (createPreviewProduct.image_url?.startsWith('blob:')) {
        URL.revokeObjectURL(createPreviewProduct.image_url)
      }
    }
  }, [createPreviewProduct.image_url])

  // ---- Create ----
  async function onCreate() {
    setErr(null)
    setOk(null)

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
    if (bulkPrice.trim() && !Number.isFinite(bp)) {
      setErr('Bulk price must be a valid number.')
      return
    }

    const bm = bulkMin.trim() ? Number(bulkMin) : null
    if (bulkMin.trim() && !Number.isFinite(bm)) {
      setErr('Bulk min must be a valid number.')
      return
    }

    if (accentHex.trim() && !isValidHex(accentHex)) {
      setErr('Accent hex must be like #D946EF')
      return
    }

    if (smokeHexScroll.trim() && !isValidHex(smokeHexScroll)) {
      setErr('Scroll smoke hex must be like #00FFFF')
      return
    }

    if (smokeHexPreview.trim() && !isValidHex(smokeHexPreview)) {
      setErr('Preview smoke hex must be like #D946EF')
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
      fd.append('is_featured', isFeatured ? 'true' : 'false')
      fd.append('smoke_hex_scroll', smokeHexScroll.trim())
      fd.append('smoke_hex_preview', smokeHexPreview.trim())
      if (bp != null) fd.append('bulk_price', String(bp))
      if (bm != null) fd.append('bulk_min', String(bm))

      if (image) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          initialQuality: 0.85
        }
        try {
          const compressedFile = await imageCompression(image, options)
          fd.append('image', compressedFile, 'product.png')
        } catch (error) {
          console.error('Compression failed:', error)
          fd.append('image', image)
        }
      }

      const res = await fetch('/api/admin/products', {
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
      setIsFeatured(false)

      setAccentHex('#D946EF')
      setSmokeHexScroll('#00FFFF')
      setSmokeHexPreview('#D946EF')

      setImage(null)

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
    if (eBulkPrice.trim() && !Number.isFinite(bp)) {
      setErr('Bulk price must be a valid number.')
      return
    }

    const bm = eBulkMin.trim() ? Number(eBulkMin) : null
    if (eBulkMin.trim() && !Number.isFinite(bm)) {
      setErr('Bulk min must be a valid number.')
      return
    }

    if (eAccentHex.trim() && !isValidHex(eAccentHex)) {
      setErr('Accent hex must be like #D946EF')
      return
    }

    if (eSmokeHexScroll.trim() && !isValidHex(eSmokeHexScroll)) {
      setErr('Scroll smoke hex must be like #00FFFF')
      return
    }

    if (eSmokeHexPreview.trim() && !isValidHex(eSmokeHexPreview)) {
      setErr('Preview smoke hex must be like #D946EF')
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
          is_featured: eIsFeatured,
          accent_hex: eAccentHex.trim(),
          smoke_hex_scroll: eSmokeHexScroll.trim(),
          smoke_hex_preview: eSmokeHexPreview.trim(),
          image_url: eImageUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id)

      if (error) throw new Error(error.message)

      setOk('Saved ✅')
      await refreshProducts()

      const updated = products.find((p) => p.id === selected.id)
      const refreshedProducts = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (refreshedProducts.data) {
        setProducts(refreshedProducts.data)
        const updated = refreshedProducts.data.find((p) => p.id === selected.id)
        if (updated) openDrawer(updated as Product)
      }
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
      `Remove "${p.name}" from the shop?\n\nSoft delete — you can restore later.`
    )
    if (!confirmed) return
 
    setBusy(true)
    setErr(null)
    setOk(null)
 
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')
 
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'soft_delete', id: p.id }),
      })
 
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to remove product.')
 
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
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')
 
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'restore', id: p.id }),
      })
 
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to restore product.')
 
      await refreshProducts()
      setOk('Restored ✅')
      closeDrawer()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onHardDelete(p: Product) {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETE: "${p.name}"\n\nThis will permanently erase the product and its optimized image from Supabase. This action cannot be reversed.\n\nProceed with hard delete?`
    )
    if (!confirmed) return

    setBusy(true)
    setErr(null)
    setOk(null)

    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('No session token. Please log in again.')

      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'hard_delete', id: p.id }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to delete product.')

      setOk('Permanently deleted.')
      closeDrawer()
      await refreshProducts()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-slate-800 bg-black/60 p-6 text-sm text-slate-200">
          Loading…
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-28 pt-7 sm:pt-10 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-slate-300">
            Create, edit, smoke-colour, and manage stock — zero code.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 sm:justify-end">
          <button
            onClick={() => {
              setErr(null)
              setOk(null)
              refreshProducts()
              refreshCategories()
            }}
            className="w-full rounded-full border border-slate-700 bg-black/40 px-4 py-2 text-center text-sm hover:border-slate-500 sm:w-auto"
          >
            Refresh
          </button>

          <Link href="/admin" className="w-full rounded-full border border-slate-700 bg-black/40 px-4 py-2 text-center text-sm hover:border-slate-500 sm:w-auto">
            Back
          </Link>
        </div>
      </div>

      {/* Helpers */}
      <div className="mt-5 grid gap-3">
        <div className="rounded-3xl border border-white/[0.05] bg-slate-900/40 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Quick tools (free)
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex w-full max-w-sm items-center gap-2">
              <select
                className="w-full max-w-sm rounded-2xl border border-slate-700 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
                value={remover.value}
                onChange={(e) => {
                  const next = removerOptions.find((opt) => opt.value === e.target.value)
                  setRemover(next || removerOptions[0])
                }}
              >
                {removerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => window.open(remover.url, '_blank', 'noopener,noreferrer')}
                className="rounded-full border border-slate-700 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-slate-500"
              >
                Open
              </button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Tip: Use transparent PNGs so the vape pops on black + smoke. White backgrounds will always look kak.
          </p>
        </div>

        {err && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {ok && (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {ok}
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* CREATE */}
        <div className="rounded-3xl border border-slate-800 bg-black/55 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Create product</h2>

          {/* Preview Block */}
          <div className="mt-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Preview</p>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-4">
              <div className="mx-auto w-full max-w-[240px]">
                <ProductCard product={createPreviewProduct} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Name</span>
              <input
                className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Category</span>
              <select
                className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
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
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 280"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">In stock</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm">
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
                <span className="text-xs text-slate-300">Featured Drop</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-violet-500"
                  />
                  <span className="text-slate-200">{isFeatured ? 'Yes' : 'No'}</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Bulk price (optional)</span>
                <input
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="e.g. 250"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-slate-300">Bulk minimum (optional)</span>
                <input
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
                  value={bulkMin}
                  onChange={(e) => setBulkMin(e.target.value)}
                  placeholder="e.g. 10"
                />
              </label>
            </div>

            {/* Accent */}
            <label className="grid gap-2">
              <span className="text-xs text-slate-300">UI Accent colour</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <input
                  type="color"
                  value={isValidHex(accentHex) ? accentHex : '#7c3aed'}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-white/[0.1] bg-transparent"
                />
                <input
                  value={accentHex}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="#7c3aed"
                />
                <div
                  className="h-10 w-10 rounded-xl border border-white/[0.1]"
                  style={{ background: isValidHex(accentHex) ? accentHex : '#7c3aed' }}
                />
              </div>
            </label>

            {/* ✅ Smoke scroll */}
            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Smoke colour (scroll)</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <input
                  type="color"
                  value={isValidHex(smokeHexScroll) ? smokeHexScroll : '#00FFFF'}
                  onChange={(e) => setSmokeHexScroll(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-slate-700 bg-transparent"
                />
                <input
                  value={smokeHexScroll}
                  onChange={(e) => setSmokeHexScroll(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="#00FFFF"
                />
                <div
                  className="h-10 w-10 rounded-xl border border-slate-700"
                  style={{ background: isValidHex(smokeHexScroll) ? smokeHexScroll : '#00FFFF' }}
                />
              </div>
            </label>

            {/* ✅ Smoke preview */}
            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Smoke colour (preview)</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <input
                  type="color"
                  value={isValidHex(smokeHexPreview) ? smokeHexPreview : '#7c3aed'}
                  onChange={(e) => setSmokeHexPreview(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-white/[0.1] bg-transparent"
                />
                <input
                  value={smokeHexPreview}
                  onChange={(e) => setSmokeHexPreview(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="#7c3aed"
                />
                <div
                  className="h-10 w-10 rounded-xl border border-white/[0.1]"
                  style={{ background: isValidHex(smokeHexPreview) ? smokeHexPreview : '#7c3aed' }}
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-slate-300">Description</span>
              <textarea
                className="min-h-[110px] rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
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
                className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              <p className="text-[11px] text-slate-400">
                Uploads to Supabase Storage → saves public URL. Use transparent PNG cutouts for best results.
              </p>
            </label>

            <button
              onClick={onCreate}
              disabled={busy}
              className="rounded-full bg-violet-600 px-5 py-3 text-sm font-bold transition hover:bg-violet-500 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="rounded-3xl border border-slate-800 bg-black/55 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Products</h2>

          {/* Filters */}
          <div className="mt-4 grid gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, category, description…"
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
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
                onChange={(e) => setFilterStock(e.target.value as 'all' | 'in' | 'out')}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm"
              >
                <option value="all">All stock</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>

              <label className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-slate-950/50 px-4 py-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRemoved}
                  onChange={(e) => setShowRemoved(e.target.checked)}
                  className="accent-violet-500"
                />
                <span className="text-slate-400">Show removed</span>
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length === 0 && <p className="text-sm text-slate-400">No products found.</p>}

            {filtered.slice(0, 40).map((p) => {
              const pp = p
              const removed = Boolean(pp.is_deleted)
              const accent = pp.accent_hex && isValidHex(pp.accent_hex) ? pp.accent_hex : '#334155'
              const cat = clampCategoryLabel(pp.category || '')
              return (
                <button
                  key={p.id}
                  onClick={() => openDrawer(p)}
                  className={`w-full text-left flex flex-col gap-4 rounded-2xl border bg-slate-950/30 p-4 transition hover:border-violet-500/40 sm:flex-row sm:items-center ${
                    removed ? 'border-red-500/30 opacity-80' : 'border-white/[0.05]'
                  }`}
                >
                  <div
                    className="h-12 w-12 rounded-xl border border-slate-800 bg-black/40 relative overflow-hidden flex-shrink-0"
                    style={{ boxShadow: `0 0 22px ${accent}33` }}
                  >
                    {pp.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pp.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-900/40" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {p.name} {removed ? <span className="text-xs text-red-300">(removed)</span> : null}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cat} • {money(p.price)} • {pp.in_stock === false ? 'Out' : 'In stock'}
                    </p>
                    {p.updated_at && (
                      <p className="mt-0.5 text-[9px] text-slate-600 uppercase font-black tracking-widest">
                        Sync: {new Date(p.updated_at).toLocaleDateString()}
                      </p>
                    )}

                    {pp.smoke_hex_scroll || pp.smoke_hex_preview ? (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        Smoke set ✅
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-amber-300/80">
                        Smoke missing ⚠
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] font-black uppercase tracking-widest text-violet-400 sm:ml-auto">Terminal Edit</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && selected ? (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/75" onClick={closeDrawer} />

          <div className="absolute inset-x-0 bottom-0 top-12 sm:top-0 sm:right-0 sm:inset-x-auto h-[calc(100%-3rem)] sm:h-full w-full sm:max-w-xl overflow-y-auto border-t sm:border-t-0 sm:border-l border-slate-800 bg-slate-950/90 backdrop-blur-xl">
            <div className="p-5 sm:p-6">
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
                {/* Edit Preview */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Preview</p>
                  <div className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-4">
                    <div className="mx-auto w-full max-w-[240px]">
                      <ProductCard
                        product={
                          {
                            ...selected,
                            name: eName,
                            category: eCategory,
                            price: Number(ePrice),
                            description: eDescription,
                            in_stock: eInStock,
                            is_featured: eIsFeatured,
                            accent_hex: eAccentHex,
                            smoke_hex_scroll: eSmokeHexScroll,
                            smoke_hex_preview: eSmokeHexPreview,
                            image_url: eImageUrl,
                          } as Product
                        }
                      />
                    </div>
                  </div>
                </div>

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

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Featured Drop</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={eIsFeatured}
                      onChange={(e) => setEIsFeatured(e.target.checked)}
                      className="h-4 w-4 accent-fuchsia-500"
                    />
                    <span className="text-slate-200">{eIsFeatured ? 'Yes' : 'No'}</span>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">UI Accent colour</span>
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
                    />
                    <div
                      className="h-10 w-10 rounded-xl border border-slate-700"
                      style={{ background: isValidHex(eAccentHex) ? eAccentHex : '#D946EF' }}
                    />
                  </div>
                </label>

                {/* ✅ Scroll smoke */}
                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Smoke colour (scroll)</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <input
                      type="color"
                      value={isValidHex(eSmokeHexScroll) ? eSmokeHexScroll : '#00FFFF'}
                      onChange={(e) => setESmokeHexScroll(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border border-slate-700 bg-transparent"
                    />
                    <input
                      value={eSmokeHexScroll}
                      onChange={(e) => setESmokeHexScroll(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                    <div
                      className="h-10 w-10 rounded-xl border border-slate-700"
                      style={{ background: isValidHex(eSmokeHexScroll) ? eSmokeHexScroll : '#00FFFF' }}
                    />
                  </div>
                </label>

                {/* ✅ Preview smoke */}
                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Smoke colour (preview)</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <input
                      type="color"
                      value={isValidHex(eSmokeHexPreview) ? eSmokeHexPreview : '#D946EF'}
                      onChange={(e) => setESmokeHexPreview(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border border-slate-700 bg-transparent"
                    />
                    <input
                      value={eSmokeHexPreview}
                      onChange={(e) => setESmokeHexPreview(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                    <div
                      className="h-10 w-10 rounded-xl border border-slate-700"
                      style={{ background: isValidHex(eSmokeHexPreview) ? eSmokeHexPreview : '#D946EF' }}
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-slate-300">Description</span>
                  <textarea
                    className="min-h-[110px] rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                    value={eDescription}
                    onChange={(e) => setEDescription(e.target.value)}
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

                {/* Sticky bottom actions */}
                <div className="sticky bottom-0 -mx-5 sm:-mx-6 mt-4 border-t border-white/[0.04] bg-slate-950/95 px-5 sm:px-6 py-4 backdrop-blur-xl">
                  <div className="grid gap-3">
                    <button
                      onClick={onSaveEdit}
                      disabled={busy}
                      className="w-full rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 active:scale-[0.98] disabled:opacity-60"
                    >
                      {busy ? 'Saving…' : 'Save changes'}
                    </button>
 
                    <div className="mt-2 rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-3">
                      <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-red-400/60">Danger Zone</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selected.is_deleted ? (
                          <>
                            <button
                              onClick={() => onRestore(selected)}
                              disabled={busy}
                              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                              {busy ? '...' : 'Restore'}
                            </button>
                            <button
                              onClick={() => onHardDelete(selected)}
                              disabled={busy}
                              className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                            >
                              {busy ? '...' : 'Hard Delete'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onRemove(selected)}
                            disabled={busy}
                            className="col-span-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                          >
                            {busy ? 'Working…' : 'Soft Delete (Hide from Shop)'}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStock(selected)}
                      disabled={busy}
                      className="w-full rounded-full border border-slate-700 bg-black/40 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:opacity-60"
                    >
                      Toggle stock (quick)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
