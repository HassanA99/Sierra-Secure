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
  id: string
  sasId: string
  schemaId: string
  issuerId: string
  holderAddress: string
  data: Record<string, any>
  signature: string
  transactionHash: string
  blockNumber: string
  timestamp: Date
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
  properties?: Record<string, any>
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

export interface NFTResult {
  mintAddress: string
  ownerAddress: string
  metadataUri: string
  collectionId?: string
  transactionHash: string
  blockNumber: string
  timestamp: Date
}

export interface TransactionResult {
  signature: string
  blockNumber: string
  status: 'success' | 'failed' | 'pending'
  timestamp: Date
}

export interface TransactionDetails {
  signature: string
  blockNumber: string
  slot: number
  confirmations: number
  fee: number
  status: 'success' | 'failed' | 'pending'
  timestamp: Date
  logs?: string[]
}

export interface VerificationResult {
  isValid: boolean
  status: 'verified' | 'invalid' | 'expired' | 'revoked'
  verifiedAt: Date
  verifier?: string
  details?: Record<string, any>
}