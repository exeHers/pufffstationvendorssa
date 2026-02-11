import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function parseAdminEmails(value?: string) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function mustEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function makeAnonClient() {
  const url = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anon = mustEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function requireAdmin(req: NextRequest) {
  const adminEmails = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  if (adminEmails.length === 0) {
    return { ok: false as const, error: 'NEXT_PUBLIC_ADMIN_EMAILS is not set.' }
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, error: 'Missing auth token.' }

  const supabaseAnon = makeAnonClient()
  const { data, error } = await supabaseAnon.auth.getUser(token)
  if (error || !data?.user) return { ok: false as const, error: 'Invalid session. Log in again.' }

  const email = (data.user.email ?? '').toLowerCase()
  if (!email || !adminEmails.includes(email)) return { ok: false as const, error: 'Not an admin.' }

  return { ok: true as const, email }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAdmin(req)
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 401 })

    const fd = await req.formData()
    const file = fd.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Missing file.' }, { status: 400 })

    const text = await file.text()
    let parsed: any = null
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    let list: any[] = []
    if (Array.isArray(parsed)) list = parsed
    else if (Array.isArray(parsed?.data)) list = parsed.data

    if (!Array.isArray(list)) {
      return NextResponse.json({ error: 'JSON must be an array or contain data[].' }, { status: 400 })
    }

    if (list.length < 500) {
      return NextResponse.json(
        { error: `Locker list too small (${list.length}). Please upload the full PUDO list.` },
        { status: 400 }
      )
    }

    const jsonDirectory = path.join(process.cwd(), 'data')
    const filePath = path.join(jsonDirectory, 'pudo_lockers.json')

    await fs.mkdir(jsonDirectory, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(list, null, 2))

    return NextResponse.json({ ok: true, count: list.length })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Server error' }, { status: 500 })
  }
}
