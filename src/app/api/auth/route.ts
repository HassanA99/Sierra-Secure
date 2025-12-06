import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
const authService = new AuthService(prisma)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
import { sanitizeUserForClient } from '@/lib/serializers/user'

/**
 * POST /api/auth/login
 * Authenticate with Privy and create session
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith('/login')) {
    return handleLogin(request)
  }
  if (request.nextUrl.pathname.endsWith('/verify')) {
    return handleVerify(request)
  }
  if (request.nextUrl.pathname.endsWith('/logout')) {
    return handleLogout(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        displayName: true,
        status: true,
        kycStatus: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

/**
 * Handle login with Privy
 */
async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json()
    const { privyUserId, email, walletAddress, displayName } = body

    if (!privyUserId) {
      return NextResponse.json({ error: 'Privy user ID required' }, { status: 400 })
    }

    // Use AuthService to create/update user
    const user = await authService.loginWithPrivy({
      privyUserId,
      email,
      walletAddress,
      displayName,
    })

    // Generate JWT token for session
    const token = sign(
      { userId: user.id, email: typeof user.email === 'string' ? user.email : user.email?.address, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      {
        user: sanitizeUserForClient(user),
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Login error:', error)

    return NextResponse.json(
      { error: 'Login failed', message },
      { status: 500 }
    )
  }
}

/**
 * Handle wallet signature verification
 */
async function handleVerify(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, signature, walletAddress } = body

    if (!message || !signature || !walletAddress) {
      return NextResponse.json(
        { error: 'Message, signature, and wallet address required' },
        { status: 400 }
      )
    }

    // Verify signature using AuthService
    const isValid = await authService.verifyWalletSignature({
      message,
      signature,
      walletAddress,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    // Get or create user
    const user = await authService.loginWithPrivy({
      privyUserId: `verified_${walletAddress}`,
      walletAddress,
    })

    const token = sign(
      { userId: user.id, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      {
        user: sanitizeUserForClient(user),
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Verify error:', error)

    return NextResponse.json(
      { error: 'Verification failed', message },
      { status: 500 }
    )
  }
}

/**
 * Handle logout
 */
async function handleLogout(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In practice, you'd invalidate the token on the client side
    // Server can maintain a token blacklist if needed
    return NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
