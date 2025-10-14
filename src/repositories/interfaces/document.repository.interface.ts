import { Document, CreateDocumentInput, UpdateDocumentInput, DocumentType, DocumentStatus } from '@/types/document.types'

export interface IDocumentRepository {
  create(documentData: CreateDocumentInput): Promise<Document>
  findById(id: string): Promise<Document | null>
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Document[]>
  findByType(type: DocumentType, limit?: number, offset?: number): Promise<Document[]>
  findByStatus(status: DocumentStatus, limit?: number, offset?: number): Promise<Document[]>
  update(id: string, data: UpdateDocumentInput): Promise<Document>
  delete(id: string): Promise<void>
  findByAttestationId(attestationId: string): Promise<Document | null>
  findByNftMintAddress(mintAddress: string): Promise<Document | null>
  findByFileHash(fileHash: string): Promise<Document | null>
  findExpiredDocuments(limit?: number): Promise<Document[]>
  countByUserId(userId: string): Promise<number>
  countByType(type: DocumentType): Promise<number>
  findAll(limit?: number, offset?: number): Promise<Document[]>
}