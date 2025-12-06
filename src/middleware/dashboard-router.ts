import { NextRequest, NextResponse } from 'next/server'

/**
 * Dashboard Routing Middleware
 * 
 * Automatically redirect users to the right dashboard based on their role:
 * - CITIZEN → /dashboard (vault of personal documents)
 * - VERIFIER → /verifier (validate documents via QR/ID)
 * - MAKER → /maker (issue documents, human review queue)
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/staff-login', '/register', '/about', '/contact']

// Routes where authenticated users should be redirected to their dashboard
const AUTH_REDIRECT_ROUTES = ['/', '/login', '/staff-login', '/register']

export function dashboardRouter(request: NextRequest) {
  // Middleware logic disabled to prevent conflicts with Privy client-side auth.
  // Reliance is on client-side protection in Layouts and Pages.
  return NextResponse.next()
}
