import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clearAdminCookie, setAdminCookie } from '@/lib/adminAuth'

function mustEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function makeAnonClient() {
  const url = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anon = mustEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function requireUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, status: 401, error: 'Missing auth token.' }

  const supabase = makeAnonClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    return { ok: false as const, status: 401, error: 'Invalid session. Log in again.' }
  }

  return { ok: true as const, user: data.user }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser(req)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

    const body = await req.json().catch(() => ({}))
    const userId = String(body.userId ?? '')
    if (!userId || userId !== gate.user.id) {
      return NextResponse.json({ error: 'Invalid user.' }, { status: 401 })
    }

    const isAdmin = await setAdminCookie(userId)
    return NextResponse.json({ ok: true, isAdmin })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearAdminCookie()
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Server error' }, { status: 500 })
  }
}
