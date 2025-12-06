import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { DocumentService } from '@/services/implementations/document.service'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { handleApiError } from '@/utils/error-handler'
import { successResponse, errorResponse, noContentResponse } from '@/utils/api-response'
import { validateDocumentId, validationErrorResponse } from '@/utils/validation'

const documentService = new DocumentService(prisma, new AIDocumentForensicService())

/**
 * GET /api/documents/[documentId]
 * Get specific document with forensic report
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = params
    
    if (!documentId) {
      return validationErrorResponse(['Document ID is required'])
    }

    if (!validateDocumentId(documentId)) {
      return validationErrorResponse(['Invalid document ID format'])
    }

    const document = await documentService.getDocument(documentId, userId)

    return successResponse(document, 'Document retrieved successfully')
  } catch (error) {
    return handleApiError(error, 'GetDocument')
  }
}

/**
 * PUT /api/documents/[documentId]
 * Update document metadata (not file content)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = params
    
    if (!documentId || !validateDocumentId(documentId)) {
      return validationErrorResponse(['Invalid document ID format'])
    }

    const body = await request.json()

    // Validate status if provided
    if (body.status && !['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'].includes(body.status)) {
      return validationErrorResponse(['Invalid status value'])
    }

    // Validate expiresAt if provided
    if (body.expiresAt) {
      const expiresAt = new Date(body.expiresAt)
      if (isNaN(expiresAt.getTime())) {
        return validationErrorResponse(['Invalid expiresAt date format'])
      }
    }

    const document = await documentService.updateDocument({
      documentId,
      userId,
      status: body.status,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    })

    return successResponse(document, 'Document updated successfully')
  } catch (error) {
    return handleApiError(error, 'UpdateDocument')
  }
}

/**
 * DELETE /api/documents/[documentId]
 * Delete document permanently
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = params
    
    if (!documentId || !validateDocumentId(documentId)) {
      return validationErrorResponse(['Invalid document ID format'])
    }

    await documentService.deleteDocument(documentId, userId)

    return noContentResponse()
  } catch (error) {
    return handleApiError(error, 'DeleteDocument')
  }
}
