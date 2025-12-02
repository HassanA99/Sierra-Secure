/**
 * Validation utilities for common patterns
 */

export const validators = {
  /**
   * Validate Solana address format (base58, 32-44 chars)
   */
  isSolanaAddress: (address: string): boolean => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Z]{32,44}$/
    return solanaAddressRegex.test(address)
  },

  /**
   * Validate email format
   */
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate file size in MB
   */
  isFileSizeValid: (sizeMB: number, maxSizeMB: number = 50): boolean => {
    return sizeMB <= maxSizeMB
  },

  /**
   * Validate MIME type
   */
  isMimeTypeValid: (mimeType: string, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']): boolean => {
    return allowedTypes.includes(mimeType)
  },

  /**
   * Validate UUID format
   */
  isUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  /**
   * Validate permission type
   */
  isPermissionType: (type: string): boolean => {
    return ['READ', 'SHARE', 'VERIFY'].includes(type)
  },
}
