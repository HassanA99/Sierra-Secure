export enum DocumentType {
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  LAND_TITLE = 'LAND_TITLE',
  PROPERTY_DEED = 'PROPERTY_DEED',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  PROFESSIONAL_LICENSE = 'PROFESSIONAL_LICENSE',
  ACADEMIC_CERTIFICATE = 'ACADEMIC_CERTIFICATE'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum BlockchainType {
  SAS_ATTESTATION = 'SAS_ATTESTATION',
  NFT_METAPLEX = 'NFT_METAPLEX'
}

export enum PermissionType {
  READ = 'READ',
  SHARE = 'SHARE',
  VERIFY = 'VERIFY'
}

export interface CreateDocumentInput {
  userId: string
  type: DocumentType
  title: string
  description?: string
  fileHash: string
  encryptedData?: string
  mimeType: string
  fileSize: number
  blockchainType: BlockchainType
  issuedAt?: Date
  expiresAt?: Date
}

export interface UpdateDocumentInput {
  title?: string
  description?: string
  status?: DocumentStatus
  attestationId?: string
  nftMintAddress?: string
  issuedAt?: Date
  expiresAt?: Date
}

export interface Document {
  id: string
  userId: string
  type: DocumentType
  title: string
  description?: string | null
  status: DocumentStatus
  fileHash: string
  encryptedData?: string | null
  mimeType: string
  fileSize: number
  attestationId?: string | null
  nftMintAddress?: string | null
  blockchainType: BlockchainType
  issuedAt?: Date | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  userId: string
  documentId: string
  grantedTo: string
  accessType: PermissionType
  expiresAt?: Date | null
  isActive: boolean
  createdAt: Date
}

export interface CreatePermissionInput {
  userId: string
  documentId: string
  grantedTo: string
  accessType: PermissionType
  expiresAt?: Date
}