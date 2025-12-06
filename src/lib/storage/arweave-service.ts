/**
 * STEP 4: ARWEAVE PERMANENT STORAGE
 * 
 * Upload documents to Arweave after approval
 * - Encrypted with AES-256
 * - Permanent (200+ years)
 * - Government pays bundler fee
 * - Citizen owns proof forever
 */

import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma/client'

const ARWEAVE_GATEWAY = process.env.ARWEAVE_GATEWAY_URL || 'https://arweave.net'
const ARWEAVE_WALLET_KEY = process.env.ARWEAVE_WALLET_KEY

interface StorageResult {
  transactionId: string
  permanentUrl: string
  contentHash: string
  encryptionKey: string
  expirationDate: string
}

export class ArweaveStorageService {
  private arweave: Arweave
  private walletKey: JWKInterface | null = null

  constructor() {
    this.arweave = Arweave.init({
      host: ARWEAVE_GATEWAY,
      port: 443,
      protocol: 'https',
    })

    if (ARWEAVE_WALLET_KEY) {
      try {
        this.walletKey = JSON.parse(ARWEAVE_WALLET_KEY)
      } catch (error) {
        console.error('Invalid Arweave wallet key')
      }
    }
  }

  /**
   * Store document on Arweave (permanent)
   * Encrypts before upload
   */
  async storeDocument(
    documentId: string,
    documentData: Buffer,
    documentType: string,
    citizenWallet: string,
  ): Promise<StorageResult> {
    try {
      // Generate encryption key
      const encryptionKey = crypto.randomBytes(32).toString('hex')

      // Encrypt document with AES-256
      const encryptedData = this.encryptData(documentData, encryptionKey)

      // Create transaction for Arweave
      const transaction = await this.arweave.createTransaction({
        data: encryptedData,
      })

      // Add metadata tags
      transaction.addTag('Document-Type', documentType)
      transaction.addTag('Citizen-Wallet', citizenWallet)
      transaction.addTag('Document-ID', documentId)
      transaction.addTag('Issued-By', 'NDDV-Government')
      transaction.addTag('Issued-At', new Date().toISOString())
      transaction.addTag('Encryption', 'AES-256')
      transaction.addTag('Permanent', 'Forever')

      // Sign and submit
      if (!this.walletKey) {
        throw new Error('Arweave wallet not configured')
      }

      await this.arweave.transactions.sign(transaction, this.walletKey)
      const response = await this.arweave.transactions.post(transaction)

      if (response.status !== 200) {
        throw new Error(`Arweave submission failed: ${response.status}`)
      }

      const txId = transaction.id
      const permanentUrl = `${ARWEAVE_GATEWAY}/${txId}`
      const contentHash = crypto.createHash('sha256').update(documentData).digest('hex')

      // Store reference in database
      await prisma.document.update({
        where: { id: documentId },
        data: {
          fileHash: txId, // Store Arweave TX ID
        },
      })

      console.log(`📦 Document stored on Arweave: ${txId}`)
      console.log(`🔗 Permanent URL: ${permanentUrl}`)
      console.log(`⏰ Will be retrievable for 200+ years`)

      return {
        transactionId: txId,
        permanentUrl,
        contentHash,
        encryptionKey,
        expirationDate: new Date(Date.now() + 200 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error('Arweave storage error:', error)
      throw error
    }
  }

  /**
   * Retrieve document from Arweave
   * Decrypt with encryption key
   */
  async retrieveDocument(
    transactionId: string,
    encryptionKey: string,
  ): Promise<Buffer> {
    try {
      // Fetch from Arweave
      const response = await fetch(`${ARWEAVE_GATEWAY}/${transactionId}`)

      if (!response.ok) {
        throw new Error(`Failed to retrieve from Arweave: ${response.status}`)
      }

      const encryptedData = await response.arrayBuffer()

      // Decrypt
      const decryptedData = this.decryptData(Buffer.from(encryptedData), encryptionKey)

      console.log(`✅ Document retrieved from Arweave`)
      return decryptedData
    } catch (error) {
      console.error('Document retrieval error:', error)
      throw error
    }
  }

  /**
   * Encrypt data with AES-256
   */
  private encryptData(data: Buffer, key: string): Buffer {
    try {
      const iv = crypto.randomBytes(16)
      const keyBuffer = Buffer.from(key, 'hex')

      const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)
      let encrypted = cipher.update(data)
      encrypted = Buffer.concat([encrypted, cipher.final()])

      // Prepend IV to encrypted data (needed for decryption)
      return Buffer.concat([iv, encrypted])
    } catch (error) {
      console.error('Encryption error:', error)
      throw error
    }
  }

  /**
   * Decrypt data with AES-256
   */
  private decryptData(encryptedData: Buffer, key: string): Buffer {
    try {
      const keyBuffer = Buffer.from(key, 'hex')

      // Extract IV (first 16 bytes)
      const iv = encryptedData.slice(0, 16)
      const encrypted = encryptedData.slice(16)

      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv)
      let decrypted = decipher.update(encrypted)
      decrypted = Buffer.concat([decrypted, decipher.final()])

      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw error
    }
  }

  /**
   * Get Arweave wallet balance (for government dashboard)
   */
  async getWalletBalance(): Promise<string> {
    try {
      if (!this.walletKey) return '0'

      const address = await this.arweave.wallets.jwkToAddress(this.walletKey)
      const balance = await this.arweave.wallets.getBalance(address)
      const winstonToAR = this.arweave.ar.winstonToAr(balance)

      return winstonToAR
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  /**
   * Get document storage metadata
   */
  async getStorageMetadata(transactionId: string) {
    try {
      const tx = await this.arweave.transactions.get(transactionId)

      return {
        transactionId,
        size: tx.data_size,
        permanentUrl: `${ARWEAVE_GATEWAY}/${transactionId}`,
        storedAt: new Date(parseInt(tx.timestamp) * 1000),
        retrievable: true,
        cost: 'Paid by government',
        expirationDate: new Date(Date.now() + 200 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error('Error getting metadata:', error)
      throw error
    }
  }
}

export const arweaveStorageService = new ArweaveStorageService()
export default ArweaveStorageService
