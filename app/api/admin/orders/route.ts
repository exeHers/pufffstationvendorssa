import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function requireEnv(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

async function assertAdmin(req: Request) {
  const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  const SERVICE_ROLE = requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
  const ADMIN_EMAILS = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) throw new Error('Missing Authorization token')

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) throw new Error('Invalid session token')

  const email = (data.user.email ?? '').toLowerCase()
  if (!email || !ADMIN_EMAILS.includes(email)) throw new Error('Access denied (not admin)')

  return supabase
}

// GET /api/admin/orders?status=paid
export async function GET(req: Request) {
  try {
    const supabase = await assertAdmin(req)
    const url = new URL(req.url)
    const status = (url.searchParams.get('status') ?? '').trim()

    let q = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) q = q.eq('status', status)

    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, orders: data ?? [] })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Server error' }, { status: 401 })
  }
}

// POST /api/admin/orders  { id, status, tracking_number, courier_name }
export async function POST(req: Request) {
  try {
    const supabase = await assertAdmin(req)
    const body = await req.json()

    const id = String(body?.id ?? '').trim()
    const status = String(body?.status ?? '').trim()
    const tracking_number = String(body?.tracking_number ?? '').trim() || null
    const courier_name = String(body?.courier_name ?? '').trim() || null

    if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
    if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 })

    // DB trigger enforces flow + tracking requirement + timestamps
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        tracking_number,
        courier_name,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, order: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Server error' }, { status: 401 })
  }
}
