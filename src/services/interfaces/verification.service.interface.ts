import { Document, DocumentType } from '@/types/document.types'
import { VerificationResult } from '@/types/blockchain.types'

export interface VerificationInput {
  documentId?: string
  fileHash?: string
  attestationId?: string
  nftMintAddress?: string
}

export interface PublicVerificationInput {
  fileHash: string
  documentType?: DocumentType
  expectedIssuer?: string
}

export interface BulkVerificationInput {
  items: VerificationInput[]
}

export interface BulkVerificationResult {
  results: Array<{
    input: VerificationInput
    result: VerificationResult
  }>
  summary: {
    total: number
    verified: number
    invalid: number
    errors: number
  }
}

export interface VerificationReport {
  documentId: string
  result: VerificationResult
  checks: {
    blockchainVerification: boolean
    signatureVerification: boolean
    integrityCheck: boolean
    expirationCheck: boolean
    issuerVerification: boolean
  }
  metadata: {
    verifiedAt: Date
    verifiedBy?: string
    blockchainNetwork: string
    transactionHash?: string
  }
}

export interface IVerificationService {
  // Document verification
  verifyDocument(input: VerificationInput): Promise<VerificationResult>
  verifyDocumentIntegrity(document: Document, providedHash?: string): Promise<boolean>
  verifyDocumentExpiration(document: Document): Promise<boolean>
  
  // Public verification (no authentication required)
  publicVerifyDocument(input: PublicVerificationInput): Promise<VerificationResult>
  generateVerificationQR(documentId: string): Promise<string>
  verifyFromQRCode(qrData: string): Promise<VerificationResult>
  
  // Bulk verification
  bulkVerifyDocuments(input: BulkVerificationInput): Promise<BulkVerificationResult>
  
  // Blockchain-specific verification
  verifyAttestation(attestationId: string): Promise<VerificationResult>
  verifyNFT(nftMintAddress: string): Promise<VerificationResult>
  
  // Comprehensive verification reports
  generateVerificationReport(documentId: string): Promise<VerificationReport>
  validateIssuer(issuerId: string, documentType: DocumentType): Promise<boolean>
  
  // Verification history and audit
  getVerificationHistory(documentId: string, limit?: number): Promise<VerificationResult[]>
  logVerificationAttempt(documentId: string, result: VerificationResult, verifiedBy?: string): Promise<void>
  
  // Cross-chain verification support
  verifyAcrossChains(documentId: string): Promise<Map<string, VerificationResult>>
  
  // Revocation and status checking
  checkRevocationStatus(attestationId: string): Promise<boolean>
  isDocumentRevoked(documentId: string): Promise<boolean>
}