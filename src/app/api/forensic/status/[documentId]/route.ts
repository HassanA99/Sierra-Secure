import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/forensic/status/[documentId]
 * 
 * Get forensic analysis status for a specific document
 * Returns: PENDING, ANALYZING, COMPLETED with score
 * 
 * Trust Score Decision Rules:
 * - 85+: Auto-Approved ✓ (write to blockchain immediately)
 * - 70-84: Send to Human Review ⏳ (flag in maker dashboard)
 * - <70: Auto-Rejected ✗ (user sees "upload clearer copy")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document with forensic analysis
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        forensicReport: true,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify user owns this document
    if (document.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Return forensic status
    if (!document.forensicReport) {
      return NextResponse.json({
        documentId,
        status: 'PENDING',
        message: 'Forensic analysis not started',
      })
    }

    const report = document.forensicReport
    const overallScore = report.overallScore

    // Determine decision based on score
    let decision = 'REVIEWING'
    let userMessage = ''
    let blockchainStatus = 'PENDING'

    if (overallScore >= 85) {
      decision = 'APPROVED'
      userMessage = '✓ Document verified and approved. It will be written to the blockchain.'
      blockchainStatus = 'APPROVED'
    } else if (overallScore >= 70) {
      decision = 'UNDER_REVIEW'
      userMessage = '⏳ Document is under review by government staff. This usually takes 1-2 hours.'
      blockchainStatus = 'PENDING_HUMAN_REVIEW'
    } else {
      decision = 'REJECTED'
      userMessage = '✗ Document quality is too low. Please upload a clearer copy (better lighting, less glare, fully visible).'
      blockchainStatus = 'REJECTED'
    }

    return NextResponse.json({
      documentId,
      status: report.status,
      decision,
      overallScore,
      userMessage,
      blockchainStatus,
      
      // Detailed breakdown for staff view
      breakdown: {
        integrityScore: report.integrityScore,
        authenticityScore: report.authenticityScore,
        metadataScore: report.metadataScore,
        ocrScore: report.ocrScore,
        biometricScore: report.biometricScore,
        securityScore: report.securityScore,
      },
      
      // Tamper detection
      tamperingDetected: report.tamperingDetected,
      tamperRisk: report.tamperRisk,
      
      // OCR
      extractedText: report.extractedText,
      ocrConfidence: report.ocrConfidence,
      
      // Biometric
      hasFaceImage: report.hasFaceImage,
      faceConfidence: report.faceConfidence,
      
      // Timestamp
      analyzedAt: report.timestamp,
    })
  } catch (error) {
    console.error('Error getting forensic status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get forensic status',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
