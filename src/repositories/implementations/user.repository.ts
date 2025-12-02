import { PrismaClient, User } from '@prisma/client'
import type { CreateUserInput, UpdateUserInput } from '@/types/user.types'
import type { IUserRepository } from '../interfaces/user.repository.interface'

export class UserRepository implements IUserRepository {
  private prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async create(userData: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: userData })
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByPrivyId(privyId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { privyId } })
  }

  async findByWalletAddress(address: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { walletAddress: address } })
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  async verifyUser(id: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { isVerified: true } })
  }
}

export default UserRepository
