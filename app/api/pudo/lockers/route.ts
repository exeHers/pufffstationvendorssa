import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export const runtime = 'nodejs'

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
  const refresh = searchParams.get('refresh') // Secret flag to force refresh

  const jsonDirectory = path.join(process.cwd(), 'data')
  const filePath = path.join(jsonDirectory, 'pudo_lockers.json')

  try {
    let allLockers = []

    // Check if file exists
    let fileExists = false;
    try {
        await fs.access(filePath);
        fileExists = true;
    } catch {
        fileExists = false;
    }

    // Fetch from API if refresh=true OR file missing
    if (refresh === 'true' || !fileExists) {
        console.log('Attempting to fetch fresh lockers list from Pudo API (Browser Mode)...')
        try {
            // URL from Documentation
            const apiUrl = 'https://api-pudo.co.za/lockers-data'
            
            // Mimic a real browser to avoid 403/404 blocks
            const res = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.pudo.co.za/'
                }
            })

            if (res.ok) {
                const data = await res.json()
                console.log(`Fetched ${data.length} lockers from API!`)
                
                // Save to file (Cache it permanently)
                await fs.writeFile(filePath, JSON.stringify(data, null, 2))
                allLockers = data
            } else {
                console.error('Pudo API Failed:', res.status, res.statusText)
                
                // Fallback: Read existing file if API fails
                if (fileExists) {
                    const fileContents = await fs.readFile(filePath, 'utf8')
                    allLockers = JSON.parse(fileContents)
                }
            }
        } catch (apiError) {
            console.error('API Fetch Error:', apiError)
            if (fileExists) {
                const fileContents = await fs.readFile(filePath, 'utf8')
                allLockers = JSON.parse(fileContents)
            }
        }
    } else {
        // Normal mode: Read from file
         try {
            const fileContents = await fs.readFile(filePath, 'utf8')
            allLockers = JSON.parse(fileContents)
         } catch (e) {
             allLockers = []
         }
    }

    // Filter by distance if coordinates provided
    if (lat && lng && allLockers.length > 0) {
        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        // Filter out invalid coords in the data
        const validLockers = allLockers.filter((l: any) => l.latitude && l.longitude || l.lat && l.lng);

        const sorted = validLockers.map((l: any) => ({
            ...l,
            // Normalize keys (API uses latitude/longitude, our mock used lat/lng)
            lat: parseFloat(l.latitude || l.lat),
            lng: parseFloat(l.longitude || l.lng),
            distance: getDistanceFromLatLonInKm(userLat, userLng, parseFloat(l.latitude || l.lat), parseFloat(l.longitude || l.lng))
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
