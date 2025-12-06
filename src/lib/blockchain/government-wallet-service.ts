import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { prisma } from '@/lib/prisma/client'

const GOV_WALLET_SECRET = process.env.GOVERNMENT_WALLET_SECRET_KEY || process.env.GOVERNMENT_WALLET_PRIVATE_KEY
const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

class GovernmentWalletService {
  private keypair: Keypair | null = null
  private connection: Connection

  constructor() {
    this.connection = new Connection(RPC, 'confirmed')
    if (GOV_WALLET_SECRET) {
      try {
        // Expect base58 or JSON keypair; try JSON parse
        let kp: any = GOV_WALLET_SECRET
        if (GOV_WALLET_SECRET.trim().startsWith('{')) {
          const parsed = JSON.parse(GOV_WALLET_SECRET)
          kp = Uint8Array.from(parsed)
        }
        this.keypair = Keypair.fromSecretKey(typeof kp === 'string' ? Buffer.from(kp, 'base64') : kp)
      } catch (err) {
        console.warn('[GovernmentWalletService] Failed to parse GOV key - running in MOCK mode', err)
        this.keypair = null
      }
    }
  }

  getAddress(): string {
    if (this.keypair) return this.keypair.publicKey.toBase58()
    return process.env.GOVERNMENT_WALLET_ADDRESS || 'gov_mock_address'
  }

  async sponsorTransaction(tx: Transaction): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.keypair) {
        // Mock behavior in development: return a fake signature
        return { success: true, signature: `mock_sig_${Date.now()}` }
      }

      const signed = await this.connection.sendTransaction(tx, [this.keypair])
      return { success: true, signature: signed }
    } catch (error: any) {
      console.error('[GovernmentWalletService] sponsorTransaction error', error)
      return { success: false, error: error?.message || String(error) }
    }
  }

  async getBalance(): Promise<number> {
    try {
      if (!this.keypair) return 0
      return await this.connection.getBalance(this.keypair.publicKey)
    } catch (err) {
      console.warn('Failed to get gov wallet balance', err)
      return 0
    }
  }
}

const governmentWalletService = new GovernmentWalletService()

export function getGovernmentWalletService() {
  return governmentWalletService
}

export default governmentWalletService
