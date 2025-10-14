export interface NFTRecord {
  id: string
  mintAddress: string
  ownerAddress: string
  metadataUri: string
  collectionId?: string | null
  attributes: Record<string, any>
  isTransferable: boolean
  createdAt: Date
}

export interface NFTTransaction {
  id: string
  nftMintAddress: string
  fromAddress: string
  toAddress: string
  transactionHash: string
  blockNumber: string
  timestamp: Date
}

export interface CreateNFTRecordInput {
  mintAddress: string
  ownerAddress: string
  metadataUri: string
  collectionId?: string
  attributes: Record<string, any>
  isTransferable?: boolean
}

export interface UpdateNFTRecordInput {
  ownerAddress?: string
  metadataUri?: string
  attributes?: Record<string, any>
  isTransferable?: boolean
}

export interface CreateNFTTransactionInput {
  nftMintAddress: string
  fromAddress: string
  toAddress: string
  transactionHash: string
  blockNumber: string
  timestamp: Date
}

export interface INFTRepository {
  create(nftData: CreateNFTRecordInput): Promise<NFTRecord>
  findById(id: string): Promise<NFTRecord | null>
  findByMintAddress(mintAddress: string): Promise<NFTRecord | null>
  findByOwnerAddress(ownerAddress: string, limit?: number, offset?: number): Promise<NFTRecord[]>
  findByCollectionId(collectionId: string, limit?: number, offset?: number): Promise<NFTRecord[]>
  update(id: string, data: UpdateNFTRecordInput): Promise<NFTRecord>
  delete(id: string): Promise<void>
  updateOwner(mintAddress: string, newOwnerAddress: string): Promise<NFTRecord>
  findTransferable(limit?: number, offset?: number): Promise<NFTRecord[]>
  countByOwnerAddress(ownerAddress: string): Promise<number>
  
  // Transaction methods
  createTransaction(transactionData: CreateNFTTransactionInput): Promise<NFTTransaction>
  findTransactionsByNFT(nftMintAddress: string, limit?: number, offset?: number): Promise<NFTTransaction[]>
  findTransactionsByAddress(address: string, limit?: number, offset?: number): Promise<NFTTransaction[]>
  findTransactionByHash(transactionHash: string): Promise<NFTTransaction | null>
}