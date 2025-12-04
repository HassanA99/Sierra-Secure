import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import crypto from 'crypto'
import { verifyOTP } from '@/lib/auth/otp-store'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

/**
 * POST /api/auth/citizen-login
 * 
 * Citizen login via email + OTP verification
 * NO VISIBLE CRYPTO - completely hidden
 * 
 * Embedded Privy wallet is created automatically and transparently
 * User never sees "Connect Wallet," "Phantom," or "Solana"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    // Validate inputs
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Verify OTP
    const otpVerification = verifyOTP(email, otp)
    if (!otpVerification.valid) {
      return NextResponse.json(
        { error: otpVerification.error || 'OTP verification failed' },
        { status: 401 }
      )
    }

    // Find or create user with email
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create new user with auto-generated embedded wallet via Privy
      // In production, Privy SDK would handle this during email verification
      const privyId = `privy_${crypto.randomBytes(16).toString('hex')}`
      const walletAddress = `embedded_${crypto.randomBytes(16).toString('hex')}`

      user = await prisma.user.create({
        data: {
          privyId,
          walletAddress,
          email,
          phoneNumber: null,
          phoneVerified: false,
          firstName: '', // Will be filled during onboarding
          lastName: '',
          role: 'CITIZEN', // Citizens ALWAYS get CITIZEN role
        },
      })
    }

    // Check if email is verified (for new users, we'll mark as verified after OTP)
    if (!user.isVerified) {
      // Mark as verified after first successful OTP
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
    }

    // Generate JWT token for this session
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
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
