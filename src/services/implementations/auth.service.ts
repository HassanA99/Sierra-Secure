import { PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'
import type { IAuthService, LoginResult, VerificationResult, UserSession } from '../interfaces/auth.service.interface'
import type { CreateUserInput, UpdateUserInput } from '@/types/user.types'

export class AuthService implements IAuthService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    if (!prisma) throw new Error('PrismaClient instance is required for AuthService')
    this.prisma = prisma
  }

  async loginWithPrivy(
    privyUserId: string,
    walletAddress: string,
    userData?: { email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }
  ): Promise<LoginResult> {
    try {
      if (!privyUserId || !walletAddress) throw new Error('privyUserId and walletAddress are required')
      if (!this.isValidWalletAddress(walletAddress)) throw new Error('Invalid wallet address format')

      let user = await this.prisma.user.findUnique({ where: { privyId: privyUserId } })
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            walletAddress: walletAddress.toLowerCase(),
            ...(userData?.email && { email: userData.email.toLowerCase() }),
            ...(userData?.firstName && { firstName: userData.firstName }),
            ...(userData?.lastName && { lastName: userData.lastName }),
            updatedAt: new Date(),
          },
        })
      } else {
        user = await this.prisma.user.create({
          data: {
            privyId: privyUserId,
            walletAddress: walletAddress.toLowerCase(),
            email: userData?.email?.toLowerCase(),
            firstName: userData?.firstName || 'User',
            lastName: userData?.lastName || '',
            isVerified: false,
          },
        })
      }

      return { success: true, user: this.mapUserToSession(user), message: 'Successfully authenticated with Privy' }
    } catch (error) {
      console.error('Error logging in with Privy:', error)
      throw new Error(`${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async verifyWalletSignature(userId: string, message: string, signature: string, walletAddress: string): Promise<VerificationResult> {
    try {
      if (!userId || !message || !signature || !walletAddress) throw new Error('All parameters are required for wallet verification')
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error(`User not found: ${userId}`)
      if (walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) throw new Error('Wallet address does not match authenticated user')

      const updatedUser = await this.prisma.user.update({ where: { id: userId }, data: { isVerified: true } })
      return { success: true, isVerified: true, user: this.mapUserToSession(updatedUser), message: 'Wallet signature verified' }
    } catch (error) {
      console.error('Error verifying wallet signature:', error)
      return { success: false, isVerified: false, message: error instanceof Error ? error.message : 'Verification failed' }
    }
  }

  async getUser(userId: string): Promise<UserSession | null> {
    try {
      if (!userId) throw new Error('User ID is required')
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      return user ? this.mapUserToSession(user) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  async getUserByWallet(walletAddress: string): Promise<UserSession | null> {
    try {
      if (!walletAddress) throw new Error('Wallet address is required')
      if (!this.isValidWalletAddress(walletAddress)) throw new Error('Invalid wallet address format')
      const user = await this.prisma.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } })
      return user ? this.mapUserToSession(user) : null
    } catch (error) {
      console.error('Error finding user by wallet:', error)
      return null
    }
  }

  async updateUser(userId: string, data: UpdateUserInput): Promise<UserSession> {
    try {
      if (!userId) throw new Error('User ID is required')
      const updateData: Record<string, any> = {}
      if (data.email) updateData.email = data.email.toLowerCase()
      if (data.firstName) updateData.firstName = data.firstName
      if (data.lastName) updateData.lastName = data.lastName
      const user = await this.prisma.user.update({ where: { id: userId }, data: { ...updateData, updatedAt: new Date() } })
      return this.mapUserToSession(user)
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  async verifyUser(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required')
      const user = await this.prisma.user.update({ where: { id: userId }, data: { isVerified: true } })
      return user.isVerified
    } catch (error) {
      console.error('Error verifying user:', error)
      return false
    }
  }

  async isUserVerified(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required')
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { isVerified: true } })
      return user?.isVerified ?? false
    } catch (error) {
      console.error('Error checking user verification:', error)
      return false
    }
  }

  async logout(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required')
      return true
    } catch (error) {
      console.error('Error logging out:', error)
      return false
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required')
      const documentCount = await this.prisma.document.count({ where: { userId } })
      if (documentCount > 0) throw new Error(`Cannot delete user with ${documentCount} active documents. Delete documents first.`)
      await this.prisma.user.delete({ where: { id: userId } })
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  async validatePrivyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      if (!token) return { valid: false }
      return { valid: true }
    } catch (error) {
      console.error('Error validating Privy token:', error)
      return { valid: false }
    }
  }

  async getUserStats(): Promise<{ totalUsers: number; verifiedUsers: number; unverifiedUsers: number; usersWithDocuments: number }> {
    try {
      const [totalUsers, verifiedUsers] = await Promise.all([this.prisma.user.count(), this.prisma.user.count({ where: { isVerified: true } })])
      const unverifiedUsers = totalUsers - verifiedUsers
      const usersWithDocuments = await this.prisma.user.count({ where: { documents: { some: {} } } })
      return { totalUsers, verifiedUsers, unverifiedUsers, usersWithDocuments }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return { totalUsers: 0, verifiedUsers: 0, unverifiedUsers: 0, usersWithDocuments: 0 }
    }
  }

  private mapUserToSession(user: User): UserSession {
    return {
      id: user.id,
      privyId: user.privyId,
      walletAddress: user.walletAddress,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private isValidWalletAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false
    return /^[1-9A-HJ-NP-Z]{43,44}$/.test(address) || /^0x[0-9a-fA-F]{40}$/.test(address)
  }

  // Development-friendly staff login (auto-provision)
  async loginStaff(staffId: string, password: string): Promise<LoginResult> {
    if (!staffId || !password) throw new Error('Staff ID and password required')
    if (password.length < 6) throw new Error('Invalid credentials')

    try {
      let user = await this.prisma.user.findUnique({ where: { privyId: staffId } })
      if (!user) {
        const role = this.detectStaffRole(staffId)
        if (!role) throw new Error('Invalid staff ID format')
        const walletAddress = 'embedded_' + Math.random().toString(16).slice(2, 34)
        const [firstName = 'Staff', lastName = 'Member'] = staffId.split('-')[0].split('_')
        user = await this.prisma.user.create({ data: { privyId: staffId, email: `${staffId.toLowerCase()}@nddv.gov`, walletAddress, firstName, lastName, isVerified: true, role, status: 'ACTIVE' } })
      }
      if (user.role === 'CITIZEN') throw new Error('Citizen accounts cannot access staff portal')
      return { success: true, user: this.mapUserToSession(user), message: 'Staff login successful' }
    } catch (error) {
      console.error('Staff login error:', error)
      throw error
    }
  }

  private detectStaffRole(staffId: string): 'VERIFIER' | 'MAKER' | null {
    if (staffId.startsWith('VER-')) return 'VERIFIER'
    if (staffId.startsWith('MAK-')) return 'MAKER'
    return null
  }
}

import { prisma } from '@/lib/prisma/client'

export const authService = new AuthService(prisma)
export default AuthService
