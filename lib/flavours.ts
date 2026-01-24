import { debugSupabaseEnv, supabase, supabaseEnvReady } from '@/lib/supabaseClient'

export type Flavour = {
  id: string
  name: string
  slug: string
  sort_order: number
}

export async function fetchActiveFlavours(): Promise<Flavour[]> {
  if (!supabaseEnvReady) {
    debugSupabaseEnv('flavours')
    return []
  }

  const { data, error } = await supabase
    .from('flavours')
    .select('id,name,slug,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    debugSupabaseEnv('flavours-error')
    console.error('fetchActiveFlavours error:', error)
    return []
  }

  return data ?? []
}
