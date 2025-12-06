import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { handleApiError } from '@/utils/error-handler'
import { validatePagination, validationErrorResponse } from '@/utils/validation'

/**
 * GET /api/forensic/audit-queue
 * 
 * Get all documents waiting for human review
 * These are documents with forensic scores between 70-84
 * 
 * MAKER role only - documents need verification before blockchain
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only MAKERs can access audit queue
    if (userRole !== 'MAKER') {
      return NextResponse.json(
        { error: 'Only government staff (MAKER) can access audit queue' },
        { status: 403 }
      )
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '50')

    // Validate pagination
    const paginationValidation = validatePagination(skip, take)
    if (!paginationValidation.valid) {
      return validationErrorResponse(paginationValidation.errors)
    }

    // Get all documents waiting for human review
    // These have forensic scores between 70-84
    const [auditQueue, total] = await Promise.all([
      prisma.document.findMany({
        where: {
          forensicReport: {
            overallScore: {
              gte: 70,
              lte: 84,
            },
            recommendedAction: 'REVIEW',
          },
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
          forensicReport: {
            select: {
              id: true,
              overallScore: true,
              status: true,
              integrityScore: true,
              authenticityScore: true,
              metadataScore: true,
              ocrScore: true,
              biometricScore: true,
              securityScore: true,
              recommendedAction: true,
              findings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc', // Oldest first
        },
        take,
        skip,
      }),
      prisma.document.count({
        where: {
          forensicReport: {
            overallScore: {
              gte: 70,
              lte: 84,
            },
            recommendedAction: 'REVIEW',
          },
          status: 'PENDING',
        },
      }),
    ])

    return NextResponse.json({
      data: {
        queue: auditQueue.map((doc) => ({
        documentId: doc.id,
        type: doc.type,
        title: doc.title,
        uploader: {
          name: `${doc.user.firstName} ${doc.user.lastName}`,
          email: doc.user.email,
          phone: doc.user.phoneNumber,
        },
        forensic: {
          score: doc.forensicReport?.overallScore || 0,
          status: doc.forensicReport?.status,
          breakdown: {
            integrityScore: doc.forensicReport?.integrityScore || 0,
            authenticityScore: doc.forensicReport?.authenticityScore || 0,
            metadataScore: doc.forensicReport?.metadataScore || 0,
            ocrScore: doc.forensicReport?.ocrScore || 0,
            biometricScore: doc.forensicReport?.biometricScore || 0,
            securityScore: doc.forensicReport?.securityScore || 0,
          },
          concerns: doc.forensicReport?.findings || {},
        },
        uploadedAt: doc.createdAt,
      })),
      },
      meta: {
        total,
        count: auditQueue.length,
        skip,
        take,
        hasMore: skip + take < total,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GetAuditQueue')
  }
}

/**
 * POST /api/forensic/audit-queue/[documentId]/approve
 * 
 * MAKER approves a document from audit queue
 * This writes it to the blockchain
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userRole !== 'MAKER') {
      return NextResponse.json(
        { error: 'Only government staff (MAKER) can approve documents' },
        { status: 403 }
      )
    }

    const { action, comments } = body // action: 'APPROVE' | 'REJECT'

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document status and log audit trail atomically
    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED'

    const updated = await prisma.$transaction(async (tx) => {
      // Update document status
      const doc = await tx.document.update({
        where: { id: params.documentId },
        data: {
          status: newStatus,
        },
      })

      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId,
          documentId: params.documentId,
          action: action === 'APPROVE' ? 'VERIFIED_BY_MAKER' : 'REJECTED_BY_MAKER',
          metadata: {
            makerComments: comments,
            timestamp: new Date(),
          },
        },
      })

      return doc
    })

    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: updated.id,
          status: updated.status,
        },
      },
      message: action === 'APPROVE' ? 'Document approved and written to blockchain' : 'Document rejected',
    })
  } catch (error) {
    return handleApiError(error, 'UpdateAuditQueue')
  }
}
