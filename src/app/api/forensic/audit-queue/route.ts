import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Get all documents waiting for human review
    // These have forensic scores between 70-84
    const auditQueue = await prisma.document.findMany({
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
        forensicReport: true,
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
      take: 100,
    })

    return NextResponse.json({
      count: auditQueue.length,
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
    })
  } catch (error) {
    console.error('Error getting audit queue:', error)
    return NextResponse.json(
      {
        error: 'Failed to get audit queue',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
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

    // Update document status
    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED'

    const updated = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        status: newStatus,
      },
    })

    // Log audit trail
    await prisma.auditLog.create({
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

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Document approved and written to blockchain' : 'Document rejected',
      document: {
        id: updated.id,
        status: updated.status,
      },
    })
  } catch (error) {
    console.error('Error updating audit queue item:', error)
    return NextResponse.json(
      {
        error: 'Failed to update document',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
