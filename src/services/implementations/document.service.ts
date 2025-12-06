import { prisma } from '@/lib/prisma/client'
import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type {
  IDocumentService,
  CreateDocumentServiceInput,
} from '@/services/interfaces/document.service.interface'
import {
  DocumentType,
  DocumentStatus,
  BlockchainType,
  PermissionType,
  Document,
  Permission,
  UpdateDocumentInput
} from '@/types/document.types'
import type { ForensicReport } from '@/types/forensic.types'
import { AttestationResult, NFTResult, VerificationResult } from '@/types/blockchain.types'
import { AIDocumentForensicService } from './ai-forensic.service'
import { ArweaveService } from './arweave.service'
import { SolanaService } from './solana.service'

/**
 * DocumentService Implementation
 */
export class DocumentService implements IDocumentService {
  private readonly prisma: PrismaClient
  private readonly forensicService: AIDocumentForensicService
  private readonly arweaveService: ArweaveService
  private readonly solanaService: SolanaService

  constructor(
    prismaClient: PrismaClient,
    forensicService?: AIDocumentForensicService,
    arweaveService?: ArweaveService,
    solanaService?: SolanaService
  ) {
    this.prisma = prismaClient
    this.forensicService = forensicService || new AIDocumentForensicService()
    this.arweaveService = arweaveService || new ArweaveService()
    this.solanaService = solanaService || new SolanaService()
  }

  // CORE OPERATIONS

  async createDocument(input: CreateDocumentServiceInput): Promise<Document> {
    try {
      if (!input.userId || !input.documentType || !input.fileBuffer) {
        throw new Error('Missing required fields')
      }

      // Hash file
      const fileHash = this.calculateHash(input.fileBuffer)

      // Duplicate check
      // Cast DocumentType because input is string
      const docTypeEnum = input.documentType as DocumentType

      const existingDoc = await this.prisma.document.findFirst({
        where: { fileHash, userId: input.userId },
      })

      if (existingDoc) return this.mapToDocument(existingDoc)

      const documentId = `doc_${crypto.randomUUID()}`

      // Forensic Analysis
      console.log(`[${documentId}] Starting forensic analysis...`)
      const forensicReport = await this.forensicService.analyzeDocument({
        documentId: documentId,
        fileBuffer: input.fileBuffer,
        documentType: input.documentType,
        mimeType: input.mimeType,
      })

      // Arweave Upload
      let arweaveFileHash = 'pending_hash'
      try {
        const upload = await this.arweaveService.uploadFile(
          input.fileBuffer,
          input.documentType,
          documentId,
          { userId: input.userId }
        )
        arweaveFileHash = upload.transactionId
      } catch (e) {
        console.warn('Arweave upload failed, using placeholder')
      }

      // DB Transaction
      const doc = await this.prisma.$transaction(async (tx) => {
        // Save Forensic Report
        const forensicAnalysis = await tx.forensicAnalysis.create({
          data: {
            documentId,
            analysisId: forensicReport.analysisId,
            timestamp: new Date(),
            status: 'COMPLETED',
            tamperingDetected: forensicReport.tampering.detected,
            tamperRisk: forensicReport.tampering.overallTamperRisk,
            tamperIndicators: forensicReport.tampering.indicators as any,
            extractedText: forensicReport.ocrAnalysis.extractedText || '',
            ocrConfidence: forensicReport.ocrAnalysis.confidence || 0,
            ocrLanguage: forensicReport.ocrAnalysis.language || 'unknown',
            documentQuality: forensicReport.metadata.documentQuality,
            hasSecurityFeatures: forensicReport.metadata.hasSecurityFeatures,
            securityFeatures: forensicReport.metadata.securityFeatures as any,
            hasFaceImage: forensicReport.biometric.hasFaceImage,
            faceConfidence: forensicReport.biometric.faceConfidence || 0,
            integrityScore: forensicReport.compliance.integrity,
            authenticityScore: forensicReport.compliance.authenticity,
            metadataScore: forensicReport.compliance.metadata,
            ocrScore: forensicReport.compliance.ocr,
            biometricScore: forensicReport.compliance.biometric,
            securityScore: forensicReport.compliance.security,
            overallScore: forensicReport.compliance.overall,
            recommendedAction: forensicReport.compliance.recommendedAction,
            blockchainRecommendation: forensicReport.blockchainRecommendation,
            findings: forensicReport.findings as any,
            errors: forensicReport.errors as any,
            aiModel: forensicReport.aiModel,
            analysisMethod: forensicReport.analysisMethod,
          }
        })

        // Save Document
        // Fix: Use 'type' property as per schema, not 'documentType'
        return tx.document.create({
          data: {
            id: documentId,
            userId: input.userId,
            type: docTypeEnum,
            title: input.title,
            description: input.description,
            status: DocumentStatus.PENDING,
            fileHash: arweaveFileHash,
            mimeType: input.mimeType,
            fileSize: input.fileBuffer.length,
            blockchainType: input.blockchainType === 'NFT' ? BlockchainType.NFT_METAPLEX : BlockchainType.SAS_ATTESTATION,
            forensicReportId: forensicAnalysis.id,
            forensicScore: forensicReport.compliance.overall,
            forensicStatus: forensicReport.compliance.recommendedAction === 'APPROVED' ? 'APPROVED' : 'REVIEW',
          }
        })
      })

      return this.mapToDocument(doc)

    } catch (error) {
      console.error('Create document error', error)
      throw error
    }
  }

  async getDocument(documentId: string, requesterId: string): Promise<Document> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) throw new Error('Not found')
    if (doc.userId !== requesterId) throw new Error('Unauthorized')
    return this.mapToDocument(doc)
  }

  async getUserDocuments(userId: string, limit?: number, offset?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    })
    return docs.map(this.mapToDocument)
  }

  async updateDocument(documentId: string, updateData: UpdateDocumentInput, userId: string): Promise<Document> {
    // Validate ownership
    await this.getDocument(documentId, userId)

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
        updatedAt: new Date()
      }
    })
    return this.mapToDocument(updated)
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    await this.getDocument(documentId, userId)
    await this.prisma.document.delete({ where: { id: documentId } })
  }

  // BLOCKCHAIN OPERATIONS

  async issueIdentityDocument(documentId: string, userId: string): Promise<AttestationResult> {
    const doc = await this.getDocument(documentId, userId)
    // Mock implementation for now using SolanaService
    // In real app, we would fetch schema etc
    return this.solanaService.createAttestation({
      schema: { id: doc.type },
      data: { hash: doc.fileHash },
      issuerId: 'government',
      holderAddress: userId // assuming userId contains address for now or is mapped
    })
  }

  async issueOwnershipDocument(documentId: string, userId: string): Promise<NFTResult> {
    const doc = await this.getDocument(documentId, userId)
    return this.solanaService.mintNFT({
      metadata: { name: doc.title, symbol: 'DOC', uri: 'https://arweave.net/...' },
      ownerAddress: userId // assuming userId is address
    })
  }

  async verifyDocument(documentId: string): Promise<VerificationResult> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) throw new Error('Not found')

    if (doc.attestationId) {
      return this.solanaService.verifyAttestation(doc.attestationId)
    }
    return { isValid: false, status: 'NOT_ATTESTED', verifiedAt: new Date() }
  }

  // PERMISSIONS & SHARING (STUBS)

  async shareDocument(documentId: string, recipientAddress: string, accessType: PermissionType, userId: string, expiresAt?: Date): Promise<Permission> {
    // Basic implementation
    await this.getDocument(documentId, userId)
    const perm = await this.prisma.permission.create({
      data: {
        userId,
        documentId,
        grantedTo: recipientAddress,
        accessType,
        expiresAt,
        isActive: true
      }
    })
    return this.mapToPermission(perm)
  }

  async revokeAccess(documentId: string, recipientAddress: string, userId: string): Promise<void> {
    await this.getDocument(documentId, userId)
    await this.prisma.permission.updateMany({
      where: { documentId, grantedTo: recipientAddress },
      data: { isActive: false }
    })
  }

  async getSharedDocuments(userAddress: string, limit?: number, offset?: number): Promise<Document[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { grantedTo: userAddress, isActive: true },
      include: { document: true }
    })
    return permissions.map(p => this.mapToDocument(p.document))
  }

  async getDocumentPermissions(documentId: string, userId: string): Promise<Permission[]> {
    await this.getDocument(documentId, userId)
    const perms = await this.prisma.permission.findMany({
      where: { documentId }
    })
    return perms.map(this.mapToPermission)
  }

  // FORENSIC

  async runForensicAnalysis(documentId: string, userId: string): Promise<ForensicReport> {
    // Re-run not fully supported without stored buffer recovery, simplified stub
    throw new Error('Method not implemented.')
  }

  async getForensicReport(documentId: string, userId: string): Promise<ForensicReport | null> {
    await this.getDocument(documentId, userId)
    const report = await this.prisma.forensicAnalysis.findUnique({ where: { documentId } })
    if (!report) return null;

    // Map back to type (simplified)
    return {
      documentId,
      analysisId: report.analysisId,
      timestamp: report.timestamp,
      status: report.status as any,
      tampering: {
        detected: report.tamperingDetected,
        overallTamperRisk: report.tamperRisk as any,
        indicators: report.tamperIndicators as any
      },
      ocrAnalysis: { extractedText: report.extractedText, confidence: report.ocrConfidence, language: report.ocrLanguage, zones: [] },
      metadata: { documentQuality: report.documentQuality as any, hasSecurityFeatures: report.hasSecurityFeatures, securityFeatures: report.securityFeatures as any },
      biometric: { hasFaceImage: report.hasFaceImage, faceConfidence: report.faceConfidence || 0 },
      compliance: {
        overall: report.overallScore,
        integrity: report.integrityScore,
        authenticity: report.authenticityScore,
        metadata: report.metadataScore,
        ocr: report.ocrScore,
        biometric: report.biometricScore,
        security: report.securityScore,
        thresholdMet: report.overallScore > 75,
        recommendedAction: report.recommendedAction as any
      },
      blockchainReady: report.overallScore > 80,
      blockchainRecommendation: report.blockchainRecommendation as any,
      findings: report.findings as any,
      errors: report.errors as any,
      aiModel: report.aiModel,
      analysisMethod: report.analysisMethod as any
    }
  }

  // HELPERS

  private calculateHash(buffer: Buffer): string {
    const hashObj = crypto.createHash('sha256')
    hashObj.update(buffer)
    return hashObj.digest('hex')
  }

  private mapToDocument(d: any): Document {
    return {
      id: d.id,
      userId: d.userId,
      type: d.type as DocumentType,
      title: d.title,
      description: d.description,
      status: d.status as DocumentStatus,
      fileHash: d.fileHash,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      blockchainType: d.blockchainType as BlockchainType,
      attestationId: d.attestationId,
      nftMintAddress: d.nftMintAddress,
      issuedAt: d.issuedAt,
      expiresAt: d.expiresAt,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }
  }

  private mapToPermission(p: any): Permission {
    return {
      id: p.id,
      userId: p.userId,
      documentId: p.documentId,
      grantedTo: p.grantedTo,
      accessType: p.accessType as PermissionType,
      expiresAt: p.expiresAt,
      isActive: p.isActive,
      createdAt: p.createdAt
    }
  }
}

export const documentServiceInstance = new DocumentService(prisma)
