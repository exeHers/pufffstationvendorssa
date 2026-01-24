import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes only
  if (pathname.startsWith('/admin')) {
    // We store this cookie when admin logs in successfully
    const isAdmin = req.cookies.get('pufff_is_admin')?.value === 'true'
    const hasSession = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token')

    // Only redirect if we are SURE they aren't an admin
    // If they have a session but no admin cookie yet, we let the AdminClient handle the check
    // This prevents the "double login" redirect loop.
    if (!isAdmin) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      const nextTarget = `${req.nextUrl.pathname}${req.nextUrl.search}`
      url.searchParams.set('next', nextTarget)
      // return NextResponse.redirect(url) // Temporarily disable strict middleware redirect to fix loop
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
