import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/implementations/auth.service'
import { generateToken } from '@/lib/auth/jwt'

/**
 * POST /api/auth/staff-login
 * 
 * Government staff login (Verifiers and Makers)
 * 
 * Staff must be provisioned with proper roles by admin
 * - VERIFIER: Can view and validate documents
 * - MAKER: Can issue new digital documents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staffId, password } = body

    const result = await authService.loginStaff(staffId, password)

    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email || '',
      privyUserId: staffId,
      role: result.user.role || '',
    })

    const response = NextResponse.json(
      {
        user: {
          ...result.user,
          staffId // Return staffId for consistency with frontend expectations
        },
        token,
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

    response.cookies.set('nddv_user_role', result.user.role || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Staff login error:', error)

    return NextResponse.json(
      { error: 'Login failed', message },
      { status: 500 }
    )
  }
}

