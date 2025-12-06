import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { DocumentService } from '@/services/implementations/document.service'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { handleApiError } from '@/utils/error-handler'
import { validatePagination, validateFileUpload, validateDocumentType, validationErrorResponse } from '@/utils/validation'
import { withTimeout } from '@/utils/error-handler'

const documentService = new DocumentService(prisma, new AIDocumentForensicService())

/**
 * GET /api/documents
 * List user's documents with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from Privy auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    // In production: verify token with Privy
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in request' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '20')
    const status = searchParams.get('status')

    // Validate pagination parameters
    const paginationValidation = validatePagination(skip, take)
    if (!paginationValidation.valid) {
      return validationErrorResponse(paginationValidation.errors)
    }

    const response = await documentService.listDocuments(userId, {
      skip,
      take,
      status: status || undefined,
    })

    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'ListDocuments')
  }
}

/**
 * POST /api/documents
 * Create new document with forensic analysis
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('documentType') as string | null
    const title = formData.get('title') as string | null
    const blockchainType = formData.get('blockchainType') as string | null

    // Validate inputs
    const errors: string[] = []
    if (!file) {
      errors.push('file is required')
    } else {
      const fileValidation = validateFileUpload(file)
      if (!fileValidation.valid) {
        errors.push(...fileValidation.errors)
      }
    }

    if (!documentType) {
      errors.push('documentType is required')
    } else if (!validateDocumentType(documentType)) {
      errors.push('Invalid document type')
    }

    if (!title || title.trim().length === 0) {
      errors.push('title is required')
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file!.arrayBuffer())

    // Create document with forensic analysis (with timeout)
    const response = await withTimeout(
      documentService.createDocument({
        userId,
        documentType: documentType as any,
        fileBuffer: buffer,
        mimeType: file!.type,
        blockchainType: (blockchainType as any) || 'SAS_ATTESTATION',
      }),
      300000, // 5 minutes timeout for document creation (includes AI analysis)
      'Document creation timeout'
    )

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Document created successfully',
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'CreateDocument')
  }
}
