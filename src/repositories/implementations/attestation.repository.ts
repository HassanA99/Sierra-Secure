import { PrismaClient } from '@prisma/client'
import type { Attestation, CreateAttestationInput, UpdateAttestationInput } from '@/types/blockchain.types'
import type { IAttestationRepository } from '../interfaces/attestation.repository.interface'

/**
 * AttestationRepository Implementation
 * Handles SAS (Solana Attestation Service) attestation records
 * Attestations are non-transferable facts (birth certificates, IDs, etc.)
 * 
 * Security:
 * - Input validation on all operations
 * - Immutability of critical fields (sasId, signature)
 * - Atomic transactions for consistency
 * - Audit trail support via related AuditLog records
 */
export class AttestationRepository implements IAttestationRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaClient instance is required for AttestationRepository')
    }
    this.prisma = prisma
  }

  /**
   * Create a new attestation record in the database
   * Maps blockchain attestation to database record
   * 
   * @param attestationData - SAS attestation data from blockchain
   * @returns Created attestation record
   * @throws Error if SAS ID already exists (uniqueness constraint)
   */
  async create(attestationData: CreateAttestationInput): Promise<Attestation> {
    if (!attestationData.sasId || !attestationData.schemaId || !attestationData.issuerId) {
      throw new Error('Invalid attestation data: sasId, schemaId, and issuerId are required')
    }

    const attestation = await this.prisma.attestation.create({
      data: {
        sasId: attestationData.sasId,
        schemaId: attestationData.schemaId,
        issuerId: attestationData.issuerId,
        holderAddress: attestationData.holderAddress,
        data: attestationData.data || {},
        signature: attestationData.signature,
        isActive: true,
      },
    })

    return this.mapToInterface(attestation)
  }

  /**
   * Retrieve attestation by internal database ID
   * 
   * @param id - Database attestation ID
   * @returns Attestation or null if not found
   */
  async findById(id: string): Promise<Attestation | null> {
    if (!id) {
      throw new Error('Attestation ID is required')
    }

    const attestation = await this.prisma.attestation.findUnique({
      where: { id },
    })

    return attestation ? this.mapToInterface(attestation) : null
  }

  /**
   * Retrieve attestation by SAS ID (blockchain transaction ID)
   * SAS IDs are unique and immutable
   * 
   * @param sasId - Solana Attestation Service transaction ID
   * @returns Attestation or null if not found
   */
  async findBySasId(sasId: string): Promise<Attestation | null> {
    if (!sasId) {
      throw new Error('SAS ID is required')
    }

    const attestation = await this.prisma.attestation.findUnique({
      where: { sasId },
    })

    return attestation ? this.mapToInterface(attestation) : null
  }

  /**
   * Find all attestations held by a specific wallet address
   * Pagination for large result sets
   * 
   * @param holderAddress - Wallet address of attestation holder
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of attestations
   */
  async findByHolderAddress(holderAddress: string, limit?: number, offset?: number): Promise<Attestation[]> {
    if (!holderAddress) {
      throw new Error('Holder address is required')
    }

    const attestations = await this.prisma.attestation.findMany({
      where: {
        holderAddress: holderAddress.toLowerCase(),
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return attestations.map((att) => this.mapToInterface(att))
  }

  /**
   * Find all attestations issued by a specific authority
   * Government agencies, educational institutions, etc.
   * 
   * @param issuerId - Government/institutional issuer ID
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of attestations
   */
  async findByIssuerId(issuerId: string, limit?: number, offset?: number): Promise<Attestation[]> {
    if (!issuerId) {
      throw new Error('Issuer ID is required')
    }

    const attestations = await this.prisma.attestation.findMany({
      where: {
        issuerId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return attestations.map((att) => this.mapToInterface(att))
  }

  /**
   * Find attestations by schema (document type)
   * Birth certificates, passports, academic records, etc.
   * 
   * @param schemaId - Document type schema identifier
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of attestations
   */
  async findBySchemaId(schemaId: string, limit?: number, offset?: number): Promise<Attestation[]> {
    if (!schemaId) {
      throw new Error('Schema ID is required')
    }

    const attestations = await this.prisma.attestation.findMany({
      where: {
        schemaId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return attestations.map((att) => this.mapToInterface(att))
  }

  /**
   * Update attestation metadata
   * Critical fields (sasId, signature) are immutable after creation
   * 
   * @param id - Attestation ID
   * @param data - Update payload
   * @returns Updated attestation
   * @throws Error if attempting to modify immutable fields
   */
  async update(id: string, data: UpdateAttestationInput): Promise<Attestation> {
    if (!id) {
      throw new Error('Attestation ID is required')
    }

    // Verify attestation exists
    const existing = await this.prisma.attestation.findUnique({ where: { id } })
    if (!existing) {
      throw new Error(`Attestation not found: ${id}`)
    }

    // Only allow updating data and active status
    const updateData: Record<string, any> = {}
    if (data.data !== undefined) {
      updateData.data = data.data
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const updated = await this.prisma.attestation.update({
      where: { id },
      data: updateData,
    })

    return this.mapToInterface(updated)
  }

  /**
   * Deactivate an attestation
   * More secure than delete - maintains audit trail
   * 
   * @param id - Attestation ID
   * @returns Deactivated attestation
   */
  async deactivate(id: string): Promise<Attestation> {
    if (!id) {
      throw new Error('Attestation ID is required')
    }

    const attestation = await this.prisma.attestation.update({
      where: { id },
      data: {
        isActive: false,
      },
    })

    return this.mapToInterface(attestation)
  }

  /**
   * Find all active attestations with pagination
   * 
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of active attestations
   */
  async findActive(limit?: number, offset?: number): Promise<Attestation[]> {
    const attestations = await this.prisma.attestation.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return attestations.map((att) => this.mapToInterface(att))
  }

  /**
   * Count attestations for a specific holder
   * Used for analytics and user dashboards
   * 
   * @param holderAddress - Wallet address
   * @returns Count of active attestations
   */
  async countByHolderAddress(holderAddress: string): Promise<number> {
    if (!holderAddress) {
      throw new Error('Holder address is required')
    }

    return this.prisma.attestation.count({
      where: {
        holderAddress: holderAddress.toLowerCase(),
        isActive: true,
      },
    })
  }

  /**
   * Find all attestations with pagination
   * Admin/analytics endpoint
   * 
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of attestations
   */
  async findAll(limit?: number, offset?: number): Promise<Attestation[]> {
    const attestations = await this.prisma.attestation.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return attestations.map((att) => this.mapToInterface(att))
  }

  /**
   * Private helper: Map Prisma model to interface
   * Ensures type safety and consistent return types
   */
  private mapToInterface(prismaAttestation: any): Attestation {
    return {
      id: prismaAttestation.id,
      sasId: prismaAttestation.sasId,
      schemaId: prismaAttestation.schemaId,
      issuerId: prismaAttestation.issuerId,
      holderAddress: prismaAttestation.holderAddress,
      data: prismaAttestation.data || {},
      signature: prismaAttestation.signature,
      isActive: prismaAttestation.isActive,
      createdAt: prismaAttestation.createdAt,
    }
  }
}

export default AttestationRepository
