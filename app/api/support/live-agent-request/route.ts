import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

function parseEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

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
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })
    }

    const body = await request.json()
    const message = String(body?.message ?? '').trim()
    const subject = String(body?.subject ?? 'Live agent request').trim()

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const user = authData.user
    const db = supabaseAdmin()

    const { data: inserted, error: insertError } = await db
      .from('support_messages')
      .insert({
        user_id: user.id,
        email: user.email ?? null,
        subject,
        message,
        status: 'waiting_agent',
      })
      .select('*')
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create support request.' }, { status: 500 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.SUPPORT_FROM_EMAIL
    const toList = parseEmails(process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.SUPPORT_TO_EMAIL)

    if (apiKey && from && toList.length > 0) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(apiKey)

        const customerName = String((user.user_metadata as any)?.full_name ?? (user.user_metadata as any)?.name ?? 'Customer').trim()
        const html = `
          <div style="font-family:system-ui;line-height:1.5">
            <h2>Live agent request</h2>
            <p><b>Ticket ID:</b> ${escapeHtml(inserted.id)}</p>
            <p><b>Name:</b> ${escapeHtml(customerName)}</p>
            <p><b>Email:</b> ${escapeHtml(user.email ?? 'unknown')}</p>
            <p><b>Status:</b> WAITING_AGENT</p>
            <hr />
            <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
          </div>
        `

        await resend.emails.send({
          from,
          to: toList,
          subject: `Live agent requested: ${inserted.id.slice(0, 8)}`,
          html,
        })
      } catch (mailError) {
        console.warn('Live agent notification email failed:', mailError)
      }
    }

    return NextResponse.json({ success: true, ticket: inserted })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
