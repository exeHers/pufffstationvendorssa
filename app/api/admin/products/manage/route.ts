import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

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

type Action =
  | { action: 'set_stock'; id: string; in_stock: boolean }
  | { action: 'soft_delete'; id: string }
  | { action: 'restore'; id: string }

export async function POST(req: Request) {
  try {
    const supabase = await assertAdmin(req)
    const body = (await req.json()) as Action

    const id = String((body as any)?.id ?? '').trim()
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    if (body.action === 'set_stock') {
      const in_stock = Boolean((body as any).in_stock)
      const { data, error } = await supabase
        .from('products')
        .update({ in_stock })
        .eq('id', id)
        .select('*')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, product: data })
    }

    if (body.action === 'soft_delete') {
      const { data, error } = await supabase
        .from('products')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, product: data })
    }

    if (body.action === 'restore') {
      const { data, error } = await supabase
        .from('products')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)
        .select('*')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, product: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 401 })
  }
}