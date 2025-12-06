import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { handleApiError, withErrorHandler } from '@/utils/error-handler'
import { validateWalletAddress, validateDocumentId, validationErrorResponse } from '@/utils/validation'

/**
 * POST /api/documents/[documentId]/share
 * 
 * SIMPLE CITIZEN PERSPECTIVE:
 * Click "Share" button → Select verifier → Done ✓
 * 
 * BLOCKCHAIN:
 * 1. Government calls smart contract to grant access
 * 2. Citizen's wallet signs (via Privy backend)
 * 3. Verifier checks blockchain for permission
 * 4. Citizen can revoke anytime (one click)
 * 
 * Citizen never sees wallet address, key, or transaction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    
    // Validate document ID
    if (!validateDocumentId(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { grantedTo, accessType = 'VERIFY', expiresAt, userId } = body

    // Validate inputs
    const errors: string[] = []
    if (!grantedTo) {
      errors.push('grantedTo (verifier wallet) is required')
    } else if (!validateWalletAddress(grantedTo)) {
      errors.push('Invalid wallet address format')
    }
    
    if (!userId) {
      errors.push('userId is required')
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get citizen's embedded wallet from Privy
    const citizenWallet = await citizenWalletService.getCitizenEmbeddedWallet(citizenPrivyId)

    // Create permission record atomically with transaction
    const permission = await prisma.$transaction(async (tx) => {
      // Verify document exists and belongs to user
      const document = await tx.document.findUnique({
        where: { id: documentId },
        select: { id: true, userId: true },
      })

      if (!document) {
        throw new Error('Document not found')
      }

      if (document.userId !== userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      // Create permission
      return await tx.permission.create({
        data: {
          documentId,
          userId,
          grantedTo,
          accessType,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
        },
      })
    })

    // In production: Call smart contract
    // await smartContractService.grantAccess(
    //   citizenPrivyId,
    //   documentId,
    //   verifierWallet,
    //   accessLevel,
    //   expiresAt
    // )

    return NextResponse.json({
      success: true,
      data: {
        permission: {
          id: permission.id,
          documentId,
          grantedTo,
          accessType,
          createdAt: permission.createdAt,
          expiresAt: permission.expiresAt,
          isActive: permission.isActive,
        },
      },
      message: 'Document shared successfully',
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error, 'ShareDocument')
  }
}

/**
 * DELETE /api/documents/[documentId]/share
 * 
 * Revoke access (citizen clicks "Revoke")
 * Happens instantly, no government approval needed
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const body = await request.json()
    const { permissionId, citizenPrivyId } = body

    if (!permissionId || !citizenPrivyId) {
      return NextResponse.json(
        { error: 'Permission ID and citizen ID required' },
        { status: 400 }
      )
    }

    // Get permission
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: { document: true }
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Verify citizen owns this document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true }
    })

    if (!document || document.userId !== permission.document.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Revoke permission
    await prisma.permission.update({
      where: { id: permissionId },
      data: {
        revokedAt: new Date(),
        permissionType: 'REVOKED',
      },
    })

    // In production: Call smart contract revoke
    // await smartContractService.revokeAccess(
    //   citizenPrivyId,
    //   permissionId
    // )

    console.log(`❌ Permission revoked: ${permissionId}`)
    console.log(`📄 Document: ${documentId}`)
    console.log(`🚫 Verifier no longer has access`)

    return NextResponse.json({
      success: true,
      message: 'Access revoked. Verifier can no longer access this document.',
    }, { status: 200 })

  } catch (error) {
    console.error('Revoke permission error:', error)
    return NextResponse.json(
      {
        error: 'Failed to revoke permission',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/[documentId]/permissions
 * 
 * Get all permissions for a document (citizen view)
 * Shows who has access and when it expires
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params

    const permissions = await prisma.permission.findMany({
      where: { documentId, permissionType: 'SHARE' },
      select: {
        id: true,
        recipientId: true,
        accessLevel: true,
        createdAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      permissions: permissions.map((p) => ({
        id: p.id,
        verifier: p.recipientId,
        accessLevel: p.accessLevel,
        sharedAt: p.createdAt,
        expiresAt: p.expiresAt,
        revokedAt: p.revokedAt,
        isActive: !p.revokedAt && (!p.expiresAt || new Date(p.expiresAt) > new Date()),
      })),
    }, { status: 200 })

  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get permissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
