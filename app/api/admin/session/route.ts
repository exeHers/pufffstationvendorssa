export const runtime = 'edge';

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
  const debug: any = {
    step: 'start',
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      rawAdminEmails: !!(process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    }
  }

  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing token', debug }, { status: 401 })
    }

    // 1. Admin Emails Check
    const rawAdminEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
    const adminEmailsList = parseAdminEmails(rawAdminEmails)
    debug.adminListCount = adminEmailsList.length

    // 2. Init Admin Client
    let db;
    try {
      db = supabaseAdmin()
      debug.step = 'db_init_ok'
    } catch (e: any) {
      return NextResponse.json({ 
        ok: false, 
        isAdmin: false, 
        error: `Server Config Error: ${e.message}`,
        debug
      }, { status: 500 })
    }

    const { data: userData, error: userError } = await db.auth.getUser(token)
    if (userError || !userData?.user) {
      debug.userError = userError?.message
      return NextResponse.json({ ok: false, isAdmin: false, error: 'Session invalid or expired', debug }, { status: 401 })
    }

    const user = userData.user
    const email = user.email?.toLowerCase() ?? ''
    debug.email = email

    // 3. Authorization Logic
    const isEmailAuthorized = adminEmailsList.includes(email)
    debug.isEmailAuthorized = isEmailAuthorized

    let isRoleAuthorized = false
    const { data: profile, error: profileErr } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    
    if (profile?.role === 'admin') {
      isRoleAuthorized = true
    }
    debug.isRoleAuthorized = isRoleAuthorized
    debug.profileError = profileErr?.message

    const isAdmin = isEmailAuthorized || isRoleAuthorized

    return NextResponse.json({ 
      ok: true, 
      isAdmin,
      debug
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Server Error', debug }, { status: 500 })
  }
}
