import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PermissionRepository } from '@/repositories/implementations/permission.repository'
import { PermissionType } from '@prisma/client'

const prisma = new PrismaClient()
const permissionRepo = new PermissionRepository(prisma)

/**
 * POST /api/permissions/share
 * Share document with another user
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/share')) {
    return handleShare(request)
  }
  if (request.nextUrl.pathname.includes('/revoke')) {
    return handleRevoke(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * GET /api/permissions
 * List document permissions
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId query parameter required' },
        { status: 400 }
      )
    }

    // Verify user owns document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all permissions
    const permissions = await prisma.permission.findMany({
      where: { documentId },
      select: {
        id: true,
        recipientId: true,
        type: true,
        expiresAt: true,
        createdAt: true,
        recipient: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error getting permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/permissions
 * Revoke document permission
 */
export async function DELETE(request: NextRequest) {
  return handleRevoke(request)
}

/**
 * Handle sharing document
 */
async function handleShare(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, recipientId, type, expiresIn } = body

    if (!documentId || !recipientId || !type) {
      return NextResponse.json(
        { error: 'documentId, recipientId, and type required' },
        { status: 400 }
      )
    }

    // Validate permission type
    const validTypes = ['READ', 'SHARE', 'VERIFY']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify user owns document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only document owner can share' },
        { status: 403 }
      )
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (recipientId === userId) {
      return NextResponse.json(
        { error: 'Cannot share with yourself' },
        { status: 400 }
      )
    }

    // Calculate expiration if provided
    let expiresAt: Date | null = null
    if (expiresIn) {
      const now = new Date()
      const expiresInMs = typeof expiresIn === 'number' ? expiresIn : parseInt(expiresIn as string)
      expiresAt = new Date(now.getTime() + expiresInMs)
    }

    // Create permission
    const permission = await permissionRepo.create({
      documentId,
      recipientId,
      type: type as PermissionType,
      expiresAt,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SHARE_DOCUMENT',
        resourceType: 'document',
        resourceId: documentId,
        details: {
          recipientId,
          permissionType: type,
          expiresAt: expiresAt?.toISOString(),
        },
      },
    })

    return NextResponse.json(
      {
        permission: {
          id: permission.id,
          documentId: permission.documentId,
          recipientId: permission.recipientId,
          type: permission.type,
          expiresAt: permission.expiresAt,
          createdAt: permission.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error sharing document:', error)

    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Permission already exists for this user and document' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to share document', message },
      { status: 500 }
    )
  }
}

/**
 * Handle revoking permission
 */
async function handleRevoke(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const permissionId = searchParams.get('permissionId') || 
      (request.method === 'DELETE' ? await getPermissionIdFromBody(request) : null)

    if (!permissionId) {
      return NextResponse.json(
        { error: 'permissionId required' },
        { status: 400 }
      )
    }

    // Get permission
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: { document: true },
    })

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    // Verify user owns document
    if (permission.document.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only document owner can revoke' },
        { status: 403 }
      )
    }

    // Delete permission
    await permissionRepo.revoke(permissionId)

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'REVOKE_PERMISSION',
        resourceType: 'permission',
        resourceId: permissionId,
        details: {
          documentId: permission.documentId,
          recipientId: permission.recipientId,
        },
      },
    })

    return NextResponse.json({ success: true, message: 'Permission revoked' })
  } catch (error) {
    console.error('Error revoking permission:', error)
    return NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    )
  }
}

/**
 * Helper to extract permission ID from request body
 */
async function getPermissionIdFromBody(request: NextRequest): Promise<string | null> {
  try {
    const body = await request.json()
    return body.permissionId || null
  } catch {
    return null
  }
}
