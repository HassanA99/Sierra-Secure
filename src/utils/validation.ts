import { DocumentType, PermissionType } from '@/types/document.types'
import { FILE_CONSTRAINTS } from './constants'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateSolanaAddress = (address: string): boolean => {
  // Basic Solana address validation (44 characters, base58)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

export const validatePrivyId = (privyId: string): boolean => {
  // Privy ID format validation
  return privyId.length > 0 && privyId.startsWith('privy:')
}

export const validateDocumentType = (type: string): type is DocumentType => {
  return Object.values(DocumentType).includes(type as DocumentType)
}

export const validatePermissionType = (type: string): type is PermissionType => {
  return Object.values(PermissionType).includes(type as PermissionType)
}

export const validateFileSize = (size: number): boolean => {
  return size > 0 && size <= FILE_CONSTRAINTS.MAX_FILE_SIZE
}

export const validateMimeType = (mimeType: string): boolean => {
  return FILE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(mimeType)
}

export const validateFileHash = (hash: string): boolean => {
  // Validate SHA-256 hash format (64 hexadecimal characters)
  const sha256Regex = /^[a-f0-9]{64}$/i
  return sha256Regex.test(hash)
}

export const validateIPFSHash = (hash: string): boolean => {
  // Basic IPFS hash validation (starts with Qm and 46 characters)
  const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
  return ipfsRegex.test(hash)
}

export const validateArweaveHash = (hash: string): boolean => {
  // Arweave transaction ID validation (43 characters, base64url)
  const arweaveRegex = /^[A-Za-z0-9_-]{43}$/
  return arweaveRegex.test(hash)
}

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate < endDate && endDate > new Date()
}

export const validatePaginationParams = (limit?: number, offset?: number): {
  validLimit: number
  validOffset: number
} => {
  const validLimit = Math.min(Math.max(limit || 20, 1), 100)
  const validOffset = Math.max(offset || 0, 0)
  return { validLimit, validOffset }
}

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export const validateMetadata = (metadata: Record<string, any>): boolean => {
  // Validate metadata object structure and content
  if (!metadata || typeof metadata !== 'object') return false
  
  // Check for required fields based on NFT metadata standard
  const requiredFields = ['name', 'description']
  return requiredFields.every(field => field in metadata && typeof metadata[field] === 'string')
}

export const validateWalletSignature = (message: string, signature: string, publicKey: string): boolean => {
  // This would implement actual signature verification
  // For now, just basic format validation
  return signature.length > 0 && publicKey.length > 0 && message.length > 0
}

export interface ValidationError {
  field: string
  message: string
}

export const validateCreateDocumentInput = (input: any): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required and must be a non-empty string' })
  }

  if (!validateDocumentType(input.type)) {
    errors.push({ field: 'type', message: 'Invalid document type' })
  }

  if (!input.fileHash || !validateFileHash(input.fileHash)) {
    errors.push({ field: 'fileHash', message: 'Valid file hash is required' })
  }

  if (!input.mimeType || !validateMimeType(input.mimeType)) {
    errors.push({ field: 'mimeType', message: 'Invalid or unsupported MIME type' })
  }

  if (!validateFileSize(input.fileSize)) {
    errors.push({ field: 'fileSize', message: 'File size exceeds maximum allowed limit' })
  }

  if (input.expiresAt && new Date(input.expiresAt) <= new Date()) {
    errors.push({ field: 'expiresAt', message: 'Expiration date must be in the future' })
  }

  return errors
}

export const validateShareDocumentInput = (input: any): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!input.recipientAddress || !validateSolanaAddress(input.recipientAddress)) {
    errors.push({ field: 'recipientAddress', message: 'Valid recipient wallet address is required' })
  }

  if (!validatePermissionType(input.accessType)) {
    errors.push({ field: 'accessType', message: 'Invalid access type' })
  }

  if (input.expiresAt && new Date(input.expiresAt) <= new Date()) {
    errors.push({ field: 'expiresAt', message: 'Expiration date must be in the future' })
  }

  return errors
}