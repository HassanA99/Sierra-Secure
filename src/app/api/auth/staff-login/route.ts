import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import crypto from 'crypto'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

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

    // Validate inputs
    if (!staffId || !password) {
      return NextResponse.json(
        { error: 'Staff ID and password required' },
        { status: 400 }
      )
    }

    // TODO: In production, verify against Active Directory or LDAP
    // For development, accept any valid staffId with password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find staff user by Privy ID (in production, staffId would be from auth system)
    let user = await prisma.user.findFirst({
      where: {
        privyId: staffId,
      },
    })

    if (!user) {
      // Create staff account if it doesn't exist (in production, this would be admin-provisioned)
      // For now, allow creation with proper role detection
      const role = detectStaffRole(staffId)

      if (!role) {
        return NextResponse.json(
          { error: 'Invalid staff ID' },
          { status: 401 }
        )
      }

      const walletAddress = `embedded_${crypto.randomBytes(16).toString('hex')}`
      const [firstName, lastName] = staffId.split('-')[0].split('_')

      user = await prisma.user.create({
        data: {
          privyId: staffId,
          walletAddress,
          firstName: firstName || 'Staff',
          lastName: lastName || 'Member',
          isVerified: true,
          role, // VERIFIER or MAKER
        },
      })
    }

    // Verify user has a staff role
    if (user.role === 'CITIZEN') {
      return NextResponse.json(
        { error: 'Citizen accounts cannot access staff portal' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        staffId,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role, // VERIFIER or MAKER
          staffId,
        },
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Staff login error:', error)

    return NextResponse.json(
      { error: 'Login failed', message },
      { status: 500 }
    )
  }
}

/**
 * Detect staff role from staff ID
 * In production, this would come from Active Directory
 */
function detectStaffRole(staffId: string): 'VERIFIER' | 'MAKER' | null {
  // Example: "VER-123456" = Verifier, "MAK-123456" = Maker
  if (staffId.startsWith('VER-')) return 'VERIFIER'
  if (staffId.startsWith('MAK-')) return 'MAKER'
  return null
}
