import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/forensic/audit-batch
 * 
 * Batch approve/reject documents from the audit queue
 * Maker staff submits multiple decisions at once
 * 
 * Request body:
 * {
 *   actions: [
 *     { documentId: string, action: 'APPROVE' | 'REJECT', comments?: string }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userRole !== 'MAKER') {
      return NextResponse.json(
        { error: 'Only government staff (MAKER) can batch approve/reject documents' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { actions } = body

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'actions array required and must not be empty' },
        { status: 400 }
      )
    }

    if (actions.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 documents per batch' },
        { status: 400 }
      )
    }

    // Validate each action
    for (const action of actions) {
      if (!action.documentId || !action.action) {
        return NextResponse.json(
          { error: 'Each action requires documentId and action' },
          { status: 400 }
        )
      }
      if (!['APPROVE', 'REJECT'].includes(action.action)) {
        return NextResponse.json(
          { error: `Invalid action "${action.action}". Must be APPROVE or REJECT` },
          { status: 400 }
        )
      }
    }

    // Process batch
    const results = []
    const errors = []

    for (const action of actions) {
      try {
        const document = await prisma.document.findUnique({
          where: { id: action.documentId },
        })

        if (!document) {
          errors.push({
            documentId: action.documentId,
            error: 'Document not found',
          })
          continue
        }

        const newStatus = action.action === 'APPROVE' ? 'VERIFIED' : 'REJECTED'

        const updated = await prisma.document.update({
          where: { id: action.documentId },
          data: {
            status: newStatus,
          },
        })

        // Log audit trail
        await prisma.auditLog.create({
          data: {
            userId,
            documentId: action.documentId,
            action:
              action.action === 'APPROVE' ? 'VERIFIED_BY_MAKER' : 'REJECTED_BY_MAKER',
            metadata: {
              makerComments: action.comments || '',
              timestamp: new Date(),
            },
          },
        })

        results.push({
          documentId: action.documentId,
          status: newStatus,
          action: action.action,
        })
      } catch (err) {
        errors.push({
          documentId: action.documentId,
          error: err instanceof Error ? err.message : 'Processing failed',
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        summary: {
          total: actions.length,
          processed: results.length,
          failed: errors.length,
        },
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error batch approving/rejecting documents:', error)
    return NextResponse.json(
      {
        error: 'Failed to process batch',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
