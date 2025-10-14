export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthUser {
  id: string
  privyId: string
  walletAddress: string
  email?: string
  firstName: string
  lastName: string
  isVerified: boolean
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, any>
  statusCode?: number
}

// Request types for API endpoints
export interface CreateDocumentRequest {
  type: string
  title: string
  description?: string
  fileHash: string
  encryptedData?: string
  mimeType: string
  fileSize: number
  blockchainType: string
  issuedAt?: string
  expiresAt?: string
}

export interface UpdateDocumentRequest {
  title?: string
  description?: string
  status?: string
}

export interface ShareDocumentRequest {
  recipientAddress: string
  accessType: string
  expiresAt?: string
}

export interface VerifyDocumentRequest {
  documentId?: string
  fileHash?: string
  attestationId?: string
  nftMintAddress?: string
}