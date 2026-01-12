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

  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  const db = supabaseAdmin()
  const { data: userData, error: userError } = await db.auth.getUser(token)

  if (userError || !userData?.user) {
    const res = NextResponse.json({ ok: false, error: 'Invalid user' }, { status: 401 })
    res.cookies.set('pufff_is_admin', 'false', { path: '/', maxAge: 0 })
    return res
  }

  const user = userData.user
  const email = user.email?.toLowerCase() ?? ''

  // 1. Check email list if provided
  let isAdmin = adminEmails.length === 0 || adminEmails.includes(email)

  // 2. Check profiles table (Database truth)
  if (isAdmin) {
    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    isAdmin = profile?.role === 'admin'
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[admin session] user:', email, 'isAdmin:', isAdmin)
  }

  const res = NextResponse.json({ ok: true, isAdmin })
  res.cookies.set('pufff_is_admin', isAdmin ? 'true' : 'false', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
