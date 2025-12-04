import { NextRequest, NextResponse } from 'next/server'
import { generateAndStoreOTP } from '@/lib/auth/otp-store'

/**
 * POST /api/auth/citizen-login/send-otp
 * 
 * Send OTP code via email for citizen login
 * In production, integrate with SendGrid, AWS SES, or similar email service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Generate 6-digit OTP
    const otp = generateAndStoreOTP(email)

    // Store OTP in a temporary cache (in production, use Redis)
    // For now, we'll store it in memory with expiration
    // TODO: Move to Redis or database with TTL in production
    const otpKey = `otp:${email}`
    const otpData = {
      code: otp,
      timestamp: Date.now(),
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    }

    // In a real app, you would:
    // 1. Store in Redis: await redis.setex(otpKey, 600, JSON.stringify(otpData))
    // 2. Send email via SendGrid/AWS SES
    
    // For development/testing, log to console
    console.log(`[DEV] OTP Code for ${email}: ${otp}`)
    console.log(`[DEV] OTP expires in 10 minutes`)

    // TODO: Uncomment in production with real email service
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{
    //       to: [{ email }],
    //     }],
    //     from: { email: 'noreply@nddv.gov' },
    //     subject: 'Your NDDV Login Code',
    //     html: `
    //       <h1>Your NDDV Login Code</h1>
    //       <p>Your 6-digit verification code is:</p>
    //       <h2 style="font-size: 32px; letter-spacing: 4px;">${otp}</h2>
    //       <p>This code expires in 10 minutes.</p>
    //       <p>If you didn't request this code, please ignore this email.</p>
    //     `,
    //   }),
    // })
    // if (!response.ok) throw new Error('Failed to send email')

    return NextResponse.json(
      {
        success: true,
        message: `OTP sent to ${email}`,
        // In development only, return the OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Send OTP error:', error)

    return NextResponse.json(
      { error: 'Failed to send OTP', message },
      { status: 500 }
    )
  }
}
