import { NextRequest, NextResponse } from 'next/server'
import { dashboardRouter } from './middleware/dashboard-router'

export function middleware(request: NextRequest) {
  // Fast path - return immediately for static assets and API routes
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes (already handled by matcher, but double-check)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/i)
  ) {
    return NextResponse.next()
  }

  // Call dashboard router (currently disabled, just passes through)
  return dashboardRouter(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
