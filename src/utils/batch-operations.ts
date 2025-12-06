/**
 * Batch operations utility
 * Handles bulk operations with proper error handling and transaction management
 */

import { prisma } from '@/lib/prisma/client'

export interface BatchOperationResult<T> {
  success: boolean
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    item: T
    success: boolean
    error?: string
  }>
}

/**
 * Process batch operations with transaction support
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number
    useTransaction?: boolean
    continueOnError?: boolean
  } = {}
): Promise<BatchOperationResult<T>> {
  const {
    batchSize = 10,
    useTransaction = false,
    continueOnError = true,
  } = options

  const results: BatchOperationResult<T>['results'] = []
  let succeeded = 0
  let failed = 0

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    if (useTransaction) {
      // Process batch in transaction
      try {
        await prisma.$transaction(async (tx) => {
          for (const item of batch) {
            try {
              await processor(item)
              results.push({ item, success: true })
              succeeded++
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              results.push({ item, success: false, error: errorMessage })
              failed++

              if (!continueOnError) {
                throw error
              }
            }
          }
        })
      } catch (error) {
        // Transaction failed - mark all items in batch as failed
        for (const item of batch) {
          const existing = results.find((r) => r.item === item)
          if (!existing) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            results.push({ item, success: false, error: errorMessage })
            failed++
          }
        }
      }
    } else {
      // Process batch without transaction
      for (const item of batch) {
        try {
          await processor(item)
          results.push({ item, success: true })
          succeeded++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.push({ item, success: false, error: errorMessage })
          failed++

          if (!continueOnError) {
            break
          }
        }
      }
    }
  }

  return {
    success: failed === 0,
    processed: items.length,
    succeeded,
    failed,
    results,
  }
}

/**
 * Batch approve/reject documents
 */
export async function batchApproveDocuments(
  documentIds: string[],
  action: 'APPROVE' | 'REJECT',
  userId: string,
  comments?: string
): Promise<BatchOperationResult<string>> {
  return processBatch(
    documentIds,
    async (documentId) => {
      await prisma.$transaction(async (tx) => {
        // Update document status
        await tx.document.update({
          where: { id: documentId },
          data: {
            status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            documentId,
            action: action === 'APPROVE' ? 'VERIFIED_BY_MAKER' : 'REJECTED_BY_MAKER',
            metadata: {
              comments,
              timestamp: new Date().toISOString(),
            },
          },
        })
      })
    },
    {
      batchSize: 5,
      useTransaction: true,
      continueOnError: true,
    }
  )
}

/**
 * Batch delete permissions
 */
export async function batchDeletePermissions(
  permissionIds: string[],
  userId: string
): Promise<BatchOperationResult<string>> {
  return processBatch(
    permissionIds,
    async (permissionId) => {
      await prisma.$transaction(async (tx) => {
        // Get permission to verify ownership
        const permission = await tx.permission.findUnique({
          where: { id: permissionId },
          include: { document: true },
        })

        if (!permission) {
          throw new Error('Permission not found')
        }

        if (permission.document.userId !== userId) {
          throw new Error('Unauthorized: User does not own this document')
        }

        // Delete permission
        await tx.permission.delete({
          where: { id: permissionId },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            documentId: permission.documentId,
            action: 'REVOKE_PERMISSION',
            metadata: {
              permissionId,
            },
          },
        })
      })
    },
    {
      batchSize: 10,
      useTransaction: true,
      continueOnError: true,
    }
  )
}

