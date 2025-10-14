export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    VERIFY: '/api/auth/verify',
    REFRESH: '/api/auth/refresh'
  },
  DOCUMENTS: {
    BASE: '/api/documents',
    BY_ID: (id: string) => `/api/documents/${id}`,
    ISSUE: (id: string) => `/api/documents/${id}/issue`,
    VERIFY: (id: string) => `/api/documents/${id}/verify`,
    SHARE: (id: string) => `/api/documents/${id}/share`,
    REVOKE_SHARE: (id: string, address: string) => `/api/documents/${id}/share/${address}`
  },
  ATTESTATIONS: {
    BASE: '/api/attestations',
    BY_ID: (id: string) => `/api/attestations/${id}`
  },
  NFTS: {
    BASE: '/api/nfts',
    BY_MINT: (mintAddress: string) => `/api/nfts/${mintAddress}`,
    TRANSFER: (mintAddress: string) => `/api/nfts/${mintAddress}/transfer`
  },
  VERIFICATION: {
    DOCUMENT: '/api/verify/document',
    ATTESTATION: '/api/verify/attestation',
    NFT: '/api/verify/nft',
    PUBLIC: (hash: string) => `/api/verify/public/${hash}`
  }
} as const

export const BLOCKCHAIN_NETWORKS = {
  SOLANA_MAINNET: 'mainnet-beta',
  SOLANA_DEVNET: 'devnet',
  SOLANA_TESTNET: 'testnet'
} as const

export const DOCUMENT_CATEGORIES = {
  IDENTITY: ['BIRTH_CERTIFICATE', 'NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE'],
  OWNERSHIP: ['LAND_TITLE', 'PROPERTY_DEED', 'VEHICLE_REGISTRATION'],
  CERTIFICATION: ['PROFESSIONAL_LICENSE', 'ACADEMIC_CERTIFICATE']
} as const

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ENCRYPTION_ALGORITHM: 'aes-256-gcm'
} as const

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0
} as const

export const CACHE_KEYS = {
  USER_BY_ID: (id: string) => `user:${id}`,
  DOCUMENT_BY_ID: (id: string) => `document:${id}`,
  ATTESTATION_BY_ID: (id: string) => `attestation:${id}`,
  NFT_BY_MINT: (mint: string) => `nft:${mint}`,
  VERIFICATION: (hash: string) => `verification:${hash}`
} as const

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Document errors
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DOCUMENT_ACCESS_DENIED: 'DOCUMENT_ACCESS_DENIED',
  DOCUMENT_ALREADY_ISSUED: 'DOCUMENT_ALREADY_ISSUED',
  INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
  
  // Blockchain errors
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  ATTESTATION_FAILED: 'ATTESTATION_FAILED',
  NFT_MINT_FAILED: 'NFT_MINT_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Verification errors
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  DOCUMENT_REVOKED: 'DOCUMENT_REVOKED',
  
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ISSUER: 'nddv-app',
  AUDIENCE: 'nddv-users'
} as const

export const SOLANA_CONFIG = {
  COMMITMENT: 'confirmed' as const,
  PREFLIGHT_COMMITMENT: 'processed' as const,
  MAX_RETRIES: 3,
  CONFIRMATION_TIMEOUT: 30000, // 30 seconds
  AIRDROP_AMOUNT: 1 * 1000000000 // 1 SOL in lamports for devnet testing
} as const