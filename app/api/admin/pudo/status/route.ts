import { NextResponse } from 'next/server'
import localLockers from '@/data/pudo_lockers.json'

export const runtime = 'edge'
export const dynamic = 'force-static'

export async function GET() {
  try {
    let count = 0
    const lockers = localLockers as any[]

    if (Array.isArray(lockers)) {
      count = lockers.length
    } else if (Array.isArray((lockers as any).data)) {
        count = (lockers as any).data.length
    }

    return NextResponse.json({ ok: true, count })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message ?? 'Server error' }, { status: 500 })
  }
}
