import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that do NOT require authentication
const PUBLIC_PATHS = ['/login', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow public paths without auth check
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const token = request.cookies.get('wms_token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image  (image optimization files)
     * - favicon.ico  (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
