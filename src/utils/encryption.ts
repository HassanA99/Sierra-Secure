import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { FILE_CONSTRAINTS } from './constants'

export interface EncryptionResult {
  encrypted: string
  iv: string
  authTag: string
}

export interface DecryptionInput {
  encrypted: string
  iv: string
  authTag: string
  key: string
}

export class EncryptionService {
  private static readonly ALGORITHM = FILE_CONSTRAINTS.ENCRYPTION_ALGORITHM
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 16 // 128 bits
  private static readonly SALT_ROUNDS = 12

  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex')
  }

  static generateIV(): string {
    return crypto.randomBytes(this.IV_LENGTH).toString('hex')
  }

  static encryptData(data: string, key: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH)
      const keyBuffer = Buffer.from(key, 'hex')
      
      const cipher = crypto.createCipher(this.ALGORITHM, keyBuffer, iv)
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag().toString('hex')
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static decryptData(input: DecryptionInput): string {
    try {
      const { encrypted, iv, authTag, key } = input
      const keyBuffer = Buffer.from(key, 'hex')
      const ivBuffer = Buffer.from(iv, 'hex')
      const authTagBuffer = Buffer.from(authTag, 'hex')
      
      const decipher = crypto.createDecipher(this.ALGORITHM, keyBuffer, ivBuffer)
      decipher.setAuthTag(authTagBuffer)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  static verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateDocumentKey(documentId: string, userId: string): string {
    const combined = `${documentId}:${userId}:${process.env.JWT_SECRET}`
    return crypto.createHash('sha256').update(combined).digest('hex')
  }

  static hashFile(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex')
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
  }

  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret)
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
  }

  static encryptDocumentMetadata(metadata: Record<string, any>, documentKey: string): string {
    const jsonData = JSON.stringify(metadata)
    const result = this.encryptData(jsonData, documentKey)
    
    // Combine all parts into a single string for storage
    return `${result.iv}:${result.authTag}:${result.encrypted}`
  }

  static decryptDocumentMetadata(encryptedMetadata: string, documentKey: string): Record<string, any> {
    const parts = encryptedMetadata.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted metadata format')
    }

    const [iv, authTag, encrypted] = parts
    const decrypted = this.decryptData({ encrypted, iv, authTag, key: documentKey })
    
    try {
      return JSON.parse(decrypted)
    } catch (error) {
      throw new Error('Failed to parse decrypted metadata')
    }
  }
}

// Key derivation for deterministic keys
export class KeyDerivation {
  static deriveKey(password: string, salt: string, iterations: number = 100000): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey.toString('hex'))
      })
    })
  }

  static generateSalt(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}

// Utility functions for secure operations
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('hex')
}

export const createChecksum = (data: string): string => {
  return crypto.createHash('md5').update(data).digest('hex')
}