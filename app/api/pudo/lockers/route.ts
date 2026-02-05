import { NextResponse } from 'next/server'

// Keep mock data as a last resort
const MOCK_LOCKERS = [
  { id: '1', name: 'Ballito Junction', address: 'Ballito Junction Mall, Level 6', lat: -29.527, lng: 31.201 },
  { id: '2', name: 'Sandton City', address: 'Sandton City, Rivonia Rd', lat: -26.107, lng: 28.052 },
  { id: '3', name: 'Gateway Theatre', address: 'Gateway Mall, Umhlanga', lat: -29.725, lng: 31.065 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')

  try {
    // Fetch directly from the URL provided by the user
    // Note: Assuming this returns a raw JSON array of all lockers
    const response = await fetch('https://api-pudo.co.za/lockers-data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Some APIs require User-Agent to not look like a bot
        'User-Agent': 'Mozilla/5.0 (compatible; PudoVendor/1.0)'
      }
    })

    if (!response.ok) {
      console.warn(`Pudo API (lockers-data) returned ${response.status}. Using Mock.`)
      return NextResponse.json(MOCK_LOCKERS)
    }

    const allLockers = await response.json()
    
    // If user provided location, filter the list to closest 50
    if (latParam && lngParam) {
        const lat = parseFloat(latParam)
        const lng = parseFloat(lngParam)
        
        // Simple distance sort (Pythagoras on lat/lng)
        // Accurate enough for finding "closest pins"
        const sorted = allLockers.map((locker: any) => {
            const lLat = parseFloat(locker.lat || locker.latitude)
            const lLng = parseFloat(locker.lng || locker.longitude || locker.long)
            const dist = Math.sqrt(Math.pow(lat - lLat, 2) + Math.pow(lng - lLng, 2))
            return { ...locker, dist }
        })
        .sort((a: any, b: any) => a.dist - b.dist)
        .slice(0, 50) // Return only closest 50

        return NextResponse.json(sorted)
    }

    // If no location, return everything (or a subset to prevent crash)
    // Returning 3000 items might be heavy, but let's try it if that's what is requested.
    return NextResponse.json(allLockers)

  } catch (err) {
    console.error('Pudo API Request Failed:', err)
    return NextResponse.json(MOCK_LOCKERS)
  }
}
