import { NextResponse } from 'next/server'

export const runtime = 'edge' // important for Resend

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = await req.json()

    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const subject = String(body?.subject ?? '').trim()
    const message = String(body?.message ?? '').trim()
    const orderId = String(body?.orderId ?? '').trim() // optional
    const phone = String(body?.phone ?? '').trim() // optional

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields (name, email, subject, message).' },
        { status: 400 }
      )
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const from = process.env.SUPPORT_FROM_EMAIL
    const to = process.env.SUPPORT_TO_EMAIL
    if (!from || !to) {
      return NextResponse.json({ error: 'Server missing SUPPORT_* env vars.' }, { status: 500 })
    }

    // 1) Email to admin/support inbox
    const adminHtml = `
      <div style="font-family:system-ui;line-height:1.4">
        <h2>New Support Request</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        ${phone ? `<p><b>Phone:</b> ${escapeHtml(phone)}</p>` : ''}
        ${orderId ? `<p><b>Order ID:</b> ${escapeHtml(orderId)}</p>` : ''}
        <p><b>Subject:</b> ${escapeHtml(subject)}</p>
        <hr/>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      </div>
    `

    const adminSend = await resend.emails.send({
      from,
      to,
      replyTo: email, // so you can reply directly to the customer
      subject: `Support: ${subject}${orderId ? ` (Order: ${orderId})` : ''}`,
      html: adminHtml,
    })

    // 2) Auto-reply to customer (optional but professional)
    const customerHtml = `
      <div style="font-family:system-ui;line-height:1.4">
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for reaching out - we received your message and we will reply as soon as possible.</p>
        ${orderId ? `<p><b>Your Order ID:</b> ${escapeHtml(orderId)}</p>` : ''}
        <p style="margin-top:16px"><b>What you sent:</b></p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
        <p style="margin-top:16px">- Puff Station Support</p>
      </div>
    `

    const customerSend = await resend.emails.send({
      from,
      to: email,
      subject: `We got your message: ${subject}`,
      html: customerHtml,
    })

    return NextResponse.json({
      success: true,
      admin: { id: adminSend.data?.id },
      customer: { id: customerSend.data?.id },
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
