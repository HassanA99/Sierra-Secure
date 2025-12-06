
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
    const doc = await this.prisma.document.findUnique({ 
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: true,
        attestation: true,
        nftRecord: true,
      }
    })
    return doc as Document | null
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
            recommendedAction: true,
          }
        },
        attestation: {
          select: { id: true, sasId: true, isActive: true }
        },
        nftRecord: {
          select: { id: true, mintAddress: true, ownerAddress: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return docs as Document[]
  }

  async findByType(type: DocumentType, limit?: number, offset?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { type },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
            recommendedAction: true,
          }
        },
        attestation: {
          select: { id: true, sasId: true, isActive: true }
        },
        nftRecord: {
          select: { id: true, mintAddress: true, ownerAddress: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return docs as Document[]
  }

  async findByStatus(status: DocumentStatus, limit?: number, offset?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { status },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
            recommendedAction: true,
          }
        },
        attestation: {
          select: { id: true, sasId: true, isActive: true }
        },
        nftRecord: {
          select: { id: true, mintAddress: true, ownerAddress: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return docs as Document[]
  }

  async findByFileHash(fileHash: string): Promise<Document | null> {
    const doc = await this.prisma.document.findUnique({ 
      where: { fileHash },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
          }
        },
      }
    })
    return doc as Document | null
  }

  async findExpiredDocuments(limit?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: {
        expiresAt: { lte: new Date() },
        status: 'EXPIRED',
      },
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
          }
        },
      },
      orderBy: { expiresAt: 'asc' },
    })
    return docs as Document[]
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.document.count({ where: { userId } })
  }

  async countByType(type: DocumentType): Promise<number> {
    return this.prisma.document.count({ where: { type } })
  }

  async findAll(limit?: number, offset?: number): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
            recommendedAction: true,
          }
        },
        attestation: {
          select: { id: true, sasId: true, isActive: true }
        },
        nftRecord: {
          select: { id: true, mintAddress: true, ownerAddress: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return docs as Document[]
  }

  async update(id: string, data: UpdateDocumentInput): Promise<Document> {
    const doc = await this.prisma.document.update({ 
      where: { id }, 
      data,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        forensicReport: true,
        attestation: true,
        nftRecord: true,
      }
    })
    return doc as Document
  }


  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } })
  }


  async findByAttestationId(attestationId: string): Promise<Document | null> {
    const doc = await this.prisma.document.findFirst({ 
      where: { attestationId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
          }
        },
        attestation: true,
      }
    })
    return doc as Document | null
  }

  async findByNftMintAddress(mintAddress: string): Promise<Document | null> {
    const doc = await this.prisma.document.findFirst({ 
      where: { nftMintAddress: mintAddress },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        forensicReport: {
          select: {
            id: true,
            overallScore: true,
            status: true,
          }
        },
        nftRecord: true,
      }
    })
    return doc as Document | null
  }
}

export default DocumentRepository
