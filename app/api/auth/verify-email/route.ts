export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const debug: any = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ exists: false, error: 'Email required' }, { status: 400 })

    const cleanEmail = String(email).trim().toLowerCase()
    debug.searchingFor = cleanEmail
    
    let db;
    try {
      db = supabaseAdmin()
    } catch (e: any) {
      console.error('[Verify Email] Admin key error:', e.message)
      // If we can't init admin, we can't verify. We'll return exists: true to allow the attempt
      // but include the error so we can see it in the console/network tab.
      return NextResponse.json({ exists: true, debug, error: e.message })
    }

    // Check profiles table
    const { data: profile, error: pErr } = await db
      .from('profiles')
      .select('id, email, role')
      .eq('email', cleanEmail)
      .maybeSingle()

    debug.profileFound = !!profile
    debug.profileError = pErr?.message

    if (profile) {
      return NextResponse.json({ exists: true, debug })
    }

    // Fallback: Check ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
    
    if (adminEmails.includes(cleanEmail)) {
      debug.foundInAdminList = true
      return NextResponse.json({ exists: true, debug })
    }

    return NextResponse.json({ exists: false, debug })
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message, debug }, { status: 500 })
  }
}
