import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseEnvReady = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseEnvReady
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (new Proxy(
      {},
      {
        get() {
          throw new Error('Missing Supabase environment variables')
        },
      }
    ) as ReturnType<typeof createClient>)

export function debugSupabaseEnv(source: string = 'app') {
  if (process.env.NODE_ENV !== 'development') return
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.info(`[supabase env:${source}] url:${hasUrl} anon:${hasAnon}`)
}
