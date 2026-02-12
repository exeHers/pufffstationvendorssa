import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data')
    const filePath = path.join(jsonDirectory, 'pudo_lockers.json')

    let count = 0
    try {
      const raw = await fs.readFile(filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) count = parsed.length
      else if (Array.isArray(parsed?.data)) count = parsed.data.length
    } catch {
      count = 0
    }

    return NextResponse.json({ ok: true, count })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message ?? 'Server error' }, { status: 500 })
  }
}
