import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const userAgent = request.headers.get('user-agent') || null
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const ipAddress = forwardedFor.split(',')[0]?.trim() || null
    const path = request.headers.get('referer') || null

    const db = supabaseAdmin()
    const { error } = await db.from('site_visits').insert({
      visited_at: new Date().toISOString(),
      user_agent: userAgent,
      path,
      ip_address: ipAddress,
    })

    if (error) {
      console.warn('[analytics] failed to record visit', error.message)
      return NextResponse.json({ success: true, skipped: true, reason: 'db_error' })
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    console.warn('[analytics] unexpected error', e)
    return NextResponse.json({ success: true, skipped: true })
  }
}
