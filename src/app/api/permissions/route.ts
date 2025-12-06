import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { PermissionRepository } from '@/repositories/implementations/permission.repository'
import { handleApiError } from '@/utils/error-handler'
import { successResponse, errorResponse, createdResponse } from '@/utils/api-response'
import { validateDocumentId, validatePermissionType, validateWalletAddress, validationErrorResponse } from '@/utils/validation'
import { sanitizeString } from '@/utils/validation'

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

    if (document.userId !== userId) {
      return errorResponse('Access denied', undefined, 403)
    }

    // Get all permissions
    const permissions = await permissionRepo.findByDocumentId(documentId, true)

    return successResponse(
      permissions.map((p) => ({
        id: p.id,
        documentId: p.documentId,
        grantedTo: p.grantedTo,
        accessType: p.accessType,
        expiresAt: p.expiresAt,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
      'Permissions retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error, 'GetPermissions')
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
    const { documentId, grantedTo, accessType, expiresIn } = body

    // Validate inputs
    const errors: string[] = []
    if (!documentId) {
      errors.push('documentId is required')
    } else if (!validateDocumentId(documentId)) {
      errors.push('Invalid documentId format')
    }

    if (!grantedTo) {
      errors.push('grantedTo (wallet address) is required')
    } else if (!validateWalletAddress(grantedTo)) {
      errors.push('Invalid wallet address format')
    }

    if (!accessType) {
      errors.push('accessType is required')
    } else if (!validatePermissionType(accessType)) {
      errors.push('Invalid permission type. Must be READ, SHARE, or VERIFY')
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // Sanitize inputs
    const sanitizedGrantedTo = sanitizeString(grantedTo)

    // Verify user owns document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true },
    })

    if (!document) {
      return errorResponse('Document not found', undefined, 404)
    }

    if (document.userId !== userId) {
      return errorResponse('Only document owner can share', undefined, 403)
    }

    // Calculate expiration if provided
    let expiresAt: Date | null = null
    if (expiresIn) {
      const now = new Date()
      const expiresInMs = typeof expiresIn === 'number' ? expiresIn : parseInt(expiresIn as string)
      if (isNaN(expiresInMs) || expiresInMs <= 0) {
        return validationErrorResponse(['expiresIn must be a positive number'])
      }
      expiresAt = new Date(now.getTime() + expiresInMs)
    }

    // Create permission atomically with audit log
    const permission = await prisma.$transaction(async (tx) => {
      // Create permission
      const perm = await permissionRepo.create({
        userId,
        documentId,
        grantedTo: sanitizedGrantedTo,
        accessType: accessType as any,
        expiresAt,
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          documentId,
          action: 'SHARE_DOCUMENT',
          metadata: {
            grantedTo: sanitizedGrantedTo,
            accessType,
            expiresAt: expiresAt?.toISOString(),
          },
        },
      })

      return perm
    })

    return createdResponse(
      {
        id: permission.id,
        documentId: permission.documentId,
        grantedTo: permission.grantedTo,
        accessType: permission.accessType,
        expiresAt: permission.expiresAt,
        isActive: permission.isActive,
        createdAt: permission.createdAt,
      },
      'Document shared successfully'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('already exists') || message.includes('Unique constraint')) {
      return errorResponse('Permission already exists for this user and document', undefined, 409)
    }

    return handleApiError(error, 'ShareDocument')
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
    if (permission.document.userId !== userId) {
      return errorResponse('Only document owner can revoke', undefined, 403)
    }

    // Revoke permission atomically with audit log
    await prisma.$transaction(async (tx) => {
      // Revoke permission
      await permissionRepo.revoke(permissionId)

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          documentId: permission.documentId,
          action: 'REVOKE_PERMISSION',
          metadata: {
            permissionId,
            grantedTo: permission.grantedTo,
          },
        },
      })
    })

    return successResponse(null, 'Permission revoked successfully')
  } catch (error) {
    return handleApiError(error, 'RevokePermission')
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
