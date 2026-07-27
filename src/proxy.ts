import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

/**
 * Admin panel middleware.
 * - Protects all /admin/* routes via Supabase session check
 * - Non-admin users are redirected to /login
 * - Role enforcement (admin-only) is done at the layout level
 * - In production, only accessible from admin.cityculture.in
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // In production, restrict to admin subdomain only
  if (!isLocalhost) {
    const host = hostname.split(':')[0]
    const ALLOWED_HOST = 'admin.cityculture.in'

    if (host !== ALLOWED_HOST) {
      return new NextResponse('Access Denied', { status: 403 })
    }

    // Force HTTPS
    if (request.nextUrl.protocol !== 'https:') {
      const httpsUrl = request.nextUrl.clone()
      httpsUrl.protocol = 'https:'
      return NextResponse.redirect(httpsUrl)
    }
  }

  // Refresh Supabase session
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // All /admin/* routes require authentication
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Root redirect to admin dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin/admin-dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
