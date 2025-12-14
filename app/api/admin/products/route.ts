import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function fileExtFromName(name: string) {
  const idx = name.lastIndexOf('.')
  if (idx === -1) return 'bin'
  return name.slice(idx + 1).toLowerCase()
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
    const ADMIN_EMAILS = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return NextResponse.json(
        { error: 'Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 500 }
      )
    }

    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      return NextResponse.json({ error: 'Missing Authorization token.' }, { status: 401 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Validate user from token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid session token.' }, { status: 401 })
    }

    const email = (userData.user.email ?? '').toLowerCase()
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Access denied (not admin).' }, { status: 403 })
    }

    const form = await req.formData()

    const name = String(form.get('name') ?? '').trim()
    const description = String(form.get('description') ?? '').trim()
    const category = String(form.get('category') ?? '').trim()
    const priceRaw = String(form.get('price') ?? '').trim()
    const inStockRaw = String(form.get('in_stock') ?? 'true').trim()

    const price = Number(priceRaw)
    const in_stock = inStockRaw === 'true' || inStockRaw === '1'

    const image = form.get('image') as File | null

    if (!name || !category || !Number.isFinite(price)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, price.' },
        { status: 400 }
      )
    }

    let image_url: string | null = null

    if (image && image.size > 0) {
      const ext = fileExtFromName(image.name)
      const safeName = `${crypto.randomUUID()}.${ext}`
      const objectPath = `public/${safeName}`

      const buf = new Uint8Array(await image.arrayBuffer())

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(objectPath, buf, {
          contentType: image.type || 'application/octet-stream',
          upsert: false,
        })

      if (upErr) {
        return NextResponse.json({ error: `Image upload failed: ${upErr.message}` }, { status: 400 })
      }

      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(objectPath)
      image_url = pub.publicUrl
    }

    const { data: inserted, error: insErr } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || null,
          category,
          price,
          image_url,
          in_stock,
        },
      ])
      .select('*')
      .single()

    if (insErr) {
      return NextResponse.json({ error: `Insert failed: ${insErr.message}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, product: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}