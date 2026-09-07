import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin panel middleware.
 * - Protects root / and /admin/* routes via cc_admin_session cookie check
 * - Unauthenticated requests are redirected to /login
 * - Cryptographic & role enforcement is performed in (admin)/layout.tsx
 * - In production, strictly accessible from admin.cityculture.in
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isLocalhost =
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('0.0.0.0')

  // In production, restrict to admin subdomain only
  if (!isLocalhost) {
    const host = hostname.split(':')[0]
    const ALLOWED_HOST = 'admin.cityculture.in'

    if (host !== ALLOWED_HOST) {
      return new NextResponse('Access Denied', { status: 403 })
    }

    // Force HTTPS in production
    if (request.nextUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      const httpsUrl = request.nextUrl.clone()
      httpsUrl.protocol = 'https:'
      return NextResponse.redirect(httpsUrl)
    }
  }

  const { pathname } = request.nextUrl
  const adminSession = request.cookies.get('cc_admin_session')?.value

  // Protected routes: root / and all /admin/* routes
  const isProtectedRoute = pathname === '/' || pathname.startsWith('/admin')

  if (isProtectedRoute && !adminSession) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
