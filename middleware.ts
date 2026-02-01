import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes only
  if (pathname.startsWith('/admin')) {
    // We store this cookie when admin logs in successfully
    const isAdmin = req.cookies.get('pufff_is_admin')?.value === 'true'
    
    // Look for any supabase auth related cookies
    const cookies = req.cookies.getAll()
    const hasAuthCookie = cookies.some(c => 
      c.name.includes('supabase-auth-token') || 
      c.name.includes('sb-') || 
      c.name.includes('access-token')
    )

    // If they have NO auth cookie at all, send to login.
    // If they HAVE an auth cookie but not the isAdmin cookie, let them through
    // so the AdminClient.tsx can verify their specific role without a redirect loop.
    if (!isAdmin && !hasAuthCookie) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      const nextTarget = `${req.nextUrl.pathname}${req.nextUrl.search}`
      url.searchParams.set('next', nextTarget)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
