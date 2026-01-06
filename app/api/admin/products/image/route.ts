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
    body.append('image', new Blob([input], { type: 'image/png' }), 'upload.png')

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

/**
 * PILLAR READY OPTIMIZATION
 * Creates a consistent square canvas and bottom-aligns the vape so it sits on the stage.
 */
async function optimizeToWebpForPillar(imageFile: File) {
  const raw = Buffer.from(await imageFile.arrayBuffer())
  const input = await applyRembg(raw)

  const OUT_W = 1200
  const OUT_H = 1200
  const PILLAR_RESERVED_PX = 160
  const targetH = OUT_H - PILLAR_RESERVED_PX

  const out = await sharp(input, { failOnError: false })
    .rotate()
    .resize({
      width: OUT_W,
      height: targetH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .extend({
      top: 0,
      left: 0,
      right: 0,
      bottom: OUT_H - targetH,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize({
      width: OUT_W,
      height: OUT_H,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      position: 'south',
    })
    .sharpen({
      sigma: 0.6,
      m1: 0.4,
      m2: 0.3,
      x1: 1.0,
      y2: 2.0,
      y3: 20,
    })
    .webp({
      quality: 84,
      effort: 6,
      smartSubsample: true,
      alphaQuality: 90,
    })
    .toBuffer()

  if (!out || out.length < 2000) {
    throw new Error('Image optimization failed (output too small).')
  }

  return out
}

/**
 * POST: replace a product image
 * body: multipart/form-data with:
 * - id (string) product id
 * - name (string) product name (for filename)
 * - image (File) new image
 */
export async function POST(req: NextRequest) {
  try {
    const gate = await requireAdmin(req)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 401 })

    const supabase = makeAdminClient()
    const bucket = getBucket()

    const fd = await req.formData()

    const id = String(fd.get('id') ?? '').trim()
    const name = String(fd.get('name') ?? '').trim() || 'product'
    const image = fd.get('image') as File | null

    if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 })
    if (!image || typeof image.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Missing image file.' }, { status: 400 })
    }

    const optimized = await optimizeToWebpForPillar(image)

    const safeName = sanitizeFilename(name)
    const path = `products/${safeName}-${Date.now()}-${Math.random().toString(16).slice(2)}.webp`

    const up = await supabase.storage.from(bucket).upload(path, optimized, {
      contentType: 'image/webp',
      upsert: false,
      cacheControl: '31536000',
    })

    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })

    const pub = supabase.storage.from(bucket).getPublicUrl(path)
    const image_url = pub.data.publicUrl || null

    const upd = await supabase
      .from('products')
      .update({ image_url, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 400 })

    return NextResponse.json({ product: upd.data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
