export interface AttestationSchema {
  id: string
  name: string
  description: string
  fields: AttestationField[]
}

export interface AttestationField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date'
  required: boolean
  description?: string
}

export interface AttestationResult {
  success?: boolean
  id?: string
  attestationId?: string // Alias for sasId
  sasId?: string
  schemaId?: string
  issuerId?: string
  issuerAddress?: string
  holderAddress: string
  data?: Record<string, any>
  signature?: string
  transactionSignature: string
  blockNumber: number | string
  timestamp: Date
  confirmationStatus?: string
}

export interface NFTMetadata {
  name: string
  symbol?: string
  description: string
  image: string
  attributes: NFTAttribute[]
  properties?: Record<string, any>
  uri?: string
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

export interface NFTResult {
  success?: boolean
  mintAddress: string
  ownerAddress: string
  metadataUri: string
  collectionId?: string
  transactionSignature: string
  blockNumber: number | string
  timestamp: Date
  confirmationStatus?: string
  attributes?: NFTAttribute[]
}

export interface TransactionResult {
  success?: boolean
  signature: string
  transactionSignature?: string
  fromAddress?: string
  toAddress?: string
  blockNumber: number | string
  status: 'success' | 'failed' | 'pending' | 'confirmed' | 'finalized'
  confirmationStatus?: string
  timestamp: Date
}

export interface TransactionDetails {
  signature: string
  blockNumber: number | string
  slot: number
  confirmations: number
  fee: number
  status: 'success' | 'failed' | 'pending' | 'confirmed' | 'finalized'
  timestamp: Date
  instructions?: any[]
  logs?: string[]
}

export interface VerificationResult {
  isValid: boolean
  status: 'verified' | 'invalid' | 'expired' | 'revoked'
  verifiedAt: Date
  verifier?: string
  details?: Record<string, any>
}