import { getGovernmentWalletService } from './government-wallet-service'
import { SolanaService } from '@/services/implementations/solana.service'

const solanaService = new SolanaService()
const gov = getGovernmentWalletService()

class SmartContractService {
  // Mock grant permission on-chain (development)
  async grantPermission(documentId: string, granter: string, grantee: string, expiresAt?: string) {
    console.log(`[SmartContract] grantPermission ${documentId} ${granter} -> ${grantee}`)
    // In dev, return a fake tx/permission id
    return { success: true, permissionId: `perm_${Date.now()}` }
  }

  async revokePermission(permissionId: string) {
    console.log(`[SmartContract] revokePermission ${permissionId}`)
    return { success: true }
  }

  async checkPermission(documentId: string, grantee: string) {
    console.log(`[SmartContract] checkPermission ${documentId} for ${grantee}`)
    // In production this would query the on-chain contract; in dev return true for now
    return { allowed: true }
  }
}

export const smartContractService = new SmartContractService()
export default smartContractService
