import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import crypto from 'crypto'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

/**
 * POST /api/auth/citizen-login
 * 
 * Citizen login via phone number + PIN
 * NO VISIBLE CRYPTO - completely hidden
 * 
 * Embedded Privy wallet is created automatically and transparently
 * User never sees "Connect Wallet," "Phantom," or "Solana"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, pin } = body

    // Validate inputs
    if (!phoneNumber || !pin) {
      return NextResponse.json(
        { error: 'Phone number and PIN required' },
        { status: 400 }
      )
    }

    // Validate phone format (basic validation)
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    if (pin.length < 4 || isNaN(Number(pin))) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 400 }
      )
    }

    // TODO: In production, verify PIN against Privy's authentication backend
    // For now, we'll accept any PIN >= 4 digits as a placeholder
    // This should be replaced with actual Privy phone verification

    // Find or create user with phone number
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
    })

    if (!user) {
      // Create new user with auto-generated embedded wallet via Privy
      // In production, Privy SDK would handle this during phone verification
      const privyId = `privy_${crypto.randomBytes(16).toString('hex')}`
      const walletAddress = `embedded_${crypto.randomBytes(16).toString('hex')}`

      user = await prisma.user.create({
        data: {
          privyId,
          walletAddress,
          phoneNumber: cleanPhone,
          phoneVerified: true,
          firstName: '', // Will be filled during onboarding
          lastName: '',
          role: 'CITIZEN', // Citizens ALWAYS get CITIZEN role
        },
      })
    }

    // Check if phone is verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        { error: 'Phone not verified' },
        { status: 403 }
      )
    }

    // Generate JWT token for this session
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role, // Always 'CITIZEN' for citizen login
        },
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Citizen login error:', error)

    return NextResponse.json(
      { error: 'Login failed', message },
      { status: 500 }
    )
  }
}
