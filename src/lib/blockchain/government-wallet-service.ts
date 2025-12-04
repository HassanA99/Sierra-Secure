/**
 * Government Master Wallet Service
 * 
 * Centralized wallet that sponsors all citizen transactions
 * - Mints NFTs on behalf of citizens
 * - Submits attestations to Solana
 * - Pays Arweave storage fees
 * - Citizens never see this - completely transparent
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createMintToInstruction, getMint } from '@solana/spl-token'

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const GOVERNMENT_WALLET = process.env.GOVERNMENT_WALLET_ADDRESS
const GOVERNMENT_WALLET_SECRET = process.env.GOVERNMENT_WALLET_SECRET_KEY

export interface TransactionSponsorship {
  type: 'NFT_MINT' | 'ATTESTATION' | 'ARWEAVE_STORAGE' | 'PERMISSION_REVOKE'
  citizenWalletAddress: string
  costSOL: number
  description: string
  documentId?: string
  transactionSignature?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  createdAt: Date
}

class GovernmentMasterWalletService {
  private connection: Connection
  private governmentWallet: PublicKey | null = null

  constructor() {
    this.connection = new Connection(SOLANA_RPC, 'confirmed')
    if (GOVERNMENT_WALLET) {
      this.governmentWallet = new PublicKey(GOVERNMENT_WALLET)
    }
  }

  /**
   * Get government wallet balance
   * Used for admin dashboard to monitor spending
   */
  async getGovernmentBalance(): Promise<{
    balanceSOL: number
    balanceLamports: number
    estimatedMonthlyBurn: number
    daysUntilEmpty: number
  }> {
    if (!this.governmentWallet) throw new Error('Government wallet not configured')

    const balanceLamports = await this.connection.getBalance(this.governmentWallet)
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    // Estimate monthly burn (average cost per transaction)
    const monthlyBurn = 1000 * 0.00005 // Rough estimate: 1000 txns at $0.00005 each
    const daysUntilEmpty = Math.floor((balanceSOL / monthlyBurn) * 30)

    return {
      balanceSOL,
      balanceLamports,
      estimatedMonthlyBurn: monthlyBurn,
      daysUntilEmpty: daysUntilEmpty < 0 ? 0 : daysUntilEmpty,
    }
  }

  /**
   * Sponsor NFT mint for citizen
   * Government pays the fee, citizen owns the NFT
   * Citizen's embedded wallet receives the NFT
   */
  async sponsorNFTMint(
    citizenWalletAddress: string,
    documentId: string,
    documentHash: string,
    documentType: string,
  ): Promise<TransactionSponsorship> {
    if (!this.governmentWallet) throw new Error('Government wallet not configured')

    try {
      // In production:
      // 1. Create token metadata using Metaplex
      // 2. Mint NFT to citizen wallet
      // 3. Government wallet pays the fee
      // 4. Return transaction signature

      // For now, simulate the transaction
      const sponsorship: TransactionSponsorship = {
        type: 'NFT_MINT',
        citizenWalletAddress,
        costSOL: 0.00192, // Solana minting cost
        description: `Minting NFT for document ${documentType}`,
        documentId,
        status: 'CONFIRMED',
        transactionSignature: 'simulated_tx_' + Date.now(),
        createdAt: new Date(),
      }

      console.log(`[GOVERNMENT WALLET] Sponsored NFT mint for citizen ${citizenWalletAddress}`)
      console.log(`[TRANSACTION] Cost: ${sponsorship.costSOL} SOL`)

      return sponsorship
    } catch (error) {
      console.error('NFT mint sponsorship failed:', error)
      throw error
    }
  }

  /**
   * Sponsor SAS attestation for citizen document
   * Government submits attestation, citizen is holder
   */
  async sponsorAttestation(
    citizenWalletAddress: string,
    documentId: string,
    attestationData: Record<string, unknown>,
  ): Promise<TransactionSponsorship> {
    if (!this.governmentWallet) throw new Error('Government wallet not configured')

    try {
      // In production:
      // 1. Create SAS attestation schema
      // 2. Submit to Solana with government signature
      // 3. Citizen wallet is the holder
      // 4. Government pays the fee

      const sponsorship: TransactionSponsorship = {
        type: 'ATTESTATION',
        citizenWalletAddress,
        costSOL: 0.00195, // SAS attestation cost
        description: `Creating SAS attestation for document ${documentId}`,
        documentId,
        status: 'CONFIRMED',
        transactionSignature: 'simulated_sas_' + Date.now(),
        createdAt: new Date(),
      }

      console.log(`[GOVERNMENT WALLET] Sponsored attestation for citizen ${citizenWalletAddress}`)
      console.log(`[TRANSACTION] Cost: ${sponsorship.costSOL} SOL`)

      return sponsorship
    } catch (error) {
      console.error('Attestation sponsorship failed:', error)
      throw error
    }
  }

  /**
   * Sponsor Arweave storage fee
   * Government pays for permanent document storage
   */
  async sponsorArweaveStorage(
    citizenWalletAddress: string,
    documentId: string,
    documentSizeBytes: number,
  ): Promise<TransactionSponsorship> {
    try {
      // In production:
      // 1. Upload document to Arweave via bundler
      // 2. Government wallet pays the fee
      // 3. Citizen retains access/ownership

      const estimatedCostSOL = (documentSizeBytes / 1024 / 1024) * 0.001 // Rough estimate

      const sponsorship: TransactionSponsorship = {
        type: 'ARWEAVE_STORAGE',
        citizenWalletAddress,
        costSOL: estimatedCostSOL,
        description: `Storing ${documentSizeBytes} bytes on Arweave for ${documentId}`,
        documentId,
        status: 'CONFIRMED',
        transactionSignature: 'simulated_arweave_' + Date.now(),
        createdAt: new Date(),
      }

      console.log(`[GOVERNMENT WALLET] Sponsored Arweave storage for citizen`)
      console.log(`[TRANSACTION] Cost: ${sponsorship.costSOL} SOL (${documentSizeBytes} bytes)`)

      return sponsorship
    } catch (error) {
      console.error('Arweave storage sponsorship failed:', error)
      throw error
    }
  }

  /**
   * Sponsor permission revocation
   * Citizen revokes access, government pays the transaction fee
   */
  async sponsorPermissionRevoke(
    citizenWalletAddress: string,
    permissionId: string,
  ): Promise<TransactionSponsorship> {
    if (!this.governmentWallet) throw new Error('Government wallet not configured')

    try {
      // In production:
      // 1. Create revocation transaction
      // 2. Government wallet pays the fee
      // 3. Citizen's permission smart contract updates

      const sponsorship: TransactionSponsorship = {
        type: 'PERMISSION_REVOKE',
        citizenWalletAddress,
        costSOL: 0.00195, // Transaction fee
        description: `Revoking access permission ${permissionId}`,
        status: 'CONFIRMED',
        transactionSignature: 'simulated_revoke_' + Date.now(),
        createdAt: new Date(),
      }

      console.log(`[GOVERNMENT WALLET] Sponsored permission revocation for citizen`)
      console.log(`[TRANSACTION] Cost: ${sponsorship.costSOL} SOL`)

      return sponsorship
    } catch (error) {
      console.error('Permission revocation sponsorship failed:', error)
      throw error
    }
  }

  /**
   * Get transaction history for admin dashboard
   */
  async getTransactionHistory(limit: number = 100): Promise<TransactionSponsorship[]> {
    // In production, fetch from database
    // For now, return empty array
    return []
  }

  /**
   * Get spending breakdown for this month
   */
  async getMonthlySpendingBreakdown(): Promise<{
    nftMinting: number
    attestations: number
    arweaveStorage: number
    other: number
    total: number
  }> {
    const history = await this.getTransactionHistory(10000)
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const breakdown = history
      .filter((t) => t.createdAt >= thisMonth && t.status === 'CONFIRMED')
      .reduce(
        (acc, t) => {
          if (t.type === 'NFT_MINT') acc.nftMinting += t.costSOL
          else if (t.type === 'ATTESTATION') acc.attestations += t.costSOL
          else if (t.type === 'ARWEAVE_STORAGE') acc.arweaveStorage += t.costSOL
          else acc.other += t.costSOL
          return acc
        },
        { nftMinting: 0, attestations: 0, arweaveStorage: 0, other: 0, total: 0 },
      )

    breakdown.total = breakdown.nftMinting + breakdown.attestations + breakdown.arweaveStorage + breakdown.other

    return breakdown
  }
}

// Singleton instance
let govWalletService: GovernmentMasterWalletService | null = null

export function getGovernmentWalletService(): GovernmentMasterWalletService {
  if (!govWalletService) {
    govWalletService = new GovernmentMasterWalletService()
  }
  return govWalletService
}

export default GovernmentMasterWalletService
