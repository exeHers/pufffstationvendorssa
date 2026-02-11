import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Placeholder endpoint for future Yoco checkout integration.
// Keep this returning 501 until keys + webhook verification are implemented.
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Yoco checkout is not configured yet. Add Yoco API keys and checkout session logic in app/api/yoco/initiate/route.ts.',
    },
    { status: 501 }
  )
}
