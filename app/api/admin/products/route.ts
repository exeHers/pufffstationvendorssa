import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function getBucket() {
  return process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images'
}

function mustEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function makeAdminClient() {
  const url = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
  const service = mustEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function makeAnonClient() {
  const url = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anon = mustEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function applyRembg(input: Buffer) {
  const url = process.env.REMBG_URL
  if (!url) return input

  try {
    const body = new FormData()
    body.append('image', new Blob([new Uint8Array(input)], { type: 'image/png' }), 'upload.png')

    const res = await fetch(url, {
      method: 'POST',
      body,
      headers: { accept: 'image/png' },
    })

    if (!res.ok) return input
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 0 ? buf : input
  } catch {
    return input
  }
}

async function requireAdmin(req: NextRequest) {
  const adminEmails = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  if (adminEmails.length === 0) {
    return { ok: false as const, error: 'NEXT_PUBLIC_ADMIN_EMAILS is not set.' }
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, error: 'Missing auth token.' }

  const supabaseAnon = makeAnonClient()
  const { data, error } = await supabaseAnon.auth.getUser(token)
  if (error || !data?.user) return { ok: false as const, error: 'Invalid session. Log in again.' }

  const email = (data.user.email ?? '').toLowerCase()
  if (!email || !adminEmails.includes(email)) return { ok: false as const, error: 'Not an admin.' }

  return { ok: true as const, email }
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function isValidHex(hex: string) {
  const h = (hex || '').trim()
  return /^#[0-9a-fA-F]{6}$/.test(h)
}

/**
 * ✅ FULL IMAGE OPTIMIZATION PIPELINE:
 * - JPG/PNG/WebP -> RGBA
 * - Removes near-white backgrounds
 * - Removes alpha halo edge blur (THIS fixes thick/bloated look)
 * - Trims transparent edges
 * - Adds padding
 * - Resizes into 900x1200 canvas
 * - Outputs optimized WEBP
 */
async function optimizeToWebpPerfect(imageFile: File) {
<<<<<<< HEAD
  const raw = Buffer.from(await imageFile.arrayBuffer())
  const input = await applyRembg(raw)
=======
  const input = Buffer.from(await imageFile.arrayBuffer())
  const OUT_W = 900
  const OUT_H = 1200
>>>>>>> ai-build

  let img = sharp(input, { failOnError: false }).rotate().ensureAlpha()

  // Convert to raw RGBA for pixel-level cleaning
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

  const out = Buffer.from(data)
  const width = info.width
  const height = info.height

  // 1) Remove near-white background pixels
  const threshold = 245

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i]
    const g = out[i + 1]
    const b = out[i + 2]
    const a = out[i + 3]

    // kill near-white pixels completely
    if (r >= threshold && g >= threshold && b >= threshold) {
      out[i + 3] = 0
      continue
    }

    // 2) ✅ REMOVE ALPHA HALO / SOFT EDGE (this fixes “thick” look)
    if (a > 0 && a < 60) {
      out[i + 3] = 0
    } else if (a >= 60 && a < 160) {
      out[i + 3] = 220
    }
  }

  img = sharp(out, { raw: { width, height, channels: 4 } })

  // Trim + add safe padding
  img = img
    .trim()
    .extend({
      top: 80,
      bottom: 140,
      left: 80,
      right: 80,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })

<<<<<<< HEAD
  // Force consistent canvas size
  img = img.resize(900, 1200, {
=======
  // ✅ Force consistent canvas size so every product looks the same scale
  // contain = keeps aspect ratio, never stretches
  img = img.resize(OUT_W, OUT_H, {
>>>>>>> ai-build
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    withoutEnlargement: true,
  })

<<<<<<< HEAD
  return await img.webp({ quality: 86, effort: 6 }).toBuffer()
=======
  const optimized = await img
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 0.3 })
    .webp({ quality: 84, effort: 6, smartSubsample: true, alphaQuality: 90 })
    .toBuffer()

  if (!optimized || optimized.length < 2000) {
    throw new Error('Image optimization failed (output too small).')
  }

  return optimized
>>>>>>> ai-build
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAdmin(req)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 401 })

    const supabase = makeAdminClient()
    const bucket = getBucket()

    const fd = await req.formData()

    const name = String(fd.get('name') ?? '').trim()
    const category = String(fd.get('category') ?? '').trim()
    const price = Number(fd.get('price') ?? '0')
    const description = String(fd.get('description') ?? '').trim()
    const in_stock = String(fd.get('in_stock') ?? 'true') === 'true'

    const accent_hex_raw = String(fd.get('accent_hex') ?? '').trim()
    const smoke_hex_scroll_raw = String(fd.get('smoke_hex_scroll') ?? '').trim()
    const smoke_hex_preview_raw = String(fd.get('smoke_hex_preview') ?? '').trim()

    const accent_hex = accent_hex_raw && isValidHex(accent_hex_raw) ? accent_hex_raw : null
    const smoke_hex_scroll =
      smoke_hex_scroll_raw && isValidHex(smoke_hex_scroll_raw) ? smoke_hex_scroll_raw : null
    const smoke_hex_preview =
      smoke_hex_preview_raw && isValidHex(smoke_hex_preview_raw) ? smoke_hex_preview_raw : null

    const bulk_price_raw = fd.get('bulk_price')
    const bulk_min_raw = fd.get('bulk_min')
    const bulk_price =
      bulk_price_raw != null && String(bulk_price_raw).trim() !== '' ? Number(bulk_price_raw) : null
    const bulk_min =
      bulk_min_raw != null && String(bulk_min_raw).trim() !== '' ? Number(bulk_min_raw) : null

    const image = fd.get('image') as File | null

    if (!name || !category || !Number.isFinite(price)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields (name, category, price).' },
        { status: 400 }
      )
    }

    if (bulk_price != null && !Number.isFinite(bulk_price)) {
      return NextResponse.json({ error: 'Invalid bulk_price' }, { status: 400 })
    }

    if (bulk_min != null && (!Number.isFinite(bulk_min) || bulk_min < 1)) {
      return NextResponse.json({ error: 'Invalid bulk_min' }, { status: 400 })
    }

    let image_url: string | null = null

    // ✅ Auto-fix image
    if (image && typeof image.arrayBuffer === 'function') {
      const optimized = await optimizeToWebpPerfect(image)

      const safeName = sanitizeFilename(name || 'product')
      const path = `products/${safeName}-${Date.now()}-${Math.random().toString(16).slice(2)}.webp`

      const up = await supabase.storage.from(bucket).upload(path, optimized, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '31536000',
      })

      if (up.error) {
        return NextResponse.json({ error: up.error.message }, { status: 400 })
      }

      const pub = supabase.storage.from(bucket).getPublicUrl(path)
      image_url = pub.data.publicUrl || null
    }

    const ins = await supabase
      .from('products')
      .insert({
        name,
        category,
        price,
        bulk_price,
        bulk_min,
        description: description || null,
        image_url,
        in_stock,
        accent_hex,
        smoke_hex_scroll,
        smoke_hex_preview,
        is_deleted: false,
        deleted_at: null,
      })
      .select('*')
      .single()

    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 400 })

    return NextResponse.json({ product: ins.data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const gate = await requireAdmin(req)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 401 })

    const supabase = makeAdminClient()
    const body = await req.json().catch(() => ({}))

    const id = String(body.id ?? '')
    const action = String(body.action ?? '')

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id/action.' }, { status: 400 })
    }

    if (action === 'set_stock') {
      const in_stock = Boolean(body.in_stock)
      const up = await supabase
        .from('products')
        .update({ in_stock, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()

      if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })
      return NextResponse.json({ product: up.data })
    }

    if (action === 'remove') {
      const up = await supabase
        .from('products')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

      if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })
      return NextResponse.json({ product: up.data })
    }

    if (action === 'restore') {
      const up = await supabase
        .from('products')
        .update({
          is_deleted: false,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

      if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })
      return NextResponse.json({ product: up.data })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
