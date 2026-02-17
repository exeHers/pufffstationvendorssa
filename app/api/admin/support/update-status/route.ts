export const runtime = 'edge';

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

  if (!token) return { ok: false, status: 401 as const, error: 'Missing bearer token' }

  const authClient = createClient(url, anon, { auth: { persistSession: false } })
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return { ok: false, status: 401 as const, error: 'Invalid session' }

  const email = (data.user.email ?? '').toLowerCase()
  const admins = parseAdminEmails(process.env.ADMIN_EMAILS)
  if (!email || !admins.includes(email)) return { ok: false, status: 403 as const, error: 'Not an admin' }

  return { ok: true as const, email }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAdmin(request)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

    const body = await request.json()
    const ticketId = String(body?.ticketId ?? '').trim()
    const status = String(body?.status ?? '').trim().toLowerCase()

    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })
    if (!['open', 'waiting_agent', 'in_progress', 'replied', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status (use open|waiting_agent|in_progress|replied|closed)' },
        { status: 400 }
      )
    }

    const db = supabaseAdmin()
    const { error } = await db.from('support_messages').update({ status }).eq('id', ticketId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
