import { Permission, CreatePermissionInput, PermissionType } from '@/types/document.types'

export interface UpdatePermissionInput {
  accessType?: PermissionType
  expiresAt?: Date
  isActive?: boolean
}

export interface IPermissionRepository {
  create(permissionData: CreatePermissionInput): Promise<Permission>
  findById(id: string): Promise<Permission | null>
  findByDocumentId(documentId: string, limit?: number, offset?: number): Promise<Permission[]>
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Permission[]>
  findByGrantedTo(grantedTo: string, limit?: number, offset?: number): Promise<Permission[]>
  findByDocumentAndGrantedTo(documentId: string, grantedTo: string): Promise<Permission | null>
  update(id: string, data: UpdatePermissionInput): Promise<Permission>
  revoke(id: string): Promise<Permission>
  revokeByDocumentAndGrantedTo(documentId: string, grantedTo: string): Promise<void>
  findActive(limit?: number, offset?: number): Promise<Permission[]>
  findExpired(limit?: number, offset?: number): Promise<Permission[]>
  cleanupExpired(): Promise<number>
  hasPermission(documentId: string, grantedTo: string, accessType: PermissionType): Promise<boolean>
}