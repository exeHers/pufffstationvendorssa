export const runtime = 'edge';

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Ozow hosted payment page redirect
// NOTE: Ozow does not publish full hosted-payment docs publicly; you'll get SiteCode + APIKey + PrivateKey
// when your cousin signs up. Once you have those, fill in buildOzowRedirectUrl().
// Env needed:
//  OZOW_SITE_CODE=...
//  OZOW_API_KEY=...
//  OZOW_PRIVATE_KEY=...
//  NEXT_PUBLIC_SITE_URL=...
//  SUPABASE_SERVICE_ROLE_KEY=...

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string }
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase server env.' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error: err } = await admin.from('orders').select('*').eq('id', orderId).single()
    if (err) return NextResponse.json({ error: err.message }, { status: 500 })

    const siteCode = process.env.OZOW_SITE_CODE
    const apiKey = process.env.OZOW_API_KEY
    const privateKey = process.env.OZOW_PRIVATE_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (!siteCode || !apiKey || !privateKey) {
      return NextResponse.json(
        { error: 'Ozow is not configured. Set OZOW_SITE_CODE, OZOW_API_KEY and OZOW_PRIVATE_KEY.' },
        { status: 500 }
      )
    }

    const redirectUrl = buildOzowRedirectUrl({
      siteCode,
      apiKey,
      privateKey,
      amount: Number(order?.total_amount ?? 0),
      transactionReference: orderId,
      successUrl: `${siteUrl}/orders`,
      cancelUrl: `${siteUrl}/checkout`,
      errorUrl: `${siteUrl}/checkout`,
      notifyUrl: `${siteUrl}/api/ozow/notify`,
    })

    if (!redirectUrl) {
      return NextResponse.json(
        {
          error:
            'Ozow redirect URL builder not implemented yet. Once you receive Ozow docs/keys, fill in buildOzowRedirectUrl() in app/api/ozow/initiate/route.ts.',
        },
        { status: 501 }
      )
    }

    return NextResponse.json({ redirectUrl })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}

function buildOzowRedirectUrl(_args: {
  siteCode: string
  apiKey: string
  privateKey: string
  amount: number
  transactionReference: string
  successUrl: string
  cancelUrl: string
  errorUrl: string
  notifyUrl: string
}) {
  // TODO: implement based on Ozow hosted payment page documentation.
  // This MUST include the correct HashCheck signature.
  // Returning null for now prevents fake payments.
  return null as string | null
}
