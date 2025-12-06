import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { batchApproveDocuments } from '@/utils/batch-operations'
import { handleApiError } from '@/utils/error-handler'
import { successResponse, errorResponse, validationErrorResponse } from '@/utils/api-response'
import { validateDocumentId } from '@/utils/validation'

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
    const errors: string[] = []
    for (const action of actions) {
      if (!action.documentId || !action.action) {
        errors.push('Each action requires documentId and action')
        continue
      }
      if (!validateDocumentId(action.documentId)) {
        errors.push(`Invalid documentId format: ${action.documentId}`)
        continue
      }
      if (!['APPROVE', 'REJECT'].includes(action.action)) {
        errors.push(`Invalid action "${action.action}". Must be APPROVE or REJECT`)
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // Group actions by type for batch processing
    const approveActions = actions.filter((a: any) => a.action === 'APPROVE')
    const rejectActions = actions.filter((a: any) => a.action === 'REJECT')

    // Process approvals
    const approveResults = approveActions.length > 0
      ? await batchApproveDocuments(
          approveActions.map((a: any) => a.documentId),
          'APPROVE',
          userId,
          approveActions[0]?.comments
        )
      : { success: true, processed: 0, succeeded: 0, failed: 0, results: [] }

    // Process rejections
    const rejectResults = rejectActions.length > 0
      ? await batchApproveDocuments(
          rejectActions.map((a: any) => a.documentId),
          'REJECT',
          userId,
          rejectActions[0]?.comments
        )
      : { success: true, processed: 0, succeeded: 0, failed: 0, results: [] }

    const totalProcessed = approveResults.processed + rejectResults.processed
    const totalSucceeded = approveResults.succeeded + rejectResults.succeeded
    const totalFailed = approveResults.failed + rejectResults.failed

    return successResponse(
      {
        summary: {
          total: actions.length,
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
        },
        results: [
          ...approveResults.results.map((r) => ({
            documentId: r.item,
            action: 'APPROVE' as const,
            success: r.success,
            error: r.error,
          })),
          ...rejectResults.results.map((r) => ({
            documentId: r.item,
            action: 'REJECT' as const,
            success: r.success,
            error: r.error,
          })),
        ],
      },
      `Batch processed: ${totalSucceeded} succeeded, ${totalFailed} failed`
    )
  } catch (error) {
    return handleApiError(error, 'BatchAudit')
  }
}
