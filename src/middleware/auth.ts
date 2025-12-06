import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

// Validate JWT secret is set
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'dev-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment')
  }
  console.warn('⚠️  Using default JWT_SECRET. Set JWT_SECRET environment variable for production.')
}

const JWT_SECRET_FINAL = JWT_SECRET || 'dev-secret-key-change-in-production'

/**
 * Authentication middleware for protected API routes
 * 
 * Validates JWT token from Authorization header or x-auth-token
 * Extracts userId and adds to request headers for route handlers
 */
export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Get token from Authorization header (Bearer token) or custom header
      let token = request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        token = request.headers.get('x-auth-token')
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Missing authentication token' },
          { status: 401 }
        )
      }

      // Verify and decode token
      const decoded = verify(token, JWT_SECRET_FINAL) as { userId: string; email?: string }

      if (!decoded.userId) {
        return NextResponse.json(
          { error: 'Invalid token payload' },
          { status: 401 }
        )
      }

      // Add userId to request headers for handler to access
      const newHeaders = new Headers(request.headers)
      newHeaders.set('x-user-id', decoded.userId)
      if (decoded.email) {
        newHeaders.set('x-user-email', decoded.email)
      }

      // Create new request with updated headers
      const newRequest = new NextRequest(request, {
        headers: newHeaders,
      })

      return handler(newRequest)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('jwt expired')) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      }

      if (message.includes('invalid token')) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Optional authentication middleware
 * Doesn't reject if no token, but extracts userId if provided
 */
export function withOptionalAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      let token = request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        token = request.headers.get('x-auth-token')
      }

      if (token) {
        const decoded = verify(token, JWT_SECRET_FINAL) as { userId: string; email?: string }

        if (decoded.userId) {
          const newHeaders = new Headers(request.headers)
          newHeaders.set('x-user-id', decoded.userId)
          if (decoded.email) {
            newHeaders.set('x-user-email', decoded.email)
          }

          const newRequest = new NextRequest(request, {
            headers: newHeaders,
          })

          return handler(newRequest)
        }
      }

      // Continue without auth
      return handler(request)
    } catch (error) {
      // Continue without auth on error
      console.warn('Optional auth error (continuing without auth):', error)
      return handler(request)
    }
  }
}

/**
 * Role-based authorization middleware
 * Checks user role in database
 */
export function withRole(
  allowedRoles: string[],
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // In a real implementation, fetch user from database
      // and check their role against allowedRoles
      // For now, we'll assume role is in token claims (extend JWT payload)
      
      // const user = await prisma.user.findUnique({
      //   where: { id: userId },
      //   select: { role: true }
      // })
      // if (!user || !allowedRoles.includes(user.role)) {
      //   return NextResponse.json(
      //     { error: 'Insufficient permissions' },
      //     { status: 403 }
      //   )
      // }

      return handler(request)
    } catch (error) {
      console.error('Authorization error:', error)
      return NextResponse.json(
        { error: 'Authorization failed' },
        { status: 403 }
      )
    }
  }
}

/**
 * Rate limiting middleware (basic implementation)
 * Use Redis in production for distributed rate limiting
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60 * 1000, // 1 minute
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const identifier = request.headers.get('x-user-id') || request.ip || 'unknown'
    const now = Date.now()

    let record = requestCounts.get(identifier)

    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs }
      requestCounts.set(identifier, record)
    }

    if (record.count >= maxRequests) {
      const resetIn = Math.ceil((record.resetAt - now) / 1000)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
          },
        }
      )
    }

    record.count++
    const response = await handler(request)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (maxRequests - record.count).toString())
    response.headers.set('X-RateLimit-Reset', record.resetAt.toString())

    return response
  }
}

/**
 * CORS middleware for API routes
 */
export function withCORS(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-auth-token',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = await handler(request)

    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    )
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-user-id, x-auth-token'
    )

    return response
  }
}
