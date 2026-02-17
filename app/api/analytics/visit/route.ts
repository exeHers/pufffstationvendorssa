import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || 'Unknown error' }, { status: 500 })
  }
}
