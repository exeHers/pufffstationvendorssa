import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'

function normalizeQuery(raw: string | null) {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (trimmed.length < 3) return ''
  return trimmed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng') || searchParams.get('lon')

    if (lat && lng) {
      const reverseUrl = new URL(NOMINATIM_REVERSE_ENDPOINT)
      reverseUrl.searchParams.set('format', 'json')
      reverseUrl.searchParams.set('addressdetails', '1')
      reverseUrl.searchParams.set('lat', lat)
      reverseUrl.searchParams.set('lon', lng)

      const reverseResponse = await fetch(reverseUrl.toString(), {
        headers: {
          'User-Agent': process.env.NOMINATIM_USER_AGENT || 'pufffstation-geocoder/1.0 (+https://pufffstation.co.za)',
        },
        next: { revalidate: 60 },
      })

      if (!reverseResponse.ok) {
        const body = await reverseResponse.text()
        console.error('[geocode] nominatim reverse error', reverseResponse.status, body.slice(0, 200))
        return NextResponse.json({ error: 'Reverse geocoding service unavailable' }, { status: 503 })
      }

      const result = await reverseResponse.json()
      const mapped = {
        lat: parseFloat(result?.lat ?? lat),
        lng: parseFloat(result?.lon ?? lng),
        label: String(result?.display_name || ''),
        address: result?.address || {},
      }

      return NextResponse.json({ data: mapped })
    }

    const query = normalizeQuery(searchParams.get('q'))

    if (!query) {
      return NextResponse.json({ error: 'Query must be at least 3 characters.' }, { status: 400 })
    }

    const searchUrl = new URL(NOMINATIM_ENDPOINT)
    searchUrl.searchParams.set('format', 'json')
    searchUrl.searchParams.set('countrycodes', 'za')
    searchUrl.searchParams.set('limit', searchParams.get('limit') || '5')
    searchUrl.searchParams.set('addressdetails', '1')
    searchUrl.searchParams.set('q', query)

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'pufffstation-geocoder/1.0 (+https://pufffstation.co.za)',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[geocode] nominatim error', response.status, body.slice(0, 200))
      return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 503 })
    }

    const results = await response.json()

    const mapped = (Array.isArray(results) ? results : []).map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon ?? item.lng),
      label: item.display_name,
      address: item.address || {},
    })).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('[geocode] unexpected error', error)
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 })
  }
}
