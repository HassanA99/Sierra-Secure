import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/admin/staff
 * List all staff members (VERIFIER and MAKER roles)
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')

    // Only ADMIN can access staff list
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only ADMIN role can access this endpoint' },
        { status: 403 }
      )
    }

    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['VERIFIER', 'MAKER'],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      count: staff.length,
      staff: staff.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phoneNumber,
        role: s.role,
        status: s.isVerified ? 'Active' : 'Inactive',
        joinedAt: s.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error getting staff list:', error)
    return NextResponse.json(
      {
        error: 'Failed to get staff list',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/staff
 * Create new staff member (provision)
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only ADMIN role can create staff' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, phoneNumber, role } = body

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, and role required' },
        { status: 400 }
      )
    }

    if (!['VERIFIER', 'MAKER'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be VERIFIER or MAKER' },
        { status: 400 }
      )
    }

    const staffMember = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || null,
        role,
        isVerified: true,
        walletAddress: `staff_${Date.now()}`,
        privyId: `staff_${email}`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        staff: {
          id: staffMember.id,
          name: `${staffMember.firstName} ${staffMember.lastName}`,
          email: staffMember.email,
          role: staffMember.role,
          status: 'Active',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error creating staff member:', error)

    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email or phone already in use' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create staff member', message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/staff/[staffId]
 * Update staff member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only ADMIN role can update staff' },
        { status: 403 }
      )
    }

    const { staffId } = params
    const body = await request.json()

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.role && { role: body.role }),
        ...(typeof body.isVerified === 'boolean' && { isVerified: body.isVerified }),
      },
    })

    return NextResponse.json({
      success: true,
      staff: {
        id: updated.id,
        name: `${updated.firstName} ${updated.lastName}`,
        role: updated.role,
        status: updated.isVerified ? 'Active' : 'Inactive',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error updating staff member:', error)

    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to update staff member', message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/staff/[staffId]
 * Deactivate staff member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only ADMIN role can delete staff' },
        { status: 403 }
      )
    }

    const { staffId } = params

    await prisma.user.update({
      where: { id: staffId },
      data: { isVerified: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff member deactivated',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error deleting staff member:', error)

    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to delete staff member', message },
      { status: 500 }
    )
  }
}
