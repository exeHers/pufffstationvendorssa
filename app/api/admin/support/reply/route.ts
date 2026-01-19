import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

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
    const reply = String(body?.reply ?? '').trim()
    const closeAfter = Boolean(body?.closeAfter)

    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })
    if (!reply) return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 })

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.SUPPORT_FROM_EMAIL
    if (!apiKey) return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 })
    if (!from) return NextResponse.json({ error: 'Missing SUPPORT_FROM_EMAIL' }, { status: 500 })

    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const db = supabaseAdmin()

    // ticket
    const { data: ticket, error: tErr } = await db
      .from('support_messages')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (tErr || !ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    // customer email via auth admin
    const { data: u } = await db.auth.admin.getUserById(ticket.user_id)
    const customerEmail = (u.user?.email ?? '').trim()
    if (!customerEmail) return NextResponse.json({ error: 'Customer email not found' }, { status: 400 })

    const subject = String(ticket.subject ?? 'Support reply')
    const customerHtml = `
      <div style="font-family:system-ui;line-height:1.5">
        <p>Hi,</p>
        <p>Reply to your support request:</p>
        <div style="margin:14px 0;padding:12px;border:1px solid #ddd;border-radius:10px;white-space:pre-wrap">${escapeHtml(reply)}</div>
        <p style="color:#666;font-size:12px">Ticket: ${escapeHtml(ticketId)}</p>
        <p>— Puff Station Support</p>
      </div>
    `

    const send = await resend.emails.send({
      from,
      to: customerEmail,
      subject: `Re: ${subject}`,
      html: customerHtml,
    })

    // store reply
    const { error: rErr } = await db.from('support_replies').insert({
      ticket_id: ticketId,
      admin_email: gate.email,
      body: reply,
    })
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    // update ticket status
    const newStatus = closeAfter ? 'closed' : 'replied'
    const { error: sErr } = await db.from('support_messages').update({ status: newStatus }).eq('id', ticketId)
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })

    return NextResponse.json({ success: true, emailId: send.data?.id })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}