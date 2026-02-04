import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const apiKey = process.env.PUDO_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    // Attempting to fetch from Pudo API
    // We'll use a generic "Find nearby" structure. 
    // If Pudo uses a different specific endpoint (e.g. POST to /get-lockers), we might need to adjust.
    const response = await fetch(`https://api.pudo.co.za/v1/locations?latitude=${lat}&longitude=${lng}&radius=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      // Fallback: Sometimes APIs require POST for location searches.
      // If GET fails 404/405, we might try POST in a future step.
      console.error('Pudo API Error:', response.status)
      return NextResponse.json({ error: 'Failed to fetch lockers from Pudo' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Pudo Proxy Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
