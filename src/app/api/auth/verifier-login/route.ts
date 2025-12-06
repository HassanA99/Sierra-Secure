import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { generateToken } from '@/lib/auth/jwt'
import { sanitizeUserForClient } from '@/lib/serializers/user'

/**
 * VERIFIER LOGIN - Document Verifiers (NCRA)
 * 
 * POST /api/auth/verifier-login
 * Body: { email: string, password: string }
 * 
 * Demo Credentials:
 * - Email: verifier@ncra.gov
 * - Password: VerifierPass123!
 */

const VERIFIER_DEMO = {
  email: 'verifier@ncra.gov',
  password: 'VerifierPass123!',
  firstName: 'Alice',
  lastName: 'Kipchoge',
  organization: 'National Civil Registry Authority',
  department: 'Document Verification',
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Demo authentication
    if (email !== VERIFIER_DEMO.email || password !== VERIFIER_DEMO.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find or create verifier user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: VERIFIER_DEMO.email,
          firstName: VERIFIER_DEMO.firstName,
          lastName: VERIFIER_DEMO.lastName,
          role: 'VERIFIER',
          status: 'ACTIVE',
          organization: VERIFIER_DEMO.organization,
          department: VERIFIER_DEMO.department,
        },
      })

      console.log(`[✅ Verifier Created] ${email}`)
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json(
      {
        token,
        user: sanitizeUserForClient({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
        }),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[❌ Verifier Login Error]', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
