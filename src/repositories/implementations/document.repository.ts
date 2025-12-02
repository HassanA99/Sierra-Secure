
import { PrismaClient } from '@prisma/client'
import type { CreateDocumentInput, UpdateDocumentInput, Document, DocumentType, DocumentStatus } from '@/types/document.types'
import type { IDocumentRepository } from '../interfaces/document.repository.interface'

export class DocumentRepository implements IDocumentRepository {
  private prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async create(documentData: CreateDocumentInput): Promise<Document> {
    return this.prisma.document.create({ data: documentData })
  }

  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({ where: { id } })
  }


  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { userId },
      take: limit,
      skip: offset,
    }) as unknown as Document[]
  }


  async findByType(type: DocumentType, limit?: number, offset?: number): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { type },
      take: limit,
      skip: offset,
    }) as unknown as Document[]
  }

  async findByStatus(status: DocumentStatus, limit?: number, offset?: number): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { status },
      take: limit,
      skip: offset,
    }) as unknown as Document[]
  }
  async findByFileHash(fileHash: string): Promise<Document | null> {
    return this.prisma.document.findUnique({ where: { fileHash } }) as unknown as Document | null
  }

  async findExpiredDocuments(limit?: number): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: {
        expiresAt: { lte: new Date() },
        status: 'EXPIRED',
      },
      take: limit,
    }) as unknown as Document[]
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.document.count({ where: { userId } })
  }

  async countByType(type: DocumentType): Promise<number> {
    return this.prisma.document.count({ where: { type } })
  }

  async findAll(limit?: number, offset?: number): Promise<Document[]> {
    return this.prisma.document.findMany({
      take: limit,
      skip: offset,
    }) as unknown as Document[]
  }


  async update(id: string, data: UpdateDocumentInput): Promise<Document> {
    return this.prisma.document.update({ where: { id }, data }) as unknown as Document
  }


  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } })
  }


  async findByAttestationId(attestationId: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { attestationId } }) as unknown as Document | null
  }

  async findByNftMintAddress(mintAddress: string): Promise<Document | null> {
    return this.prisma.document.findFirst({ where: { nftMintAddress: mintAddress } }) as unknown as Document | null
  }
}

export default DocumentRepository
