import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

/**
 * POST = create product (+ optional image upload)
 * PATCH = admin actions: set_stock | remove | restore
 */

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
    const image = fd.get('image') as File | null

    if (!name || !category || !Number.isFinite(price)) {
      return NextResponse.json({ error: 'Missing or invalid fields (name, category, price).' }, { status: 400 })
    }

    let image_url: string | null = null

    if (image && typeof image.arrayBuffer === 'function') {
      const ext = (image.name.split('.').pop() || 'png').toLowerCase()
      const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'png'
      const path = `products/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`

      const bytes = new Uint8Array(await image.arrayBuffer())
      const up = await supabase.storage.from(bucket).upload(path, bytes, {
        contentType: image.type || 'image/png',
        upsert: true,
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
        description: description || null,
        image_url,
        in_stock,
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
        .update({ in_stock, deleted_at: null })
        .eq('id', id)
        .select('*')
        .single()

      if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })
      return NextResponse.json({ product: up.data })
    }

    if (action === 'remove') {
      const up = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()

      if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 })
      return NextResponse.json({ product: up.data })
    }

    if (action === 'restore') {
      const up = await supabase
        .from('products')
        .update({ deleted_at: null })
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