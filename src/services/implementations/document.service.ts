import { PrismaClient } from '@prisma/client'
import { crypto } from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type {
  IDocumentService,
  CreateDocumentInput,
  UploadDocumentInput,
  VerifyDocumentInput,
  UpdateDocumentInput,
  DocumentResponse,
  DocumentListResponse,
} from '@/services/interfaces/document.service.interface'
import type { ForensicReport } from '@/types/forensic.types'
import { AIDocumentForensicService } from './ai-forensic.service'
import { ArweaveService } from './arweave.service'
import { SolanaService } from './solana.service'

/**
 * DocumentService Implementation
 * Orchestrates document creation, verification, and forensic analysis
 * Follows Clean Architecture and Repository Pattern
 */
export class DocumentService implements IDocumentService {
  private readonly prisma: PrismaClient
  private readonly forensicService: AIDocumentForensicService
  private readonly arweaveService: ArweaveService
  private readonly solanaService: SolanaService

  constructor(
    prisma: PrismaClient,
    forensicService?: AIDocumentForensicService,
    arweaveService?: ArweaveService,
    solanaService?: SolanaService
  ) {
    this.prisma = prisma
    this.forensicService = forensicService || new AIDocumentForensicService()
    this.arweaveService = arweaveService || new ArweaveService()
    this.solanaService = solanaService || new SolanaService()
  }

  /**
   * Create a new document with forensic analysis
   * Workflow:
   * 1. Validate input
   * 2. Hash and encrypt document
   * 3. Run forensic analysis
   * 4. Determine blockchain recommendation
   * 5. Save to database
   * 6. Return document with forensic results
   */
  async createDocument(input: CreateDocumentInput): Promise<DocumentResponse> {
    try {
      // Validate required fields
      if (!input.userId || !input.documentType || !input.fileBuffer) {
        throw new Error('Missing required fields: userId, documentType, fileBuffer')
      }

      // Calculate file hash for deduplication
      const fileHash = this.calculateHash(input.fileBuffer)

      // Check for duplicate documents
      const existingDoc = await this.prisma.document.findFirst({
        where: {
          fileHash: fileHash,
          userId: input.userId,
        },
      })

      if (existingDoc) {
        console.log(`Document already exists: ${existingDoc.id}`)
        return this.mapDocumentToResponse(existingDoc)
      }

      // Generate unique document ID
      const documentId = `doc_${crypto.randomUUID()}`

      // Run forensic analysis before blockchain issuance
      console.log(`[${documentId}] Starting forensic analysis...`)
      const forensicReport = await this.forensicService.analyzeDocument({
        fileBuffer: input.fileBuffer,
        documentType: input.documentType,
        mimeType: input.mimeType || 'application/octet-stream',
        userId: input.userId,
      })

      // Determine forensic status and blockchain recommendation
      const { forensicStatus, blockchainRecommendation } = this.interpretForensicResults(
        forensicReport
      )

      console.log(
        `[${documentId}] Forensic analysis complete. Status: ${forensicStatus}, Blockchain: ${blockchainRecommendation}`
      )

      // Create forensic analysis record
      const forensicAnalysis = await this.prisma.forensicAnalysis.create({
        data: {
          documentId,
          analysisId: forensicReport.analysisId,
          timestamp: new Date(),
          status: 'COMPLETED',
          tamperingDetected: forensicReport.tampering.detected,
          tamperRisk: forensicReport.tampering.riskLevel,
          tamperIndicators: forensicReport.tampering.indicators,
          extractedText: forensicReport.ocr.extractedText || '',
          ocrConfidence: forensicReport.ocr.averageConfidence || 0,
          ocrLanguage: forensicReport.ocr.detectedLanguage || 'unknown',
          documentQuality: forensicReport.documentQuality,
          hasSecurityFeatures: forensicReport.securityFeatures.hasSecurityFeatures,
          securityFeatures: forensicReport.securityFeatures.features,
          hasFaceImage: forensicReport.biometric.hasFaceDetection,
          faceConfidence: forensicReport.biometric.faceConfidence,
          integrityScore: forensicReport.complianceScore.integrity,
          authenticityScore: forensicReport.complianceScore.authenticity,
          metadataScore: forensicReport.complianceScore.metadata,
          ocrScore: forensicReport.complianceScore.ocr,
          biometricScore: forensicReport.complianceScore.biometric,
          securityScore: forensicReport.complianceScore.security,
          overallScore: forensicReport.complianceScore.overall,
          recommendedAction: this.getRecommendedAction(forensicReport.complianceScore.overall),
          blockchainRecommendation,
          findings: forensicReport.findings,
          errors: forensicReport.errors,
          aiModel: forensicReport.aiModel,
          analysisMethod: forensicReport.analysisMethod,
        },
      })

      // Upload file to Arweave for permanent storage
      console.log(`[${documentId}] Uploading to Arweave...`)
      const arweaveUpload = await this.arweaveService.uploadFile(
        input.fileBuffer,
        input.documentType,
        documentId,
        {
          userId: input.userId,
          forensicScore: forensicReport.complianceScore.overall.toString(),
        }
      )

      const arweaveFileHash = arweaveUpload.transactionId

      // Create blockchain attestation based on document type
      let attestationId: string | null = null
      let nftMintAddress: string | null = null

      if (blockchainRecommendation === 'SAS_ATTESTATION') {
        // Issue SAS attestation for identity documents
        console.log(`[${documentId}] Creating SAS attestation...`)
        const attestation = await this.solanaService.createAttestation(
          input.documentType,
          {
            fileHash: arweaveFileHash,
            forensicScore: forensicReport.complianceScore.overall,
            documentType: input.documentType,
          },
          process.env.NEXT_PUBLIC_ISSUER_ADDRESS || 'GovernmentIssuer',
          process.env.NEXT_PUBLIC_USER_ADDRESS || input.userId
        )

        attestationId = attestation.attestationId
        console.log(`[${documentId}] SAS attestation created: ${attestationId}`)
      } else if (blockchainRecommendation === 'NFT_METAPLEX') {
        // Mint NFT for ownership documents
        console.log(`[${documentId}] Minting NFT...`)
        const nft = await this.solanaService.mintNFT(
          {
            name: input.documentType,
            symbol: 'DOC',
            uri: arweaveUpload.arweaveUrl,
            attributes: [
              { trait_type: 'Forensic Score', value: forensicReport.complianceScore.overall.toString() },
              { trait_type: 'Document Type', value: input.documentType },
            ],
          },
          process.env.NEXT_PUBLIC_USER_ADDRESS || input.userId,
          process.env.NEXT_PUBLIC_ISSUER_ADDRESS || 'GovernmentIssuer'
        )

        nftMintAddress = nft.mintAddress
        console.log(`[${documentId}] NFT minted: ${nftMintAddress}`)
      }

      // Create document record with all blockchain linkage
      const document = await this.prisma.document.create({
        data: {
          id: documentId,
          userId: input.userId,
          documentType: input.documentType,
          fileHash: arweaveFileHash, // Store Arweave transaction ID as file hash
          mimeType: input.mimeType || 'application/octet-stream',
          fileSize: input.fileBuffer.length,
          status: attestationId || nftMintAddress ? 'VERIFIED' : 'PENDING',
          blockchainType: input.blockchainType || 'SAS',
          attestationId: attestationId || undefined,
          nftMintAddress: nftMintAddress || undefined,
          forensicReportId: forensicAnalysis.id,
          forensicScore: forensicReport.complianceScore.overall,
          forensicStatus: forensicStatus,
        },
        include: {
          forensicReport: true,
        },
      })

      console.log(
        `[${documentId}] Document created with blockchain attestation. Score: ${forensicReport.complianceScore.overall}/100`
      )

      return this.mapDocumentToResponse(document, forensicReport)
    } catch (error) {
      console.error('Error creating document:', error)
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Upload a document file
   * Saves file to temporary storage
   * Returns file path for processing
   */
  async uploadDocument(input: UploadDocumentInput): Promise<{ filePath: string; fileSize: number }> {
    try {
      const tempDir = path.join(process.cwd(), 'temp_uploads')
      
      // Create temp directory if it doesn't exist
      try {
        await fs.mkdir(tempDir, { recursive: true })
      } catch (e) {
        // Directory may already exist
      }

      const fileName = `${crypto.randomUUID()}_${input.originalFileName}`
      const filePath = path.join(tempDir, fileName)

      // Write file to disk
      await fs.writeFile(filePath, input.fileBuffer)

      return {
        filePath,
        fileSize: input.fileBuffer.length,
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      throw new Error(
        `Failed to upload document: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Get forensic report for a document
   */
  async getForensicReport(documentId: string, userId: string): Promise<ForensicReport | null> {
    try {
      // Verify user owns the document
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: { forensicReport: true },
      })

      if (!document) {
        throw new Error(`Document not found: ${documentId}`)
      }

      if (document.userId !== userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      if (!document.forensicReport) {
        return null
      }

      // Reconstruct ForensicReport from database
      return this.reconstructForensicReport(document.forensicReport)
    } catch (error) {
      console.error('Error getting forensic report:', error)
      throw error
    }
  }

  /**
   * Run forensic analysis on an existing document
   */
  async runForensicAnalysis(documentId: string, userId: string): Promise<ForensicReport> {
    try {
      // Get document
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      })

      if (!document) {
        throw new Error(`Document not found: ${documentId}`)
      }

      if (document.userId !== userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      // TODO: Retrieve original file buffer (would need to be stored)
      // For now, this is a placeholder that would need to fetch from Arweave/storage
      throw new Error('Re-analysis not yet implemented. Document must be uploaded again.')
    } catch (error) {
      console.error('Error running forensic analysis:', error)
      throw error
    }
  }

  /**
   * Verify a document (check blockchain attestation)
   */
  async verifyDocument(input: VerifyDocumentInput): Promise<{
    isValid: boolean
    attestationId?: string
    status: string
  }> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: input.documentId },
        include: { attestation: true },
      })

      if (!document) {
        return { isValid: false, status: 'DOCUMENT_NOT_FOUND' }
      }

      if (document.userId !== input.userId) {
        return { isValid: false, status: 'UNAUTHORIZED' }
      }

      // Check if document has blockchain attestation
      if (!document.attestationId || !document.attestation) {
        return { isValid: false, status: 'NOT_ATTESTED' }
      }

      // Verify attestation is active
      if (!document.attestation.isActive) {
        return { isValid: false, status: 'ATTESTATION_REVOKED' }
      }

      return {
        isValid: true,
        attestationId: document.attestationId,
        status: 'VERIFIED',
      }
    } catch (error) {
      console.error('Error verifying document:', error)
      throw error
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(input: UpdateDocumentInput): Promise<DocumentResponse> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: input.documentId },
      })

      if (!document) {
        throw new Error(`Document not found: ${input.documentId}`)
      }

      if (document.userId !== input.userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      // Update document
      const updated = await this.prisma.document.update({
        where: { id: input.documentId },
        data: {
          status: input.status,
          expiresAt: input.expiresAt,
          updatedAt: new Date(),
        },
        include: { forensicReport: true },
      })

      return this.mapDocumentToResponse(updated)
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: { forensicReport: true },
      })

      if (!document) {
        throw new Error(`Document not found: ${documentId}`)
      }

      if (document.userId !== userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      return this.mapDocumentToResponse(document)
    } catch (error) {
      console.error('Error getting document:', error)
      throw error
    }
  }

  /**
   * List documents for user with pagination
   */
  async listDocuments(
    userId: string,
    options: { skip?: number; take?: number; status?: string } = {}
  ): Promise<DocumentListResponse> {
    try {
      const skip = options.skip || 0
      const take = options.take || 20

      const [documents, total] = await Promise.all([
        this.prisma.document.findMany({
          where: {
            userId,
            ...(options.status && { status: options.status }),
          },
          include: { forensicReport: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.document.count({
          where: {
            userId,
            ...(options.status && { status: options.status }),
          },
        }),
      ])

      return {
        documents: documents.map((doc) => this.mapDocumentToResponse(doc)),
        total,
        skip,
        take,
      }
    } catch (error) {
      console.error('Error listing documents:', error)
      throw error
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      })

      if (!document) {
        throw new Error(`Document not found: ${documentId}`)
      }

      if (document.userId !== userId) {
        throw new Error('Unauthorized: User does not own this document')
      }

      // Delete document and related forensic analysis (cascade)
      await this.prisma.document.delete({
        where: { id: documentId },
      })

      console.log(`Document deleted: ${documentId}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Calculate SHA-256 hash of file buffer
   */
  private calculateHash(buffer: Buffer): string {
    const hashObj = crypto.createHash('sha256')
    hashObj.update(buffer)
    return hashObj.digest('hex')
  }

  /**
   * Interpret forensic results to determine document status
   */
  private interpretForensicResults(forensicReport: ForensicReport): {
    forensicStatus: string
    blockchainRecommendation: string
  } {
    const overallScore = forensicReport.complianceScore.overall

    // High confidence - safe to issue
    if (overallScore >= 85) {
      return {
        forensicStatus: 'APPROVED',
        blockchainRecommendation: forensicReport.blockchainRecommendation || 'MINT_SAS',
      }
    }

    // Medium confidence - needs review
    if (overallScore >= 60) {
      return {
        forensicStatus: 'REVIEW',
        blockchainRecommendation: 'MANUAL_REVIEW',
      }
    }

    // Low confidence - reject
    return {
      forensicStatus: 'REJECTED',
      blockchainRecommendation: 'REJECT',
    }
  }

  /**
   * Get recommended action based on compliance score
   */
  private getRecommendedAction(score: number): string {
    if (score >= 85) return 'APPROVED'
    if (score >= 60) return 'REVIEW'
    return 'REJECTED'
  }

  /**
   * Map Document + ForensicAnalysis to response DTO
   */
  private mapDocumentToResponse(
    document: any,
    forensicReport?: ForensicReport
  ): DocumentResponse {
    return {
      id: document.id,
      userId: document.userId,
      documentType: document.documentType,
      status: document.status,
      forensicScore: document.forensicScore,
      forensicStatus: document.forensicStatus,
      fileHash: document.fileHash,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      blockchainType: document.blockchainType,
      attestationId: document.attestationId,
      nftMintAddress: document.nftMintAddress,
      issuedAt: document.issuedAt,
      expiresAt: document.expiresAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      forensicReport:
        forensicReport || (document.forensicReport ? this.reconstructForensicReport(document.forensicReport) : undefined),
    }
  }

  /**
   * Reconstruct ForensicReport from database record
   */
  private reconstructForensicReport(forensicAnalysis: any): ForensicReport {
    return {
      analysisId: forensicAnalysis.analysisId,
      timestamp: forensicAnalysis.timestamp.toISOString(),
      status: forensicAnalysis.status,
      documentQuality: forensicAnalysis.documentQuality,
      aiModel: forensicAnalysis.aiModel,
      analysisMethod: forensicAnalysis.analysisMethod,
      tampering: {
        detected: forensicAnalysis.tamperingDetected,
        riskLevel: forensicAnalysis.tamperRisk,
        indicators: forensicAnalysis.tamperIndicators || [],
      },
      ocr: {
        extractedText: forensicAnalysis.extractedText,
        averageConfidence: forensicAnalysis.ocrConfidence,
        detectedLanguage: forensicAnalysis.ocrLanguage,
      },
      securityFeatures: {
        hasSecurityFeatures: forensicAnalysis.hasSecurityFeatures,
        features: forensicAnalysis.securityFeatures || [],
      },
      biometric: {
        hasFaceDetection: forensicAnalysis.hasFaceImage,
        faceConfidence: forensicAnalysis.faceConfidence,
      },
      complianceScore: {
        integrity: forensicAnalysis.integrityScore,
        authenticity: forensicAnalysis.authenticityScore,
        metadata: forensicAnalysis.metadataScore,
        ocr: forensicAnalysis.ocrScore,
        biometric: forensicAnalysis.biometricScore,
        security: forensicAnalysis.securityScore,
        overall: forensicAnalysis.overallScore,
      },
      blockchainRecommendation: forensicAnalysis.blockchainRecommendation,
      findings: forensicAnalysis.findings || {},
      errors: forensicAnalysis.errors || [],
    }
  }
}

// Export singleton instance
export const documentServiceInstance = new DocumentService(
  new PrismaClient(),
  new AIDocumentForensicService()
)
