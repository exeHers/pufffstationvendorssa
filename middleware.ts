import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes only
  if (pathname.startsWith('/admin')) {
    // We store this cookie when admin logs in successfully
    const isAdmin = req.cookies.get('pufff_is_admin')?.value === 'true'

    if (!isAdmin) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}