import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return NextResponse.json({ error: 'Missing public Supabase env vars.' }, { status: 500 })
    if (!token) return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 })

    const authClient = createClient(url, anon, { auth: { persistSession: false } })
    const { data: authData, error: authError } = await authClient.auth.getUser(token)
    if (authError || !authData.user) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })

    const body = await request.json()
    const ticketId = String(body?.ticketId ?? '').trim()
    const message = String(body?.message ?? '').trim()

    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId.' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    const db = supabaseAdmin()
    const { data: ticket, error: ticketError } = await db
      .from('support_messages')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    if (ticket.user_id !== authData.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const author = `customer:${(authData.user.email ?? 'unknown').toLowerCase()}`

    const { error: insertError } = await db.from('support_replies').insert({
      ticket_id: ticketId,
      admin_email: author,
      body: message,
    })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    const { error: statusError } = await db
      .from('support_messages')
      .update({ status: 'in_progress' })
      .eq('id', ticketId)

    if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
