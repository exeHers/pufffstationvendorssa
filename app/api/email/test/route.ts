export const runtime = 'edge';

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'Pufff Station Support <support@pufffstationsa.co.za>',
      to: ['support@pufffstationsa.co.za'],
      subject: 'Resend test – Pufff Station',
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>✅ Resend is working</h2>
          <p>If you received this email, DNS + Resend + Vercel are fully wired.</p>
          <p><strong>Domain:</strong> pufffstationsa.co.za</p>
          <p><strong>Sender:</strong> support@pufffstationsa.co.za</p>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
