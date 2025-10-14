import { Document, CreateDocumentInput, UpdateDocumentInput, Permission, CreatePermissionInput, PermissionType } from '@/types/document.types'
import { AttestationResult, NFTResult, VerificationResult } from '@/types/blockchain.types'

export interface IDocumentService {
  // Core document operations
  createDocument(userId: string, documentData: CreateDocumentInput): Promise<Document>
  getDocument(documentId: string, requesterId: string): Promise<Document>
  getUserDocuments(userId: string, limit?: number, offset?: number): Promise<Document[]>
  updateDocument(documentId: string, updateData: UpdateDocumentInput, userId: string): Promise<Document>
  deleteDocument(documentId: string, userId: string): Promise<void>
  
  // Blockchain operations
  issueIdentityDocument(documentId: string, userId: string): Promise<AttestationResult>
  issueOwnershipDocument(documentId: string, userId: string): Promise<NFTResult>
  verifyDocument(documentId: string): Promise<VerificationResult>
  verifyDocumentByHash(fileHash: string): Promise<VerificationResult>
  
  // Sharing and permissions
  shareDocument(documentId: string, recipientAddress: string, accessType: PermissionType, userId: string, expiresAt?: Date): Promise<Permission>
  revokeAccess(documentId: string, recipientAddress: string, userId: string): Promise<void>
  getSharedDocuments(userAddress: string, limit?: number, offset?: number): Promise<Document[]>
  getDocumentPermissions(documentId: string, userId: string): Promise<Permission[]>
  
  // Document validation and security
  validateDocumentAccess(documentId: string, requesterId: string): Promise<boolean>
  encryptDocumentData(data: string, documentId: string): Promise<string>
  decryptDocumentData(encryptedData: string, documentId: string): Promise<string>
  
  // Document lifecycle
  expireDocument(documentId: string, userId: string): Promise<Document>
  renewDocument(documentId: string, newExpiryDate: Date, userId: string): Promise<Document>
  getExpiringDocuments(userId: string, daysAhead?: number): Promise<Document[]>
}