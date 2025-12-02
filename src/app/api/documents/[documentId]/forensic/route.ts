/**
 * Forensic Document Analysis API Endpoint
 * 
 * POST /api/documents/[documentId]/forensic
 * POST /api/forensic/analyze (for new documents)
 * GET  /api/documents/[documentId]/forensic (retrieve report)
 */

import { NextRequest, NextResponse } from 'next/server'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { ForensicAnalysisInput } from '@/types/forensic.types'

// Initialize forensic service
const forensicService = new AIDocumentForensicService()

/**
 * POST /api/documents/[documentId]/forensic
 * Run forensic analysis on an existing document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId
    const body = await request.json()

    // Validate request
    if (!documentId || !body.fileBuffer) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, fileBuffer' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer if needed
    const fileBuffer = Buffer.from(body.fileBuffer, body.encoding || 'base64')

    const analysisInput: ForensicAnalysisInput = {
      documentId,
      fileBuffer,
      mimeType: body.mimeType || 'image/jpeg',
      documentType: body.documentType || 'NATIONAL_ID',
      expectedMetadata: body.expectedMetadata,
      performBiometricAnalysis: body.performBiometricAnalysis ?? true,
      performMRZAnalysis: body.performMRZAnalysis ?? true,
      strictMode: body.strictMode ?? false,
    }

    // Run analysis
    const report = await forensicService.analyzeDocument(analysisInput)

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('[Forensic API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/[documentId]/forensic
 * Retrieve forensic report for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId

    // In production: fetch from database using Prisma
    // const report = await prisma.forensicAnalysis.findUnique({
    //   where: { documentId }
    // })

    // Mock response
    return NextResponse.json({
      success: true,
      documentId,
      message: 'Implement database retrieval in production',
    })
  } catch (error) {
    console.error('[Forensic API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve report' },
      { status: 500 }
    )
  }
}
