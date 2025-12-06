import { NextRequest, NextResponse } from 'next/server'
import { documentIntelligence } from '@/lib/ai/document-intelligence-service'
import { getGovernmentWalletService } from '@/lib/blockchain/government-wallet-service'
import { solanaService } from '@/services/implementations/solana.service'
import { arweaveStorageService } from '@/lib/storage/arweave-service'
import { prisma } from '@/lib/prisma/client'

/**
 * POST /api/documents/[documentId]/ai-analysis
 * 
 * Comprehensive AI analysis of document:
 * - Authenticity & deepfake detection
 * - Data extraction
 * - Document classification
 * - Fraud risk assessment
 * 
 * Government wallet automatically sponsors any blockchain actions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data required' },
        { status: 400 }
      )
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Run parallel AI analyses
    const [
      documentAnalysis,
      fraudDetection,
      biometricData
    ] = await Promise.all([
      documentIntelligence.analyzeDocumentAuthenticity(imageBase64, document.type.toString()),
      documentIntelligence.detectFraud(imageBase64),
      documentIntelligence.extractBiometricData(imageBase64)
    ])

    // Calculate composite authenticity score
    const compositeScore = Math.round(
      (documentAnalysis.authenticityScore * 0.4 +
        (100 - fraudDetection.deepfakeScore) * 0.3 +
        fraudDetection.livenessScore * 0.3)
    )

    // Determine action based on scores
    let recommendedAction = documentAnalysis.recommendedAction
    if (fraudDetection.deepfakeScore > 60) {
      recommendedAction = 'REJECT'
    } else if (documentAnalysis.authenticityScore > 85 && fraudDetection.livenessScore > 80) {
      recommendedAction = 'AUTO_APPROVE'
    }

    // Check for duplicate biometric (fraud detection)
    let biometricMatch = null
    if (biometricData.faceDetected) {
      const existingBiometric = await prisma.user.findFirst({
        where: {
          biometricHash: biometricData.biometricHash,
          id: { not: document.userId }
        }
      })

      if (existingBiometric) {
        biometricMatch = {
          matchedUserId: existingBiometric.id,
          matchedUserEmail: existingBiometric.email,
          confidence: 95,
          requiresManualReview: true
        }
        // Change recommendation if potential fraud detected
        recommendedAction = 'MANUAL_REVIEW'
      }
    }

    // Update document with AI analysis results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        forensicScore: compositeScore,
        forensicStatus: recommendedAction === 'AUTO_APPROVE' ? 'APPROVED' : 'REVIEW'
      }
    })

    // If AUTO_APPROVE, sponsor blockchain actions
    if (recommendedAction === 'AUTO_APPROVE') {
      const govWallet = getGovernmentWalletService()

      try {
        // STEP 1: Mint NFT (government digital seal)
        console.log('🎖️ Step 1: Minting NFT via SolanaService...')

        const nftMetadata = {
          name: `Government Digital Seal - ${document.type}`,
          symbol: 'NDDV',
          description: `Official government verification for ${document.type}`,
          image: 'https://your-domain.com/government-seal.png',
          attributes: [
            { trait_type: 'Document Type', value: document.type.toString() },
            { trait_type: 'Verified', value: 'true' },
            { trait_type: 'Blockchain', value: 'Solana' },
            { trait_type: 'Government Backed', value: 'true' },
          ]
        }

        const govAddress = process.env.GOVERNMENT_WALLET_ADDRESS
        if (!govAddress) throw new Error('GOVERNMENT_WALLET_ADDRESS is not configured')

        const nftResult = await solanaService.mintNFT(
          nftMetadata,
          document.user.walletAddress,
          govAddress
        )

        // Update DB with NFT address (Business Logic)
        await prisma.document.update({
          where: { id: documentId },
          data: {
            nftMintAddress: nftResult.mintAddress,
            updatedAt: new Date()
          }
        })

        // STEP 2: Create SAS attestation
        console.log('📝 Step 2: Creating SAS attestation via SolanaService...')
        const attestationResult = await solanaService.createAttestation(
          'schema_document_verification',
          {
            documentType: document.type.toString(),
            documentHash: '',
            citizenWallet: document.user.walletAddress,
            authenticityScore: compositeScore,
            deepfakeRisk: fraudDetection.deepfakeScore > 60 ? 'HIGH' : 'LOW',
          },
          govAddress,
          document.user.walletAddress
        )

        // Update DB with Attestation ID (Business Logic)
        await prisma.document.update({
          where: { id: documentId },
          data: { attestationId: attestationResult.attestationId }
        })

        // STEP 3: Store on Arweave (permanent)
        console.log('📦 Step 3: Storing on Arweave...')
        const arweaveResult = await arweaveStorageService.storeDocument(
          documentId,
          Buffer.from(JSON.stringify({
            documentId,
            type: document.type,
            analysis: { compositeScore, recommendedAction },
            createdAt: new Date(),
          })),
          document.type.toString(),
          document.user.walletAddress,
        )

        console.log('✅ Blockchain integration complete!')
        console.log(`📌 NFT: ${nftResult.mintAddress}`)
        console.log(`📝 Attestation: ${attestationResult.attestationId}`)
        console.log(`📦 Arweave: ${arweaveResult.permanentUrl}`)

        return NextResponse.json({
          success: true,
          analysis: {
            documentAnalysis,
            fraudDetection,
            biometricData: {
              faceDetected: biometricData.faceDetected,
              biometricHash: biometricData.biometricHash,
              confidence: biometricData.confidence,
            },
            biometricMatch,
            compositeScore,
            recommendedAction,
          },
          blockchain: {
            nft: nftResult,
            attestation: attestationResult,
            arweave: arweaveResult,
          },
        }, { status: 200 })
      } catch (blockchainError) {
        console.error('Blockchain integration error:', blockchainError)
        // Still return analysis results even if blockchain fails
        return NextResponse.json({
          success: true,
          analysis: {
            documentAnalysis,
            fraudDetection,
            compositeScore,
            recommendedAction,
          },
          blockchainError: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
        }, { status: 200 })
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        documentAnalysis,
        fraudDetection,
        biometricData: {
          faceDetected: biometricData.faceDetected,
          biometricHash: biometricData.biometricHash,
          confidence: biometricData.confidence
        },
        biometricMatch,
        compositeScore,
        recommendedAction
      }
    }, { status: 200 })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
