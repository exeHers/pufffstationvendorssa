import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return NextResponse.json({ error: 'Missing public Supabase env vars.' }, { status: 500 })
    if (!token) return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 })

    const authClient = createClient(url, anon, { auth: { persistSession: false } })
    const { data: authData, error: authError } = await authClient.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })
    }

    const db = supabaseAdmin()
    const userId = authData.user.id

    const { data: tickets, error: tErr } = await db
      .from('support_messages')
      .select('id')
      .eq('user_id', userId)
      .limit(200)

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

    const ticketIds = (tickets ?? []).map((t) => t.id)
    if (ticketIds.length === 0) return NextResponse.json({ success: true, replies: [] })

    const { data: replies, error: rErr } = await db
      .from('support_replies')
      .select('*')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: true })

    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    return NextResponse.json({ success: true, replies: replies ?? [] })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
