import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'

export async function setAdminCookie(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const isAdmin = !error && data?.role === 'admin'

  const store = await cookies()
  store.set('pufff_is_admin', isAdmin ? 'true' : 'false', {
    path: '/',
    httpOnly: false, // middleware must read it
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return isAdmin
}

export async function clearAdminCookie() {
  const store = await cookies()
  store.set('pufff_is_admin', 'false', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  })
}