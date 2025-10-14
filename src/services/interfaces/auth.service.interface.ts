import { User, CreateUserInput } from '@/types/user.types'
import { AuthUser, LoginResponse } from '@/types/api.types'

export interface LoginInput {
  privyId: string
  walletAddress: string
  email?: string
  firstName: string
  lastName: string
}

export interface IAuthService {
  login(loginData: LoginInput): Promise<LoginResponse>
  logout(userId: string): Promise<void>
  getCurrentUser(accessToken: string): Promise<AuthUser | null>
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
  verifyToken(token: string): Promise<{ userId: string; valid: boolean }>
  createUserFromPrivy(userData: CreateUserInput): Promise<User>
  getUserByPrivyId(privyId: string): Promise<User | null>
  getUserByWalletAddress(walletAddress: string): Promise<User | null>
  updateUserVerificationStatus(userId: string, isVerified: boolean): Promise<User>
}