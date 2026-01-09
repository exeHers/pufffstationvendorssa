import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) =>
      s
        .trim()
        .replace(/^"+|"+$/g, '')
        .replace(/^'+|'+$/g, '')
        .toLowerCase()
    )
    .filter(Boolean)
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!token) {
    const res = NextResponse.json({ ok: false, error: 'Missing token' }, { status: 401 })
    res.cookies.set('pufff_is_admin', 'false', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
    })
    return res
  }

  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)
  const db = supabaseAdmin()
  const { data, error } = await db.auth.getUser(token)

  if (process.env.NODE_ENV === 'development') {
    console.info('[admin session] token', Boolean(token), 'error', !!error)
  }

  const email = data.user?.email?.toLowerCase() ?? ''
  const isAdmin = Boolean(email && adminEmails.includes(email))

  const res = NextResponse.json({ ok: true, isAdmin })
  res.cookies.set('pufff_is_admin', isAdmin ? 'true' : 'false', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
