export const runtime = 'edge';

import { NextResponse } from 'next/server'

// Ozow server-to-server notify webhook.
// Once your cousin gets Ozow keys, implement signature verification here.
// For safety, this endpoint currently refuses to mark any orders paid.

export async function POST(req: Request) {
  const bodyText = await req.text().catch(() => '')
  console.warn('[ozow] notify received but not configured yet', bodyText.slice(0, 400))
  return NextResponse.json(
    { error: 'Ozow notify not configured yet. Implement signature verification before going live.' },
    { status: 501 }
  )
}
