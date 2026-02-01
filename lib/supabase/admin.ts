import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client (Service Role)
 * WARNING: Only use this in server-side / API routes. 
 * Never expose the Service Role Key to the client.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    console.error('[Supabase Admin] Error: NEXT_PUBLIC_SUPABASE_URL is not defined.')
    throw new Error('Server configuration error: Database URL missing.')
  }
  
  if (!serviceKey) {
    console.error('[Supabase Admin] Error: SUPABASE_SERVICE_ROLE_KEY is not defined.')
    // On Cloudflare, ensure you have added this secret via the dashboard or wrangler secret put
    throw new Error('Server configuration error: Admin credentials missing.')
  }

  return createClient(url, serviceKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: { 'x-application-name': 'pufff-station-admin' }
    }
  })
}
