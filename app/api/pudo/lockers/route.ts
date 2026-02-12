import { NextResponse } from 'next/server'
import localLockers from '@/data/pudo_lockers.json'

export const runtime = 'edge'
export const dynamic = 'force-static'

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2-lat1);  
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const all = searchParams.get('all') // Return all lockers without distance filter
  
  // Use the imported JSON data directly.
  // We cannot read/write files on Edge runtime.
  const allLockers = localLockers as any[]

  try {
    // Return all normalized lockers when requested
    if (all === 'true' && allLockers.length > 0) {
        const normalizedAll = allLockers.map((l: any) => ({
            ...l,
            lat: parseFloat(l.latitude || l.lat),
            lng: parseFloat(l.longitude || l.lng || l.lon || l.long),
        })).filter((l: any) => !isNaN(l.lat) && !isNaN(l.lng))

        return NextResponse.json(normalizedAll)
    }

    // Filter by distance if coordinates provided
    if (lat && lng && allLockers.length > 0) {
        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        // Filter out invalid coords in the data
        const validLockers = allLockers.filter((l: any) =>
            (l.latitude && (l.longitude || l.lon || l.long)) || (l.lat && (l.lng || l.lon || l.long))
        );

        const sorted = validLockers.map((l: any) => ({
            ...l,
            // Normalize keys (API uses latitude/longitude, our mock used lat/lng)
            lat: parseFloat(l.latitude || l.lat),
            lng: parseFloat(l.longitude || l.lng || l.lon || l.long),
            distance: getDistanceFromLatLonInKm(
                userLat,
                userLng,
                parseFloat(l.latitude || l.lat),
                parseFloat(l.longitude || l.lng || l.lon || l.long)
            )
        })).sort((a: any, b: any) => a.distance - b.distance)

        // Return closest 50
        return NextResponse.json(sorted.slice(0, 50))
    }

    return NextResponse.json(allLockers)

  } catch (error) {
    console.error('Error in Pudo Route:', error)
    return NextResponse.json([])
  }
}
