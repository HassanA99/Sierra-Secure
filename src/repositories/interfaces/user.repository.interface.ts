import { User, CreateUserInput, UpdateUserInput } from '@/types/user.types'

export interface IUserRepository {
  create(userData: CreateUserInput): Promise<User>
  findById(id: string): Promise<User | null>
  findByPrivyId(privyId: string): Promise<User | null>
  findByWalletAddress(address: string): Promise<User | null>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
  verifyUser(id: string): Promise<User>
  findAll(limit?: number, offset?: number): Promise<User[]>
  count(): Promise<number>
}