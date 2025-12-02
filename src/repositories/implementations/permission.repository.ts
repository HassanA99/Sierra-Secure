import { PrismaClient } from '@prisma/client'
import type { Permission, CreatePermissionInput, UpdatePermissionInput, PermissionType } from '@/types/document.types'
import type { IPermissionRepository } from '../interfaces/permission.repository.interface'

/**
 * PermissionRepository Implementation
 * Handles fine-grained access control for documents
 * Supports READ, SHARE, and VERIFY permissions with optional expiration
 * 
 * Security:
 * - Time-based access expiration
 * - Granular permission types (READ, SHARE, VERIFY)
 * - Active/inactive soft delete
 * - Audit trail via AuditLog
 * - Role-based access validation
 */
export class PermissionRepository implements IPermissionRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaClient instance is required for PermissionRepository')
    }
    this.prisma = prisma
  }

  /**
   * Grant permission to access a document
   * Creates access control entry for document sharing
   * 
   * @param permissionData - Permission grant data
   * @returns Created permission record
   * @throws Error if document or user doesn't exist
   */
  async create(permissionData: CreatePermissionInput): Promise<Permission> {
    if (!permissionData.userId || !permissionData.documentId || !permissionData.grantedTo) {
      throw new Error('Invalid permission data: userId, documentId, and grantedTo are required')
    }

    // Validate permission type
    const validTypes = ['READ', 'SHARE', 'VERIFY']
    if (!validTypes.includes(permissionData.accessType)) {
      throw new Error(`Invalid permission type: ${permissionData.accessType}`)
    }

    // Check document exists and belongs to user
    const document = await this.prisma.document.findUnique({
      where: { id: permissionData.documentId },
    })
    if (!document) {
      throw new Error(`Document not found: ${permissionData.documentId}`)
    }
    if (document.userId !== permissionData.userId) {
      throw new Error('User does not own this document')
    }

    // Check if permission already exists (prevent duplicates)
    const existing = await this.prisma.permission.findFirst({
      where: {
        documentId: permissionData.documentId,
        grantedTo: permissionData.grantedTo,
        accessType: permissionData.accessType,
        isActive: true,
      },
    })
    if (existing) {
      return this.mapToInterface(existing)
    }

    const permission = await this.prisma.permission.create({
      data: {
        userId: permissionData.userId,
        documentId: permissionData.documentId,
        grantedTo: permissionData.grantedTo,
        accessType: permissionData.accessType,
        expiresAt: permissionData.expiresAt,
        isActive: true,
      },
    })

    return this.mapToInterface(permission)
  }

  /**
   * Find permission by ID
   * 
   * @param id - Permission ID
   * @returns Permission record or null
   */
  async findById(id: string): Promise<Permission | null> {
    if (!id) {
      throw new Error('Permission ID is required')
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id },
    })

    return permission ? this.mapToInterface(permission) : null
  }

  /**
   * Find all permissions for a document
   * Shows who has access to a document
   * 
   * @param documentId - Document ID
   * @param onlyActive - Filter to active permissions only
   * @returns Array of permissions
   */
  async findByDocumentId(documentId: string, onlyActive: boolean = true): Promise<Permission[]> {
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        documentId,
        ...(onlyActive && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return permissions.map((p) => this.mapToInterface(p))
  }

  /**
   * Find all permissions granted by a user
   * Shows documents shared by this user
   * 
   * @param userId - User ID (document owner)
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of permissions
   */
  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Permission[]> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return permissions.map((p) => this.mapToInterface(p))
  }

  /**
   * Find all permissions granted to a specific address
   * Shows documents shared with this user
   * 
   * @param grantedTo - Recipient wallet address
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of permissions
   */
  async findByGrantedTo(grantedTo: string, limit?: number, offset?: number): Promise<Permission[]> {
    if (!grantedTo) {
      throw new Error('Granted to address is required')
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        grantedTo,
        isActive: true,
        expiresAt: {
          or: [
            { equals: null },
            { gt: new Date() }, // Not expired
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return permissions.map((p) => this.mapToInterface(p))
  }

  /**
   * Check if a specific permission exists
   * Used for access control validation
   * 
   * @param documentId - Document ID
   * @param grantedTo - Recipient address
   * @param accessType - Permission type (READ, SHARE, VERIFY)
   * @returns Permission or null
   */
  async findByDocumentAndRecipient(
    documentId: string,
    grantedTo: string,
    accessType: PermissionType
  ): Promise<Permission | null> {
    if (!documentId || !grantedTo || !accessType) {
      throw new Error('documentId, grantedTo, and accessType are required')
    }

    const permission = await this.prisma.permission.findFirst({
      where: {
        documentId,
        grantedTo,
        accessType,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    })

    return permission ? this.mapToInterface(permission) : null
  }

  /**
   * Update permission metadata
   * Can extend expiration, change status
   * 
   * @param id - Permission ID
   * @param data - Update payload
   * @returns Updated permission
   */
  async update(id: string, data: UpdatePermissionInput): Promise<Permission> {
    if (!id) {
      throw new Error('Permission ID is required')
    }

    const permission = await this.prisma.permission.update({
      where: { id },
      data: {
        expiresAt: data.expiresAt,
        isActive: data.isActive,
      },
    })

    return this.mapToInterface(permission)
  }

  /**
   * Revoke a permission
   * Soft delete via isActive flag
   * 
   * @param id - Permission ID
   * @returns Revoked permission
   */
  async revoke(id: string): Promise<Permission> {
    if (!id) {
      throw new Error('Permission ID is required')
    }

    const permission = await this.prisma.permission.update({
      where: { id },
      data: { isActive: false },
    })

    return this.mapToInterface(permission)
  }

  /**
   * Delete a permission permanently
   * Complete removal (irreversible)
   * 
   * @param id - Permission ID
   * @returns void
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('Permission ID is required')
    }

    await this.prisma.permission.delete({
      where: { id },
    })
  }

  /**
   * Revoke all permissions for a document
   * User withdraws all sharing
   * 
   * @param documentId - Document ID
   * @param userId - User ID (owner verification)
   * @returns Count of revoked permissions
   */
  async revokeByDocument(documentId: string, userId: string): Promise<number> {
    if (!documentId || !userId) {
      throw new Error('documentId and userId are required')
    }

    // Verify user owns the document
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    })
    if (!document || document.userId !== userId) {
      throw new Error('Unauthorized: User does not own this document')
    }

    const result = await this.prisma.permission.updateMany({
      where: { documentId },
      data: { isActive: false },
    })

    return result.count
  }

  /**
   * Count active permissions for a document
   * Shows how many people have access
   * 
   * @param documentId - Document ID
   * @returns Count of active permissions
   */
  async countByDocument(documentId: string): Promise<number> {
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    return this.prisma.permission.count({
      where: {
        documentId,
        isActive: true,
      },
    })
  }

  /**
   * Count permissions granted by a user
   * Shows how many documents they've shared
   * 
   * @param userId - User ID
   * @returns Count of permissions
   */
  async countByUser(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return this.prisma.permission.count({
      where: {
        userId,
        isActive: true,
      },
    })
  }

  /**
   * Find permissions expiring soon
   * For notification purposes
   * 
   * @param withinDays - Days until expiration
   * @param limit - Results per page
   * @returns Array of permissions
   */
  async findExpiringsoon(withinDays: number = 7, limit?: number): Promise<Permission[]> {
    const now = new Date()
    const expiryDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

    const permissions = await this.prisma.permission.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: expiryDate,
          gt: now,
        },
      },
      orderBy: { expiresAt: 'asc' },
      take: limit,
    })

    return permissions.map((p) => this.mapToInterface(p))
  }

  /**
   * Remove expired permissions
   * Cleanup task for inactive permissions
   * 
   * @returns Count of deactivated permissions
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.permission.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: { isActive: false },
    })

    return result.count
  }

  /**
   * Private helper: Map Prisma model to interface
   */
  private mapToInterface(prismaPermission: any): Permission {
    return {
      id: prismaPermission.id,
      userId: prismaPermission.userId,
      documentId: prismaPermission.documentId,
      grantedTo: prismaPermission.grantedTo,
      accessType: prismaPermission.accessType,
      expiresAt: prismaPermission.expiresAt,
      isActive: prismaPermission.isActive,
      createdAt: prismaPermission.createdAt,
    }
  }
}

export default PermissionRepository
