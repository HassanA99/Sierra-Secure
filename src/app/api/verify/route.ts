import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { handleApiError } from '@/utils/error-handler'
import { successResponse, errorResponse, paginatedResponse } from '@/utils/api-response'
import { validateDocumentId, validatePagination, validationErrorResponse } from '@/utils/validation'

const forensicService = new AIDocumentForensicService()

/**
 * GET /api/verify/document
 * Verify document authenticity and get forensic report
 */
export async function GET(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/document')) {
    return handleVerifyDocument(request)
  }
  if (request.nextUrl.pathname.includes('/audit-logs')) {
    return handleGetAuditLogs(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * POST /api/verify/batch
 * Batch verify multiple documents
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/batch')) {
    return handleBatchVerify(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * Verify document authenticity
 */
async function handleVerifyDocument(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = request.nextUrl
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId query parameter required' },
        { status: 400 }
      )
    }

    // Validate document ID
    if (!validateDocumentId(documentId)) {
      return errorResponse('Invalid document ID format', undefined, 400)
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        forensicReport: true,
        permissions: userId
          ? {
              where: {
                grantedTo: userId,
                isActive: true,
              },
            }
          : false,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    if (!document) {
      return errorResponse('Document not found', undefined, 404)
    }

    // Check access: owner or has permission
    const isOwner = document.userId === userId
    const hasPermission = userId ? (document.permissions?.length ?? 0) > 0 : false

    if (!isOwner && !hasPermission && userId) {
      return errorResponse('Access denied', undefined, 403)
    }

    // Return forensic analysis if available
    const analysis = document.forensicReport

    if (!analysis) {
      return successResponse(
        {
          document: {
            id: document.id,
            title: document.title,
            type: document.type,
            status: document.status,
            createdAt: document.createdAt,
          },
          forensic: null,
        },
        'No forensic analysis available yet'
      )
    }

    return successResponse({
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        status: document.status,
        createdAt: document.createdAt,
      },
      forensic: {
        id: analysis.id,
        overallScore: analysis.overallScore,
        integrityScore: analysis.integrityScore,
        authenticityScore: analysis.authenticityScore,
        metadataScore: analysis.metadataScore,
        ocrScore: analysis.ocrScore,
        biometricScore: analysis.biometricScore,
        securityScore: analysis.securityScore,
        tamperingDetected: analysis.tamperingDetected,
        tamperRisk: analysis.tamperRisk,
        recommendedAction: analysis.recommendedAction,
        blockchainRecommendation: analysis.blockchainRecommendation,
        findings: analysis.findings,
        timestamp: analysis.timestamp,
      },
    })
  } catch (error) {
    return handleApiError(error, 'VerifyDocument')
  }
}

/**
 * Batch verify documents
 */
async function handleBatchVerify(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentIds } = body

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array required' },
        { status: 400 }
      )
    }

    if (documentIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 documents per batch' },
        { status: 400 }
      )
    }

    // Validate all document IDs
    const invalidIds = documentIds.filter((id: string) => !validateDocumentId(id))
    if (invalidIds.length > 0) {
      return validationErrorResponse([
        `Invalid document ID format(s): ${invalidIds.join(', ')}`,
      ])
    }

    // Get documents owned by user
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        userId: userId,
      },
      include: {
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            recommendedAction: true,
            tamperingDetected: true,
            timestamp: true,
          },
        },
      },
    })

    if (documents.length === 0) {
      return errorResponse('No accessible documents found', undefined, 404)
    }

    const results = documents.map((doc) => ({
      documentId: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      forensic: doc.forensicReport
        ? {
            id: doc.forensicReport.id,
            overallScore: doc.forensicReport.overallScore,
            recommendedAction: doc.forensicReport.recommendedAction,
            tamperingDetected: doc.forensicReport.tamperingDetected,
            timestamp: doc.forensicReport.timestamp,
          }
        : null,
      verified: !!doc.forensicReport,
    }))

    const verified = results.filter((r) => r.verified).length
    const total = results.length

    return successResponse(
      {
        summary: {
          total,
          verified,
          pending: total - verified,
        },
        results,
      },
      `Batch verification completed: ${verified}/${total} documents verified`
    )
  } catch (error) {
    return handleApiError(error, 'BatchVerify')
  }
}

/**
 * Get audit logs
 */
async function handleGetAuditLogs(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const documentId = searchParams.get('documentId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate pagination
    const paginationValidation = validatePagination(offset, limit)
    if (!paginationValidation.valid) {
      return validationErrorResponse(paginationValidation.errors)
    }

    // Build query
    const where: any = { userId }
    if (documentId) {
      if (!validateDocumentId(documentId)) {
        return validationErrorResponse(['Invalid documentId format'])
      }
      where.documentId = documentId
    }
    if (action) {
      where.action = action
    }

    // Get audit logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          document: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return paginatedResponse(
      logs.map((log) => ({
        id: log.id,
        action: log.action,
        documentId: log.documentId,
        document: log.document
          ? {
              id: log.document.id,
              title: log.document.title,
              type: log.document.type,
            }
          : null,
        metadata: log.metadata,
        timestamp: log.timestamp,
      })),
      total,
      offset,
      limit,
      'Audit logs retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error, 'GetAuditLogs')
  }
}
