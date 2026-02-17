const fs = require('fs/promises')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const LOCKER_FILE = path.resolve(__dirname, '../data/pudo_lockers.json')
const BATCH_SIZE = 500

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function mapLocker(raw) {
  const detailed = raw.detailed_address || raw.detailedAddress || {}
  const addressBlock =
    typeof raw.address === 'object' && raw.address
      ? raw.address
      : raw.location || {}

  const latitude = Number(raw.latitude ?? raw.lat ?? raw.geoLatitude ?? raw.geo_latitude)
  const longitude = Number(raw.longitude ?? raw.lng ?? raw.geoLongitude ?? raw.geo_longitude)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  const addressString =
    (typeof raw.address === 'string' && raw.address.trim()) ||
    detailed.formatted_address ||
    [
      addressBlock.addressLine || addressBlock.address_line,
      addressBlock.city,
      addressBlock.province || addressBlock.state,
      addressBlock.postalCode || addressBlock.postal_code,
    ]
      .filter(Boolean)
      .join(', ')

  return {
    locker_code: raw.code || raw.lockerCode || raw.id || null,
    name: raw.name || raw.description || 'Unknown Locker',
    address: addressString || 'Address unavailable',
    city: addressBlock.city || detailed.locality || raw.city || null,
    province: addressBlock.province || addressBlock.state || detailed.province || raw.province || null,
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  }
}

async function main() {
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  console.log('Reading locker data from', LOCKER_FILE)
  const rawJson = await fs.readFile(LOCKER_FILE, 'utf8')
  const lockers = JSON.parse(rawJson)
  if (!Array.isArray(lockers)) {
    throw new Error('Locker JSON is not an array')
  }

  const mapped = lockers.map(mapLocker).filter(Boolean)
  console.log(`Prepared ${mapped.length} locker rows (out of ${lockers.length})`)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE)
    console.log(`Upserting lockers ${i + 1}-${i + batch.length}`)
    const { error } = await supabase
      .from('pudo_lockers')
      .upsert(batch, { onConflict: 'locker_code' })

    if (error) {
      throw new Error(`Supabase upsert failed at batch starting ${i + 1}: ${error.message}`)
    }
  }

  console.log('All lockers upserted successfully')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
