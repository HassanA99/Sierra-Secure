
import { DocumentService } from '@/services/implementations/document.service'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'
import { ArweaveService } from '@/services/implementations/arweave.service'
import { SolanaService } from '@/services/implementations/solana.service'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
const mockPrisma = {
    document: {
        findFirst: async () => null,
        create: async (args: any) => ({ ...args.data, id: 'doc_123', createdAt: new Date(), updatedAt: new Date() }),
    },
    forensicAnalysis: {
        create: async (args: any) => ({ ...args.data, id: 'forensic_123' }),
    },
} as unknown as PrismaClient

const mockForensicService = {
    analyzeDocument: async () => ({
        analysisId: 'analysis_123',
        complianceScore: { overall: 90, integrity: 90, authenticity: 90, metadata: 90, ocr: 90, biometric: 90, security: 90 },
        tampering: { detected: false, indicators: [], riskLevel: 'NONE' },
        ocr: { extractedText: 'Test Document', averageConfidence: 0.95, detectedLanguage: 'en' },
        metadata: { documentQuality: 'GOOD', hasSecurityFeatures: true },
        biometric: { hasFaceDetection: true, faceConfidence: 0.95 },
        securityFeatures: { hasSecurityFeatures: true, features: [] },
        findings: {},
        errors: [],
        aiModel: 'mock-gemini',
        analysisMethod: 'mock',
        blockchainRecommendation: 'MINT_SAS',
    }),
} as unknown as AIDocumentForensicService

const mockArweaveService = {
    uploadFile: async () => ({
        transactionId: 'arweave_tx_123',
        arweaveUrl: 'https://arweave.net/arweave_tx_123',
        fileSize: 1024,
        uploadedAt: new Date(),
        contentHash: 'hash_123',
    }),
} as unknown as ArweaveService

const mockSolanaService = {
    createAttestation: async () => ({
        success: true,
        attestationId: 'sas_123',
        transactionSignature: 'sig_123',
    }),
    mintNFT: async () => ({
        success: true,
        mintAddress: 'mint_123',
        transactionSignature: 'sig_456',
    }),
} as unknown as SolanaService

async function main() {
    console.log('🚀 Starting Document Pipeline Verification...')

    const documentService = new DocumentService(
        mockPrisma,
        mockForensicService,
        mockArweaveService,
        mockSolanaService
    )

    const input = {
        userId: 'user_123',
        documentType: 'NATIONAL_ID',
        fileBuffer: Buffer.from('test file content'),
        mimeType: 'image/jpeg',
    }

    try {
        console.log('\n1. Testing Document Creation (SAS Attestation Flow)...')
        const result = await documentService.createDocument(input as any)

        console.log('✅ Document Created Successfully!')
        console.log(`   ID: ${result.id}`)
        console.log(`   Status: ${result.status}`)
        console.log(`   Forensic Score: ${result.forensicScore}`)
        console.log(`   Blockchain Type: ${result.blockchainType}`)
        console.log(`   Attestation ID: ${result.attestationId}`)

        if (result.status === 'VERIFIED' && result.attestationId === 'sas_123') {
            console.log('✨ Pipeline Verification PASSED: Document -> Forensic -> Arweave -> Solana (SAS)')
        } else {
            console.error('❌ Pipeline Verification FAILED: Unexpected result state')
        }

    } catch (error) {
        console.error('❌ Pipeline Verification FAILED:', error)
    }
}

main()
