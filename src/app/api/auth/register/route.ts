import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { generateToken } from '@/lib/auth/jwt'
import sanitizeUserForClient from '@/lib/serializers/user'

/**
 * POST /api/auth/register
 * Body: { privyUserId?, email, firstName, lastName, phone, nin }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { privyUserId, email, firstName, lastName, phone, nin } = body

    if (!email || !firstName || !lastName || !nin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upsert user by privyUserId or email
    const where = privyUserId ? { privyId: privyUserId } : { email }

    const user = await prisma.user.upsert({
      where,
      update: {
        email,
        firstName,
        lastName,
        phone,
        nin,
        status: 'ACTIVE',
      },
      create: {
        email,
        firstName,
        lastName,
        phone,
        nin,
        privyId: privyUserId || undefined,
        role: 'CITIZEN',
        status: 'ACTIVE',
      },
    })

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({ token, user: sanitizeUserForClient(user) }, { status: 201 })
    // Set httpOnly cookie for dev convenience (short expiry)
    res.cookies.set('nddv_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return res
  } catch (error) {
    console.error('[Register Error]', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
