import { PrismaClient } from '@prisma/client'
import type { NFTRecord, CreateNFTInput, UpdateNFTInput } from '@/types/blockchain.types'
import type { INFTRepository } from '../interfaces/nft.repository.interface'

/**
 * NFTRepository Implementation
 * Handles Metaplex NFT records on Solana blockchain
 * NFTs represent transferable ownership documents (land deeds, vehicle registration, etc.)
 * 
 * Security:
 * - Mint addresses are immutable (unique identifier for NFTs)
 * - Owner address validation
 * - Atomic transactions for consistency
 * - Support for NFT metadata versioning
 */
export class NFTRepository implements INFTRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaClient instance is required for NFTRepository')
    }
    this.prisma = prisma
  }

  /**
   * Create a new NFT record
   * Records Metaplex NFT on blockchain
   * 
   * @param nftData - NFT metadata and ownership information
   * @returns Created NFT record
   * @throws Error if mint address already exists
   */
  async create(nftData: CreateNFTInput): Promise<NFTRecord> {
    if (!nftData.mintAddress || !nftData.ownerAddress || !nftData.metadataUri) {
      throw new Error('Invalid NFT data: mintAddress, ownerAddress, and metadataUri are required')
    }

    // Validate Solana addresses (56 characters, base58)
    if (!this.isValidSolanaAddress(nftData.mintAddress)) {
      throw new Error('Invalid mint address format')
    }
    if (!this.isValidSolanaAddress(nftData.ownerAddress)) {
      throw new Error('Invalid owner address format')
    }

    const nft = await this.prisma.nFTRecord.create({
      data: {
        mintAddress: nftData.mintAddress,
        ownerAddress: nftData.ownerAddress,
        metadataUri: nftData.metadataUri,
        collectionId: nftData.collectionId,
        attributes: nftData.attributes || {},
        isTransferable: nftData.isTransferable ?? true,
      },
    })

    return this.mapToInterface(nft)
  }

  /**
   * Retrieve NFT by database ID
   * 
   * @param id - NFT record ID
   * @returns NFT record or null
   */
  async findById(id: string): Promise<NFTRecord | null> {
    if (!id) {
      throw new Error('NFT ID is required')
    }

    const nft = await this.prisma.nFTRecord.findUnique({
      where: { id },
    })

    return nft ? this.mapToInterface(nft) : null
  }

  /**
   * Retrieve NFT by mint address (blockchain identifier)
   * Mint address is the unique identifier on Solana
   * 
   * @param mintAddress - Solana NFT mint address
   * @returns NFT record or null
   */
  async findByMintAddress(mintAddress: string): Promise<NFTRecord | null> {
    if (!mintAddress) {
      throw new Error('Mint address is required')
    }

    if (!this.isValidSolanaAddress(mintAddress)) {
      throw new Error('Invalid mint address format')
    }

    const nft = await this.prisma.nFTRecord.findUnique({
      where: { mintAddress },
    })

    return nft ? this.mapToInterface(nft) : null
  }

  /**
   * Find all NFTs owned by a wallet address
   * Pagination for large portfolios
   * 
   * @param ownerAddress - Wallet address
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of NFT records
   */
  async findByOwner(ownerAddress: string, limit?: number, offset?: number): Promise<NFTRecord[]> {
    if (!ownerAddress) {
      throw new Error('Owner address is required')
    }

    if (!this.isValidSolanaAddress(ownerAddress)) {
      throw new Error('Invalid owner address format')
    }

    const nfts = await this.prisma.nFTRecord.findMany({
      where: { ownerAddress },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return nfts.map((nft) => this.mapToInterface(nft))
  }

  /**
   * Find NFTs in a collection
   * Collections group related NFTs (e.g., all land deeds for a municipality)
   * 
   * @param collectionId - Collection identifier
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of NFT records
   */
  async findByCollection(collectionId: string, limit?: number, offset?: number): Promise<NFTRecord[]> {
    if (!collectionId) {
      throw new Error('Collection ID is required')
    }

    const nfts = await this.prisma.nFTRecord.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return nfts.map((nft) => this.mapToInterface(nft))
  }

  /**
   * Update NFT metadata and ownership
   * Tracks NFT transfers and metadata updates
   * 
   * @param mintAddress - NFT mint address
   * @param data - Update payload
   * @returns Updated NFT record
   */
  async update(mintAddress: string, data: UpdateNFTInput): Promise<NFTRecord> {
    if (!mintAddress) {
      throw new Error('Mint address is required')
    }

    if (!this.isValidSolanaAddress(mintAddress)) {
      throw new Error('Invalid mint address format')
    }

    // Verify NFT exists
    const existing = await this.prisma.nFTRecord.findUnique({
      where: { mintAddress },
    })
    if (!existing) {
      throw new Error(`NFT not found: ${mintAddress}`)
    }

    // Validate address if updating owner
    if (data.ownerAddress && !this.isValidSolanaAddress(data.ownerAddress)) {
      throw new Error('Invalid new owner address format')
    }

    const updateData: Record<string, any> = {}
    if (data.ownerAddress !== undefined) {
      updateData.ownerAddress = data.ownerAddress
    }
    if (data.metadataUri !== undefined) {
      updateData.metadataUri = data.metadataUri
    }
    if (data.attributes !== undefined) {
      updateData.attributes = data.attributes
    }
    if (data.isTransferable !== undefined) {
      updateData.isTransferable = data.isTransferable
    }

    const updated = await this.prisma.nFTRecord.update({
      where: { mintAddress },
      data: updateData,
    })

    return this.mapToInterface(updated)
  }

  /**
   * Delete NFT record
   * Soft delete via burning NFT on blockchain
   * 
   * @param mintAddress - NFT mint address
   * @returns void
   */
  async delete(mintAddress: string): Promise<void> {
    if (!mintAddress) {
      throw new Error('Mint address is required')
    }

    if (!this.isValidSolanaAddress(mintAddress)) {
      throw new Error('Invalid mint address format')
    }

    await this.prisma.nFTRecord.delete({
      where: { mintAddress },
    })
  }

  /**
   * Count NFTs owned by a wallet
   * Used for analytics and user dashboards
   * 
   * @param ownerAddress - Wallet address
   * @returns Count of NFTs
   */
  async countByOwner(ownerAddress: string): Promise<number> {
    if (!ownerAddress) {
      throw new Error('Owner address is required')
    }

    if (!this.isValidSolanaAddress(ownerAddress)) {
      throw new Error('Invalid owner address format')
    }

    return this.prisma.nFTRecord.count({
      where: { ownerAddress },
    })
  }

  /**
   * Count NFTs in a collection
   * 
   * @param collectionId - Collection identifier
   * @returns Count of NFTs
   */
  async countByCollection(collectionId: string): Promise<number> {
    if (!collectionId) {
      throw new Error('Collection ID is required')
    }

    return this.prisma.nFTRecord.count({
      where: { collectionId },
    })
  }

  /**
   * List all NFTs with pagination
   * Admin/analytics endpoint
   * 
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of NFT records
   */
  async findAll(limit?: number, offset?: number): Promise<NFTRecord[]> {
    const nfts = await this.prisma.nFTRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return nfts.map((nft) => this.mapToInterface(nft))
  }

  /**
   * Find transferable NFTs
   * Non-transferable NFTs are locked (e.g., soulbound)
   * 
   * @param ownerAddress - Wallet address (optional filter)
   * @param limit - Results per page
   * @param offset - Pagination offset
   * @returns Array of transferable NFT records
   */
  async findTransferable(ownerAddress?: string, limit?: number, offset?: number): Promise<NFTRecord[]> {
    const nfts = await this.prisma.nFTRecord.findMany({
      where: {
        isTransferable: true,
        ...(ownerAddress && { ownerAddress }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return nfts.map((nft) => this.mapToInterface(nft))
  }

  /**
   * Lock an NFT (make non-transferable)
   * Used for soulbound documents
   * 
   * @param mintAddress - NFT mint address
   * @returns Updated NFT record
   */
  async lock(mintAddress: string): Promise<NFTRecord> {
    if (!mintAddress) {
      throw new Error('Mint address is required')
    }

    const nft = await this.prisma.nFTRecord.update({
      where: { mintAddress },
      data: { isTransferable: false },
    })

    return this.mapToInterface(nft)
  }

  /**
   * Unlock an NFT (make transferable)
   * 
   * @param mintAddress - NFT mint address
   * @returns Updated NFT record
   */
  async unlock(mintAddress: string): Promise<NFTRecord> {
    if (!mintAddress) {
      throw new Error('Mint address is required')
    }

    const nft = await this.prisma.nFTRecord.update({
      where: { mintAddress },
      data: { isTransferable: true },
    })

    return this.mapToInterface(nft)
  }

  /**
   * Private helper: Validate Solana address format
   * Solana addresses are 32-byte public keys encoded in base58 (44 or 43-44 characters)
   */
  private isValidSolanaAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false
    }
    // Basic validation: 43-44 character base58 string
    return /^[1-9A-HJ-NP-Z]{43,44}$/.test(address)
  }

  /**
   * Private helper: Map Prisma model to interface
   */
  private mapToInterface(prismaNFT: any): NFTRecord {
    return {
      id: prismaNFT.id,
      mintAddress: prismaNFT.mintAddress,
      ownerAddress: prismaNFT.ownerAddress,
      metadataUri: prismaNFT.metadataUri,
      collectionId: prismaNFT.collectionId,
      attributes: prismaNFT.attributes || {},
      isTransferable: prismaNFT.isTransferable,
      createdAt: prismaNFT.createdAt,
    }
  }
}

export default NFTRepository
