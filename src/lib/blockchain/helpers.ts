/**
 * Blockchain utilities - Solana address validation and formatting
 */

export const blockchainUtils = {
  /**
   * Validate Solana address format
   */
  isValidSolanaAddress: (address: string): boolean => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Z]{32,44}$/
    return solanaAddressRegex.test(address)
  },

  /**
   * Normalize Solana address (trim and uppercase if needed)
   */
  normalizeSolanaAddress: (address: string): string => {
    return address.trim()
  },

  /**
   * Check if address is likely a Solana address (starts with number/letter typical for base58)
   */
  looksLikeSolanaAddress: (address: string): boolean => {
    return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Z]/.test(address)
  },

  /**
   * Format mint address for display
   */
  formatMintAddress: (mint: string, chars: number = 8): string => {
    if (mint.length <= chars * 2) return mint
    return `${mint.substring(0, chars)}...${mint.substring(mint.length - chars)}`
  },

  /**
   * Parse blockchain transaction hash
   */
  parseTransactionHash: (hash: string): string => {
    return hash.substring(0, 8) + '...'
  },
}
