import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type RawLocker = {
  locker_code: string | null
  name: string | null
  address: string | null
  city?: string | null
  province?: string | null
  latitude: number | null
  longitude: number | null
}

type Locker = {
  code: string
  name: string
  address: string
  city?: string | null
  province?: string | null
  lat: number
  lng: number
}

const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes
let cachedLockers: Locker[] | null = null
let lastFetched = 0

function normalizeLocker(raw: RawLocker): Locker | null {
  const lat = Number(raw.latitude)
  const lng = Number(raw.longitude)
  if (!raw.locker_code || Number.isNaN(lat) || Number.isNaN(lng)) return null

  return {
    code: raw.locker_code,
    name: raw.name || 'Unknown Locker',
    address: raw.address || 'Address unavailable',
    city: raw.city ?? null,
    province: raw.province ?? null,
    lat,
    lng,
  }
}

async function loadLockers(force?: boolean) {
  if (!force && cachedLockers && Date.now() - lastFetched < CACHE_TTL_MS) {
    return cachedLockers
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('pudo_lockers')
    .select('locker_code,name,address,city,province,latitude,longitude')

  if (error) {
    console.error('[pudo/lockers] Supabase query failed:', error.message)
    throw new Error('Failed to load lockers')
  }

  cachedLockers = (data || []).map(normalizeLocker).filter((l): l is Locker => Boolean(l))
  lastFetched = Date.now()
  return cachedLockers
}

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
  
  try {
    const lockers = await loadLockers()

    // Return all normalized lockers when requested
    if (all === 'true') {
      return NextResponse.json(lockers)
    }

    // Filter by distance if coordinates provided
    if (lat && lng && lockers.length > 0) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)

      const sorted = lockers
        .map((locker) => ({
          ...locker,
          distance: getDistanceFromLatLonInKm(userLat, userLng, locker.lat, locker.lng)
        }))
        .sort((a, b) => a.distance - b.distance)

      // Return closest 50
      return NextResponse.json(sorted.slice(0, 50))
    }

    return NextResponse.json(lockers)

  } catch (error) {
    console.error('Error in Pudo Route:', error)
    return NextResponse.json([])
  }
}
