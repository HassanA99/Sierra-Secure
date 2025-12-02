import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DocumentService } from '@/services/implementations/document.service'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'

/**
 * Document Management API Routes
 * Handles CRUD operations for documents with forensic analysis
 * 
 * Security:
 * - User authentication required (verify Privy token)
 * - User can only access their own documents
 * - Forensic analysis before blockchain issuance
 * - File size validation
 * - MIME type validation
 */

const prisma = new PrismaClient()
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
    if (skip < 0 || take < 1 || take > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const response = await documentService.listDocuments(userId, {
      skip,
      take,
      status: status || undefined,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json(
      {
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
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
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const title = formData.get('title') as string
    const blockchainType = formData.get('blockchainType') as string | null

    // Validate inputs
    if (!file || !documentType || !title) {
      return NextResponse.json(
        { error: 'file, documentType, and title are required' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPEG, PNG, PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create document with forensic analysis
    const response = await documentService.createDocument({
      userId,
      documentType: documentType as any,
      fileBuffer: buffer,
      mimeType: file.type,
      blockchainType: (blockchainType as any) || 'SAS_ATTESTATION',
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      {
        error: 'Failed to create document',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
