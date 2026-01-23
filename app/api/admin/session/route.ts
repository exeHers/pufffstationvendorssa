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
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 401 })
    }

    // 1. Check for Admin Emails env
    const rawAdminEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
    const adminEmailsList = parseAdminEmails(rawAdminEmails)

    // 2. Try to init Admin Client
    let db;
    try {
      db = supabaseAdmin()
    } catch (e) {
      console.error('[Admin Session] Failed to init supabaseAdmin:', e)
      return NextResponse.json({ 
        ok: false, 
        isAdmin: false, 
        error: 'Backend configuration error (Admin Key missing). Please check Cloudflare Secrets.' 
      }, { status: 500 })
    }

    const { data: userData, error: userError } = await db.auth.getUser(token)

    if (userError || !userData?.user) {
      return NextResponse.json({ ok: false, isAdmin: false, error: 'Invalid or expired session' }, { status: 401 })
    }

    const user = userData.user
    const email = user.email?.toLowerCase() ?? ''

    // 3. Match Email
    const isEmailAuthorized = adminEmailsList.length > 0 && adminEmailsList.includes(email)

    // 4. Match Database Role
    let isRoleAuthorized = false
    const { data: profile, error: profileErr } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profileErr && profile?.role === 'admin') {
      isRoleAuthorized = true
    }

    const isAdmin = isEmailAuthorized || isRoleAuthorized

    // Debug info (safe because it only goes to the authenticated user's browser during this check)
    return NextResponse.json({ 
      ok: true, 
      isAdmin,
      debug: {
        email,
        isEmailAuthorized,
        isRoleAuthorized,
        adminListCount: adminEmailsList.length
      }
    })
  } catch (err: any) {
    console.error('[Admin Session] Crash:', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
