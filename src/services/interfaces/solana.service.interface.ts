import { AttestationSchema, AttestationResult, NFTMetadata, NFTResult, TransactionResult, TransactionDetails, VerificationResult } from '@/types/blockchain.types'

export interface CreateAttestationInput {
  schema: AttestationSchema
  data: Record<string, any>
  holderAddress: string
  issuerId: string
}

export interface UpdateAttestationInput {
  attestationId: string
  data: Record<string, any>
  issuerId: string
}

export interface MintNFTInput {
  metadata: NFTMetadata
  ownerAddress: string
  collectionId?: string
}

export interface TransferNFTInput {
  mintAddress: string
  fromAddress: string
  toAddress: string
  ownerPrivateKey: string // This would be handled securely in production
}

export interface ISolanaService {
  // Connection and network
  getConnection(): any // Connection from @solana/web3.js
  getNetworkInfo(): Promise<{ cluster: string; blockHeight: number; epochInfo: any }>
  
  // SAS (Solana Attestation Service) operations
  createAttestation(input: CreateAttestationInput): Promise<AttestationResult>
  verifyAttestation(attestationId: string): Promise<VerificationResult>
  updateAttestation(input: UpdateAttestationInput): Promise<AttestationResult>
  revokeAttestation(attestationId: string, issuerId: string): Promise<TransactionResult>
  getAttestation(attestationId: string): Promise<AttestationResult | null>
  getAttestationsByHolder(holderAddress: string): Promise<AttestationResult[]>
  getAttestationsByIssuer(issuerId: string): Promise<AttestationResult[]>
  
  // NFT operations (Metaplex)
  mintNFT(input: MintNFTInput): Promise<NFTResult>
  transferNFT(input: TransferNFTInput): Promise<TransactionResult>
  updateNFTMetadata(mintAddress: string, metadata: NFTMetadata, ownerAddress: string): Promise<NFTResult>
  getNFTMetadata(mintAddress: string): Promise<NFTMetadata | null>
  getNFTsByOwner(ownerAddress: string): Promise<NFTResult[]>
  burnNFT(mintAddress: string, ownerAddress: string): Promise<TransactionResult>
  
  // Verification operations
  verifyNFTOwnership(mintAddress: string, ownerAddress: string): Promise<boolean>
  verifyAttestationSignature(attestationId: string, signature: string, issuerId: string): Promise<boolean>
  
  // Transaction and blockchain utilities
  getTransaction(signature: string): Promise<TransactionDetails | null>
  getAccountBalance(publicKey: string): Promise<number>
  airdropSol(publicKey: string, amount: number): Promise<TransactionResult> // For devnet testing
  
  // Wallet utilities
  generateKeypair(): { publicKey: string; privateKey: string }
  validateAddress(address: string): boolean
  
  // Storage integration (Arweave/IPFS)
  uploadToArweave(data: Buffer, contentType: string): Promise<string>
  uploadMetadataToArweave(metadata: NFTMetadata): Promise<string>
  downloadFromArweave(transactionId: string): Promise<Buffer>
}