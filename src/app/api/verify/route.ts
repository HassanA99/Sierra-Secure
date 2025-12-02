import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'

const prisma = new PrismaClient()
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

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        forensicAnalysis: true,
        permissions: {
          where: {
            recipientId: userId || undefined,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check access: owner or has permission
    const isOwner = document.ownerId === userId
    const hasPermission = userId ? document.permissions.length > 0 : false

    if (!isOwner && !hasPermission && !userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Return forensic analysis if available
    const analysis = document.forensicAnalysis?.[0]

    if (!analysis) {
      return NextResponse.json(
        {
          document: {
            id: document.id,
            fileName: document.fileName,
            status: document.status,
            createdAt: document.createdAt,
          },
          forensic: null,
          message: 'No forensic analysis available yet',
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      document: {
        id: document.id,
        fileName: document.fileName,
        status: document.status,
        createdAt: document.createdAt,
      },
      forensic: {
        analysisId: analysis.id,
        complianceScore: analysis.complianceScore,
        tamperingDetected: analysis.tamperingDetected,
        confidenceLevel: analysis.confidenceLevel,
        ocrResults: analysis.ocrResults,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        analyzedAt: analysis.analyzedAt,
      },
    })
  } catch (error) {
    console.error('Error verifying document:', error)
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    )
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

    // Get documents owned by user
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        ownerId: userId,
      },
      include: {
        forensicAnalysis: true,
      },
    })

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No accessible documents found' },
        { status: 404 }
      )
    }

    const results = documents.map((doc) => ({
      documentId: doc.id,
      fileName: doc.fileName,
      status: doc.status,
      forensic: doc.forensicAnalysis?.[0] || null,
      verified: !!doc.forensicAnalysis?.[0],
    }))

    const verified = results.filter((r) => r.verified).length
    const total = results.length

    return NextResponse.json({
      summary: {
        total,
        verified,
        pending: total - verified,
      },
      results,
    })
  } catch (error) {
    console.error('Error batch verifying:', error)
    return NextResponse.json(
      { error: 'Failed to batch verify documents' },
      { status: 500 }
    )
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
    const resourceId = searchParams.get('resourceId')
    const action = searchParams.get('action')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Build query
    const where: any = { userId }
    if (resourceId) where.resourceId = resourceId
    if (action) where.action = action

    // Get audit logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        details: log.details,
        createdAt: log.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to get audit logs' },
      { status: 500 }
    )
  }
}
