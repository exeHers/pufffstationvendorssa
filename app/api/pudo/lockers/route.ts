import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export const runtime = 'nodejs' // Use Node runtime to read files

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    // Read the local JSON file
    const jsonDirectory = path.join(process.cwd(), 'data')
    const fileContents = await fs.readFile(jsonDirectory + '/pudo_lockers.json', 'utf8')
    const allLockers = JSON.parse(fileContents)

    if (lat && lng) {
        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        // Sort by distance
        const sorted = allLockers.map((l: any) => ({
            ...l,
            distance: getDistanceFromLatLonInKm(userLat, userLng, l.lat, l.lng)
        })).sort((a: any, b: any) => a.distance - b.distance)

        // Return closest 50
        return NextResponse.json(sorted.slice(0, 50))
    }

    // Default: return all 50 (since our list is small)
    return NextResponse.json(allLockers)

  } catch (error) {
    console.error('Error reading local Pudo file:', error)
    return NextResponse.json([])
  }
}
