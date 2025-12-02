import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/verify/document/[documentId]
 * 
 * Verifier lookup endpoint - get document verification status
 * Called by bank/police staff to verify citizen documents
 * 
 * Returns: Document details with VALID/INVALID status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId
    const userRole = request.headers.get('x-user-role')

    // Only VERIFIERs can access this
    if (userRole !== 'VERIFIER') {
      return NextResponse.json(
        { error: 'Only VERIFIER role can access this endpoint' },
        { status: 403 }
      )
    }

    // Find document by ID or document number
    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { id: documentId },
          // Could also search by document number if stored in metadata
        ],
        status: {
          in: ['VERIFIED', 'PENDING'],
        },
      },
      include: {
        user: {
          select: {
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or not verified' },
        { status: 404 }
      )
    }

    // Log the verification lookup
    await prisma.auditLog.create({
      data: {
        documentId,
        action: 'VERIFIED_BY_VERIFIER',
        metadata: {
          verifierId: request.headers.get('x-user-id'),
          timestamp: new Date(),
        },
      },
    })

    return NextResponse.json({
      id: document.id,
      documentNumber: document.id.substring(0, 12).toUpperCase(), // Use first 12 chars of ID
      type: document.type,
      holder: {
        name: `${document.user.firstName} ${document.user.lastName}`,
        phoneNumber: document.user.phoneNumber || 'Not on file',
      },
      isValid: document.status === 'VERIFIED',
      status: document.status,
      lastVerifiedAt: document.updatedAt,
      blocklinkId: document.attestationId || document.nftMintAddress,
      details: {
        issuedAt: document.issuedAt,
        expiresAt: document.expiresAt,
        description: document.description,
      },
    })
  } catch (error) {
    console.error('Error verifying document:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify document',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
