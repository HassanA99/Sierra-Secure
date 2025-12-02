/**
 * Arweave Service Interface
 * Defines contract for permanent document storage on Arweave
 * 
 * Features:
 * - Encrypt before upload (AES-256)
 * - Store on Arweave permanently
 * - Download and decrypt
 * - Verify data integrity
 */
export interface IArweaveService {
  /**
   * Upload encrypted file to Arweave
   * @param fileBuffer - File contents
   * @param fileName - Original file name
   * @param documentId - Reference document ID
   * @param metadata - Optional file metadata
   * @returns Transaction ID and Arweave URL
   */
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    documentId: string,
    metadata?: Record<string, any>
  ): Promise<{
    transactionId: string
    arweaveUrl: string
    fileSize: number
    uploadedAt: Date
    contentHash: string
  }>

  /**
   * Download and decrypt file from Arweave
   * @param transactionId - Arweave transaction ID
   * @param encryptionKey - AES-256 key for decryption
   * @returns Decrypted file buffer
   */
  downloadFile(transactionId: string, encryptionKey: string): Promise<Buffer>

  /**
   * Verify file exists and is accessible on Arweave
   * @param transactionId - Arweave transaction ID
   * @returns True if file is accessible
   */
  verifyFileExists(transactionId: string): Promise<boolean>

  /**
   * Get Arweave transaction status
   * @param transactionId - Arweave transaction ID
   * @returns Transaction status and details
   */
  getTransactionStatus(transactionId: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed'
    blockHeight?: number
    confirmations: number
  }>

  /**
   * Delete file from Arweave (actually marks as deleted in metadata)
   * Note: Arweave is immutable, so this marks as deleted
   * @param transactionId - Arweave transaction ID
   * @returns Deletion transaction ID
   */
  deleteFile(transactionId: string): Promise<string>

  /**
   * Generate encryption key for file
   * @returns AES-256 encryption key
   */
  generateEncryptionKey(): string

  /**
   * Get file metadata from Arweave
   * @param transactionId - Arweave transaction ID
   * @returns File metadata
   */
  getFileMetadata(
    transactionId: string
  ): Promise<{
    fileName: string
    fileSize: number
    uploadedAt: Date
    mimeType: string
    documentId: string
    contentHash: string
  }>
}
