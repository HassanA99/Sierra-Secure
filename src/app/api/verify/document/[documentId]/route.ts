import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { handleApiError } from '@/utils/error-handler'
import { successResponse, errorResponse } from '@/utils/api-response'
import { validateDocumentId, validationErrorResponse } from '@/utils/validation'

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

    // Validate document ID
    if (!validateDocumentId(documentId)) {
      return validationErrorResponse(['Invalid document ID format'])
    }

    const verifierId = request.headers.get('x-user-id')

    // Find document and log verification atomically
    const result = await prisma.$transaction(async (tx) => {
      // Find document by ID
      const document = await tx.document.findFirst({
        where: {
          id: documentId,
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
              email: true,
            },
          },
          forensicReport: {
            select: {
              overallScore: true,
              recommendedAction: true,
              tamperingDetected: true,
            },
          },
        },
      })

      if (!document) {
        return null
      }

      // Log the verification lookup
      await tx.auditLog.create({
        data: {
          userId: verifierId,
          documentId: document.id,
          action: 'VERIFIED_BY_VERIFIER',
          metadata: {
            verifierId,
            timestamp: new Date().toISOString(),
          },
        },
      })

      return document
    })

    if (!result) {
      return errorResponse('Document not found or not verified', undefined, 404)
    }

    return successResponse({
      id: result.id,
      documentNumber: result.id.substring(0, 12).toUpperCase(),
      type: result.type,
      title: result.title,
      holder: {
        name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim(),
        phoneNumber: result.user.phoneNumber || 'Not on file',
        email: result.user.email || 'Not on file',
      },
      isValid: result.status === 'VERIFIED',
      status: result.status,
      lastVerifiedAt: result.updatedAt,
      blockchainId: result.attestationId || result.nftMintAddress,
      forensic: result.forensicReport
        ? {
            overallScore: result.forensicReport.overallScore,
            recommendedAction: result.forensicReport.recommendedAction,
            tamperingDetected: result.forensicReport.tamperingDetected,
          }
        : null,
      details: {
        issuedAt: result.issuedAt,
        expiresAt: result.expiresAt,
        description: result.description,
      },
    })
  } catch (error) {
    return handleApiError(error, 'VerifyDocumentById')
  }
}
