/**
 * STEP 1: NFT MINTING
 * 
 * When document is auto-approved:
 * 1. Government mints NFT
 * 2. NFT sent to citizen's embedded wallet
 * 3. Citizen owns proof (can't lose it)
 * 4. Government pays the fee
 * 5. Citizen sees: "🎖️ Digital Seal (NFT)"
 */

import { Metaplex, bundlrStorage } from '@metaplex-foundation/js'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getGovernmentWalletService } from './government-wallet-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SOLANA_CLUSTER = (process.env.SOLANA_CLUSTER as any) || 'devnet'
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_CLUSTER)

export class NFTMintingService {
  private connection: Connection
  private metaplex: Metaplex

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed')
    this.metaplex = Metaplex.make(this.connection)
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: RPC_URL,
        timeout: 60000,
      }))
  }

  /**
   * Mint NFT as government digital seal
   * Sent to citizen's embedded wallet
   * Government pays the fee
   */
  async mintGovernmentSeal(
    documentId: string,
    citizenWalletAddress: string,
    documentType: string,
    documentHash: string,
  ): Promise<{
    nftMintAddress: string
    nftUri: string
    transactionSignature: string
  }> {
    try {
      const govWallet = getGovernmentWalletService()

      // Create NFT metadata
      const nftUri = await this.uploadNFTMetadata({
        name: `Government Digital Seal - ${documentType}`,
        description: `Official government verification for ${documentType}`,
        image: 'https://your-domain.com/government-seal.png', // TODO: Generate SVG
        documentHash,
        documentId,
        documentType,
        issuedAt: new Date().toISOString(),
        issuer: 'Ministry of Digital Identity',
        attributes: [
          { trait_type: 'Document Type', value: documentType },
          { trait_type: 'Verified', value: 'true' },
          { trait_type: 'Blockchain', value: 'Solana' },
          { trait_type: 'Government Backed', value: 'true' },
        ],
      })

      // Mint NFT to citizen's wallet
      const { nft } = await this.metaplex.nfts().create({
        uri: nftUri,
        name: `Gov Seal - ${documentType}`,
        sellerFeeBasisPoints: 0,
        owner: new PublicKey(citizenWalletAddress),
        creators: [
          {
            address: new PublicKey(process.env.GOVERNMENT_WALLET_ADDRESS!),
            share: 100,
            verified: true,
          },
        ],
      })

      // Track sponsorship
      await govWallet.sponsorNFTMint(
        citizenWalletAddress,
        documentId,
        documentHash,
        documentType,
      )

      // Update document with NFT address
      await prisma.document.update({
        where: { id: documentId },
        data: {
          nftMintAddress: nft.address.toString(),
          updatedAt: new Date(),
        },
      })

      console.log(`✅ NFT Minted: ${nft.address.toString()}`)
      console.log(`📤 Sent to citizen: ${citizenWalletAddress}`)

      return {
        nftMintAddress: nft.address.toString(),
        nftUri,
        transactionSignature: nft.address.toString(), // Placeholder
      }
    } catch (error) {
      console.error('NFT minting error:', error)
      throw error
    }
  }

  /**
   * Upload NFT metadata to Arweave (via Bundlr)
   */
  private async uploadNFTMetadata(metadata: any): Promise<string> {
    try {
      const uri = await this.metaplex.storage().upload(metadata)
      return uri
    } catch (error) {
      console.error('NFT metadata upload error:', error)
      throw error
    }
  }

  /**
   * Get citizen's NFTs (from their embedded wallet)
   */
  async getCitizenNFTs(citizenWalletAddress: string) {
    try {
      const owner = new PublicKey(citizenWalletAddress)
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner })
      return nfts
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      throw error
    }
  }

  /**
   * Verify NFT ownership (for sharing/access control)
   */
  async verifyNFTOwnership(
    citizenWalletAddress: string,
    nftMintAddress: string,
  ): Promise<boolean> {
    try {
      const nfts = await this.getCitizenNFTs(citizenWalletAddress)
      return nfts.some((nft) => nft.address.toString() === nftMintAddress)
    } catch (error) {
      console.error('Error verifying NFT ownership:', error)
      return false
    }
  }
}

export const nftMintingService = new NFTMintingService()
export default NFTMintingService
