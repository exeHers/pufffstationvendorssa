import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase public env vars')

  if (!token) {
    return { ok: false, status: 401 as const, error: 'Missing bearer token' }
  }

  const authClient = createClient(url, anon, { auth: { persistSession: false } })
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) {
    return { ok: false, status: 401 as const, error: 'Invalid session' }
  }

  const email = (data.user.email ?? '').toLowerCase()
  const admins = parseAdminEmails(process.env.ADMIN_EMAILS)
  if (!email || !admins.includes(email)) {
    return { ok: false, status: 403 as const, error: 'Not an admin' }
  }

  return { ok: true as const, email }
}

export async function GET(request: Request) {
  try {
    const gate = await requireAdmin(request)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

    const db = supabaseAdmin()

    const { data: tickets, error: tErr } = await db
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

    // attach customer email using auth admin API
    const enriched = await Promise.all(
      (tickets ?? []).map(async (t) => {
        let customer_email: string | null = null
        try {
          if (t.user_id) {
            const { data } = await db.auth.admin.getUserById(t.user_id)
            customer_email = data.user?.email ?? null
          }
        } catch {
          customer_email = null
        }
        return { ...t, customer_email }
      })
    )

    return NextResponse.json({ success: true, tickets: enriched })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}