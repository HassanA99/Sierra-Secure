import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DocumentService } from '@/services/implementations/document.service'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'

const prisma = new PrismaClient()
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
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const document = await documentService.getDocument(documentId, userId)

    return NextResponse.json(document)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.error('Error getting document:', error)
    return NextResponse.json(
      { error: 'Failed to get document', message },
      { status: 500 }
    )
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
    const body = await request.json()

    const document = await documentService.updateDocument({
      documentId,
      userId,
      status: body.status,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    })

    return NextResponse.json(document)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document', message },
      { status: 500 }
    )
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
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    await documentService.deleteDocument(documentId, userId)

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document', message },
      { status: 500 }
    )
  }
}
