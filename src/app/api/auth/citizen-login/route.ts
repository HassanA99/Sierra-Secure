import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth/jwt'
import { authService } from '@/services/implementations/auth.service'

/**
 * CITIZEN LOGIN ENDPOINT - Web3.5 Privy Authentication
 * 
 * POST /api/auth/citizen-login
 * Body: { privyUserId: string, walletAddress: string }
 * 
 * Process:
 * 1. Citizen logs in with Privy wallet (embedded Solana)
 * 2. Frontend sends privyUserId to this endpoint
 * 3. Backend creates/finds citizen user record via AuthService
 * 4. Backend returns JWT token + user data
 * 5. Frontend stores token and redirects to dashboard
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { privyUserId, walletAddress, email, firstName, lastName } = body

    if (!privyUserId) {
      return NextResponse.json(
        { error: 'Missing Privy user ID' },
        { status: 400 }
      )
    }

    // Default wallet if missing (backwards compatibility or initial provision)
    // Expert Note: Ideally frontend MUST send this.
    const effectiveWallet = walletAddress || `embedded_${privyUserId.substring(0, 16).toLowerCase()}`

    // Use Centralized Auth Service
    const result = await authService.loginWithPrivy(
      privyUserId,
      effectiveWallet,
      { email, firstName, lastName }
    )

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.message || 'Login failed' },
        { status: 401 }
      )
    }

    // Sanitize user object before returning to the client to avoid
    // accidentally sending nested objects (e.g. { address }) which can
    // cause React to attempt to render objects as children.
    const userObj = result.user
    const sanitizedUser = {
      id: userObj.id,
      email: typeof userObj.email === 'string' ? userObj.email : (userObj.email?.address || ''),
      firstName: userObj.firstName || '',
      lastName: userObj.lastName || '',
      walletAddress: userObj.walletAddress || userObj.wallet?.address || null,
      role: 'CITIZEN',
    }

    // Generate JWT token
    const token = generateToken({
      userId: sanitizedUser.id,
      privyUserId: result.user.privyId,
      role: 'CITIZEN', // Enforce citizen role for this endpoint
    })

    const response = NextResponse.json(
      {
        token,
        user: sanitizedUser,
      },
      { status: 200 }
    )

    // Set cookies for middleware
    response.cookies.set('nddv_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    response.cookies.set('nddv_user_role', 'CITIZEN', {
      httpOnly: false, // Allow client-side access if needed, but mainly for middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error('[❌ Citizen Login Error]', error)
    return NextResponse.json(
      { error: 'Login failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
