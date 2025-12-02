import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { BiometricDeduplicationService } from '@/services/implementations/biometric-deduplication.service'

const prisma = new PrismaClient()
const biometricService = new BiometricDeduplicationService(prisma)

/**
 * POST /api/verify/biometric-duplicate
 * 
 * Check if someone is trying to register with a different phone number
 * but using an ID document (face) that's already linked to another account
 * 
 * This prevents:
 * - Stealing someone else's identity
 * - Creating fake duplicate accounts
 * - Bypassing KYC verification
 * 
 * Called during citizen onboarding after ID upload and forensic analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { biometricHash, userId, documentId } = body

    // Validate inputs
    if (!biometricHash || !userId) {
      return NextResponse.json(
        { error: 'biometricHash and userId are required' },
        { status: 400 }
      )
    }

    // Check if this biometric already exists in the system
    const result = await biometricService.checkForDuplicate(biometricHash)

    if (result.isDuplicate && result.existingUser?.id !== userId) {
      // REJECT - This identity is already registered
      return NextResponse.json(
        {
          isDuplicate: true,
          message: `An identity is already linked to this data. 
            If this is your document, please contact support.
            Existing account: ${result.existingUser?.phoneNumber}`,
          existingAccountPhone: result.existingUser?.phoneNumber,
        },
        { status: 409 } // Conflict
      )
    }

    // Not a duplicate - safe to proceed
    // Store biometric data for this user
    if (userId && documentId) {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          forensicReport: true,
        },
      })

      if (document?.forensicReport) {
        await biometricService.storeBiometricData(
          userId,
          {
            documentId,
            faceConfidence: document.forensicReport.faceConfidence,
            hasFaceImage: document.forensicReport.hasFaceImage,
            extractedAt: new Date(),
          },
          biometricHash
        )
      }
    }

    return NextResponse.json({
      isDuplicate: false,
      message: 'Biometric check passed. You may proceed.',
      biometricHash,
    })
  } catch (error) {
    console.error('Error checking biometric duplicate:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify biometric data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/verify/biometric-status/[userId]
 * Check if user has stored biometric data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const requestUserId = request.headers.get('x-user-id')

    // Users can only check their own biometric status
    if (userId !== requestUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const bioData = await biometricService.getBiometricData(userId)

    return NextResponse.json({
      hasBiometricData: !!bioData?.biometricHash,
      biometricData: bioData,
    })
  } catch (error) {
    console.error('Error getting biometric status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get biometric status',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
