import { Document, CreateDocumentInput, UpdateDocumentInput, Permission, CreatePermissionInput, PermissionType } from '@/types/document.types'
import { AttestationResult, NFTResult, VerificationResult } from '@/types/blockchain.types'
import { ForensicReport } from '@/types/forensic.types'

// Extended input for Service including file buffer
export interface CreateDocumentServiceInput {
  userId: string
  documentType: string // Maps to DocumentType enum
  title: string
  description?: string
  fileBuffer: Buffer
  mimeType: string
  originalFileName: string
  blockchainType?: 'SAS' | 'NFT' // Simplified for input
}

export interface IDocumentService {
  // Core document operations
  createDocument(input: CreateDocumentServiceInput): Promise<Document>
  getDocument(documentId: string, requesterId: string): Promise<Document>
  getUserDocuments(userId: string, limit?: number, offset?: number): Promise<Document[]>
  updateDocument(documentId: string, updateData: UpdateDocumentInput, userId: string): Promise<Document>
  deleteDocument(documentId: string, userId: string): Promise<void>

  // Blockchain operations
  issueIdentityDocument(documentId: string, userId: string): Promise<AttestationResult>
  issueOwnershipDocument(documentId: string, userId: string): Promise<NFTResult>
  verifyDocument(documentId: string): Promise<VerificationResult>
  // verifyDocumentByHash(fileHash: string): Promise<VerificationResult> // Optional, removing for now to simplify

  // Sharing and permissions
  shareDocument(documentId: string, recipientAddress: string, accessType: PermissionType, userId: string, expiresAt?: Date): Promise<Permission>
  revokeAccess(documentId: string, recipientAddress: string, userId: string): Promise<void>
  getSharedDocuments(userAddress: string, limit?: number, offset?: number): Promise<Document[]>
  getDocumentPermissions(documentId: string, userId: string): Promise<Permission[]>

  // Forensic analysis (Gemini AI verification)
  runForensicAnalysis(documentId: string, userId: string): Promise<ForensicReport>
  getForensicReport(documentId: string, userId: string): Promise<ForensicReport | null>
}