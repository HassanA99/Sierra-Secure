export interface CreateUserInput {
  privyId: string
  walletAddress: string
  email?: string
  firstName: string
  lastName: string
}

export interface UpdateUserInput {
  email?: string
  firstName?: string
  lastName?: string
  isVerified?: boolean
}

export interface User {
  id: string
  privyId: string
  walletAddress: string
  email?: string | null
  firstName: string
  lastName: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}