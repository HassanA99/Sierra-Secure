/**
 * Batch Forensic Analysis API Endpoint
 * 
 * POST /api/forensic/batch - Analyze multiple documents
 * GET  /api/forensic/batch/[batchId] - Get batch status
 * DELETE /api/forensic/batch/[batchId] - Cancel batch
 */

import { NextRequest, NextResponse } from 'next/server'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { BatchForensicInput } from '@/types/forensic.types'

const forensicService = new AIDocumentForensicService()

/**
 * POST /api/forensic/batch
 * Start batch forensic analysis for multiple documents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.documents || !Array.isArray(body.documents)) {
      return NextResponse.json(
        { error: 'Missing required field: documents (array)' },
        { status: 400 }
      )
    }

    // Convert documents to proper format
    const batchInput: BatchForensicInput = {
      documents: body.documents.map((doc: any) => ({
        documentId: doc.documentId,
        fileBuffer: Buffer.from(doc.fileBuffer, doc.encoding || 'base64'),
        mimeType: doc.mimeType || 'image/jpeg',
        documentType: doc.documentType || 'NATIONAL_ID',
        expectedMetadata: doc.expectedMetadata,
        performBiometricAnalysis: doc.performBiometricAnalysis ?? true,
        performMRZAnalysis: doc.performMRZAnalysis ?? true,
        strictMode: doc.strictMode ?? false,
      })),
      priorityMode: body.priorityMode || 'BALANCED',
    }

    // Start batch processing
    const batchResult = await forensicService.analyzeBatch(batchInput)

    return NextResponse.json({
      success: true,
      data: batchResult,
    })
  } catch (error) {
    console.error('[Batch Forensic API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/forensic/batch/[batchId]
 * Get batch status and partial results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const batchId = params.batchId
    const status = await forensicService.getBatchStatus(batchId)

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('[Batch Forensic API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve batch status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forensic/batch/[batchId]
 * Cancel ongoing batch analysis
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const batchId = params.batchId
    await forensicService.cancelBatch(batchId)

    return NextResponse.json({
      success: true,
      message: `Batch ${batchId} cancelled`,
    })
  } catch (error) {
    console.error('[Batch Forensic API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel batch' },
      { status: 500 }
    )
  }
}
