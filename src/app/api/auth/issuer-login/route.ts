import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { generateToken } from '@/lib/auth/jwt'
import { sanitizeUserForClient } from '@/lib/serializers/user'
import crypto from 'crypto'

/**
 * ISSUER LOGIN - Government Officials (Ministry of Lands)
 * 
 * POST /api/auth/issuer-login
 * Body: { email: string, password: string }
 * 
 * Demo Credentials:
 * - Email: issuer@lands.gov
 * - Password: IssuerPass123!
 */

const ISSUER_DEMO = {
  email: 'issuer@lands.gov',
  password: 'IssuerPass123!',
  firstName: 'James',
  lastName: 'Mwangi',
  organization: 'Ministry of Lands',
  department: 'Digital Land Registry',
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
    if (email !== ISSUER_DEMO.email || password !== ISSUER_DEMO.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find or create issuer user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: ISSUER_DEMO.email,
          firstName: ISSUER_DEMO.firstName,
          lastName: ISSUER_DEMO.lastName,
          role: 'ISSUER',
          status: 'ACTIVE',
          organization: ISSUER_DEMO.organization,
          department: ISSUER_DEMO.department,
        },
      })

      console.log(`[✅ Issuer Created] ${email}`)
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
    console.error('[❌ Issuer Login Error]', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
