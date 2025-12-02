import { NextRequest, NextResponse } from 'next/server'

/**
 * Dashboard Routing Middleware
 * 
 * Automatically redirect users to the right dashboard based on their role:
 * - CITIZEN → /dashboard (vault of personal documents)
 * - VERIFIER → /verifier (validate documents via QR/ID)
 * - MAKER → /maker (issue documents, human review queue)
 */
export function dashboardRouter(request: NextRequest) {
  const userRole = request.cookies.get('nddv_user_role')?.value

  // If no role, redirect to login
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const pathname = request.nextUrl.pathname

  // If already on correct dashboard, allow
  if (
    (userRole === 'CITIZEN' && pathname.startsWith('/dashboard')) ||
    (userRole === 'VERIFIER' && pathname.startsWith('/verifier')) ||
    (userRole === 'MAKER' && pathname.startsWith('/maker'))
  ) {
    return NextResponse.next()
  }

  // Redirect to appropriate dashboard
  const dashboardMap = {
    CITIZEN: '/dashboard',
    VERIFIER: '/verifier',
    MAKER: '/maker',
  }

  const redirectTo = dashboardMap[userRole as keyof typeof dashboardMap] || '/dashboard'

  if (pathname === '/dashboard' || pathname === '/verifier' || pathname === '/maker') {
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return NextResponse.next()
}
