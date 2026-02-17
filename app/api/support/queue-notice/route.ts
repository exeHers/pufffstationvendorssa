import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

const QUEUE_NOTICE = 'All agents are currently busy. You can continue waiting here, or come back later and we will still assist you.'

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
    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId.' }, { status: 400 })

    const db = supabaseAdmin()
    const { data: ticket, error: ticketError } = await db
      .from('support_messages')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    if (ticket.user_id !== authData.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    if ((ticket.status ?? '').toLowerCase() !== 'waiting_agent') {
      return NextResponse.json({ success: true, skipped: true, reason: 'status_not_waiting' })
    }

    const ageMs = Date.now() - new Date(ticket.created_at).getTime()
    if (ageMs < 5 * 60 * 1000) {
      return NextResponse.json({ success: true, skipped: true, reason: 'too_early' })
    }

    const { data: existingNotice } = await db
      .from('support_replies')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('admin_email', 'system@pufffstation.local')
      .eq('body', QUEUE_NOTICE)
      .maybeSingle()

    if (existingNotice?.id) {
      return NextResponse.json({ success: true, skipped: true, reason: 'already_sent' })
    }

    const { data: adminReply } = await db
      .from('support_replies')
      .select('id')
      .eq('ticket_id', ticketId)
      .neq('admin_email', 'system@pufffstation.local')
      .limit(1)
      .maybeSingle()

    if (adminReply?.id) {
      return NextResponse.json({ success: true, skipped: true, reason: 'agent_replied' })
    }

    const { error: insertError } = await db.from('support_replies').insert({
      ticket_id: ticketId,
      admin_email: 'system@pufffstation.local',
      body: QUEUE_NOTICE,
    })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'queue_notice_sent' })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
