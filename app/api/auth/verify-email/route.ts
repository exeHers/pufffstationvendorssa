export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ exists: false, error: 'Email required' }, { status: 400 })

    const cleanEmail = String(email).trim().toLowerCase()
    
    let db;
    try {
      db = supabaseAdmin()
    } catch (e) {
      // If service key is missing, we can't verify properly.
      // We'll fall back to letting the password reset try anyway, but we log it.
      console.error('[Verify Email] Admin key missing')
      return NextResponse.json({ exists: true, warning: 'Verification bypassed' })
    }

    // Check profiles table (using service key bypasses RLS)
    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (profile) {
      return NextResponse.json({ exists: true })
    }

    // Also check if they are in the admin emails list as a fallback
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
    
    if (adminEmails.includes(cleanEmail)) {
      return NextResponse.json({ exists: true })
    }

    return NextResponse.json({ exists: false })
  } catch (err) {
    return NextResponse.json({ exists: false, error: 'Internal Error' }, { status: 500 })
  }
}
