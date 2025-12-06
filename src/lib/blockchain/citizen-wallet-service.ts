import { prisma } from '@/lib/prisma/client'

class CitizenWalletService {
  async getCitizenEmbeddedWallet(privyId: string): Promise<string | null> {
    if (!privyId) return null
    try {
      const user = await prisma.user.findFirst({ where: { privyId } })
      if (!user) return null
      return user.walletAddress || null
    } catch (err) {
      console.warn('[CitizenWalletService] lookup failed', err)
      return null
    }
  }
}

export const citizenWalletService = new CitizenWalletService()
export default citizenWalletService
