/**
 * CRITICAL FIX: Citizen Wallet Architecture
 * 
 * Citizens have embedded wallets but DON'T MANAGE THEM
 * Government backend uses Privy API to:
 * 1. Access citizen's embedded wallet
 * 2. Sign transactions on behalf of citizen
 * 3. Citizen sees simple UI: "Share with Verifier"
 * 4. Blockchain happens in background
 * 
 * Verifiers check blockchain directly (trustless)
 */

import { PrivyClient } from '@privy-io/server-auth'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: PRIVY_APP_SECRET!,
})

export class CitizenWalletService {
  private connection: Connection

  constructor() {
    this.connection = new Connection(SOLANA_RPC, 'confirmed')
  }

  /**
   * Get citizen's embedded wallet from Privy
   * Called from backend - citizen never sees it
   */
  async getCitizenEmbeddedWallet(privyUserId: string) {
    try {
      const user = await privyClient.getUser(privyUserId)
      
      // Get the embedded wallet
      const embeddedWallet = user.linkedAccounts.find(
        (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
      )

      if (!embeddedWallet) {
        throw new Error('No embedded wallet found for citizen')
      }

      return {
        address: embeddedWallet.address,
        chainType: embeddedWallet.chainType, // 'solana'
        privyWalletId: embeddedWallet.address,
      }
    } catch (error) {
      console.error('Error getting citizen wallet:', error)
      throw error
    }
  }

  /**
   * Sign a transaction ON BEHALF of citizen
   * Using Privy's embedded wallet
   * Citizen never touches a key
   */
  async signTransactionAsCitizen(
    privyUserId: string,
    transaction: Transaction,
  ): Promise<string> {
    try {
      // Privy handles the signing via their embedded wallet
      // In production, this uses Privy's signing service
      
      const signedTx = await privyClient.walletApi.rpc.signTransaction({
        transaction: transaction.serialize().toString('base64'),
      })

      return signedTx.signature
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  /**
   * Send SOL from citizen's wallet (government pays fees)
   * Citizen sees: "Shared document with verifier"
   * Blockchain sees: Transaction from citizen's wallet
   */
  async sendTransactionAsCitizen(
    privyUserId: string,
    destinationWallet: PublicKey,
    lamports: number,
    transactionData: any,
  ): Promise<string> {
    try {
      const citizenWallet = await this.getCitizenEmbeddedWallet(privyUserId)
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(citizenWallet.address),
          toPubkey: destinationWallet,
          lamports,
        }),
      )

      // Get blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = new PublicKey(citizenWallet.address)

      // Sign as citizen
      const signature = await this.signTransactionAsCitizen(privyUserId, transaction)

      return signature
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }
}

export default CitizenWalletService
