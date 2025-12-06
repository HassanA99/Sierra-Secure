import { NextResponse } from 'next/server'

/**
 * Validation utilities for API routes
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates wallet address format (Solana)
 */
export function validateWalletAddress(address: string): boolean {
  // Solana addresses are base58 encoded, typically 32-44 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return solanaAddressRegex.test(address)
}

/**
 * Validates document ID format
 */
export function validateDocumentId(id: string): boolean {
  // Document IDs start with 'doc_' followed by UUID
  const documentIdRegex = /^doc_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return documentIdRegex.test(id)
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number format (international)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validates Arweave transaction ID
 */
export function validateArweaveTransactionId(txId: string): boolean {
  // Arweave transaction IDs are base64url encoded, 43 characters
  const arweaveTxRegex = /^[A-Za-z0-9_-]{43}$/
  return arweaveTxRegex.test(txId)
}

/**
 * Validates pagination parameters
 */
export function validatePagination(skip?: number, take?: number): ValidationResult {
  const errors: string[] = []

  if (skip !== undefined) {
    if (typeof skip !== 'number' || skip < 0 || !Number.isInteger(skip)) {
      errors.push('skip must be a non-negative integer')
    }
  }

  if (take !== undefined) {
    if (typeof take !== 'number' || take < 1 || take > 100 || !Number.isInteger(take)) {
      errors.push('take must be an integer between 1 and 100')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates document type
 */
export function validateDocumentType(type: string): boolean {
  const validTypes = [
    'BIRTH_CERTIFICATE',
    'NATIONAL_ID',
    'PASSPORT',
    'DRIVERS_LICENSE',
    'LAND_TITLE',
    'PROPERTY_DEED',
    'VEHICLE_REGISTRATION',
    'PROFESSIONAL_LICENSE',
    'ACADEMIC_CERTIFICATE',
  ]
  return validTypes.includes(type)
}

/**
 * Validates permission type
 */
export function validatePermissionType(type: string): boolean {
  const validTypes = ['READ', 'SHARE', 'VERIFY']
  return validTypes.includes(type)
}

/**
 * Validates user role
 */
export function validateUserRole(role: string): boolean {
  const validRoles = ['CITIZEN', 'VERIFIER', 'ISSUER', 'MAKER', 'ADMIN']
  return validRoles.includes(role)
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 1000) // Limit length
}

/**
 * Validates file upload
 */
export function validateFileUpload(file: File | null): ValidationResult {
  const errors: string[] = []

  if (!file) {
    errors.push('File is required')
    return { valid: false, errors }
  }

  // Check file size (50MB max)
  const MAX_FILE_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Check MIME type
  const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!validMimeTypes.includes(file.type)) {
    errors.push('Invalid file type. Supported: JPEG, PNG, PDF')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Returns validation error response
 */
export function validationErrorResponse(errors: string[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  )
}
