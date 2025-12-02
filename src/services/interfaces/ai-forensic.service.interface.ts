/**
 * AI Document Forensic Service Interface
 * 
 * Comprehensive document analysis using Gemini multimodal AI before blockchain issuance.
 * This is the critical security layer that detects fraud, tampering, and ensures
 * document quality before SAS attestations or NFT minting.
 */

import {
  ForensicReport,
  ForensicAnalysisInput,
  BatchForensicInput,
  BatchForensicResult,
  ComplianceScore,
  TamperIndicator,
  OCRResult,
  DocumentMetadataAnalysis,
  BiometricAnalysis,
  ForensicProgressUpdate,
  DocumentTemplate,
} from '@/types/forensic.types'

export interface IAIDocumentForensicService {
  /**
   * ==================== PRIMARY ANALYSIS ====================
   */

  /**
   * Comprehensive forensic analysis of a single document
   * Detects tampering, extracts OCR, validates metadata, checks biometrics
   * 
   * @param input - Document analysis configuration
   * @returns Complete forensic report with compliance scoring
   */
  analyzeDocument(input: ForensicAnalysisInput): Promise<ForensicReport>

  /**
   * Quick tampering detection without full analysis
   * Faster response for real-time validation scenarios
   * 
   * @param fileBuffer - Document image/file
   * @param documentType - Type of document being analyzed
   * @returns Tamper detection results only
   */
  quickTamperCheck(fileBuffer: Buffer, documentType: string): Promise<TamperIndicator[]>

  /**
   * Stream forensic analysis progress in real-time
   * Returns observable/stream for progressive UI updates during analysis
   * 
   * @param input - Document analysis configuration
   * @returns AsyncIterable of progress updates
   */
  analyzeDocumentStream(input: ForensicAnalysisInput): AsyncIterable<ForensicProgressUpdate>

  /**
   * ==================== BATCH OPERATIONS ====================
   */

  /**
   * Analyze multiple documents efficiently
   * Optimized for government bulk issuance workflows
   * 
   * @param input - Batch configuration with multiple documents
   * @returns Batch results with summary statistics
   */
  analyzeBatch(input: BatchForensicInput): Promise<BatchForensicResult>

  /**
   * Cancel ongoing batch analysis
   * 
   * @param batchId - Batch identifier from analyzeBatch
   */
  cancelBatch(batchId: string): Promise<void>

  /**
   * Get batch analysis status and partial results
   * 
   * @param batchId - Batch identifier
   * @returns Current progress and completed analyses
   */
  getBatchStatus(batchId: string): Promise<{
    batchId: string
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    progress: number
    completedCount: number
    totalCount: number
    partialResults: ForensicReport[]
  }>

  /**
   * ==================== COMPONENT ANALYSIS ====================
   */

  /**
   * Analyze document for tampering/forgery indicators
   * Detects clone stamps, copy-paste artifacts, font inconsistencies
   * 
   * @param fileBuffer - Document image
   * @returns Array of detected tamper indicators
   */
  detectTampering(fileBuffer: Buffer): Promise<TamperIndicator[]>

  /**
   * Extract text from document with spatial coordinates
   * High-confidence OCR with bounding boxes for each text zone
   * 
   * @param fileBuffer - Document image
   * @param language - Optional language hint (auto-detect if not provided)
   * @returns Extracted text zones with confidence scores
   */
  extractOCR(fileBuffer: Buffer, language?: string): Promise<OCRResult[]>

  /**
   * Extract and validate document metadata
   * Pulls document number, issuer, dates, security features
   * 
   * @param fileBuffer - Document image
   * @param documentType - Type of document (PASSPORT, NATIONAL_ID, etc.)
   * @returns Structured metadata with validation flags
   */
  analyzeMetadata(fileBuffer: Buffer, documentType: string): Promise<DocumentMetadataAnalysis>

  /**
   * Biometric analysis (face recognition, liveness detection)
   * 
   * @param fileBuffer - Document image or video buffer
   * @returns Biometric analysis results
   */
  analyzeBiometric(fileBuffer: Buffer): Promise<BiometricAnalysis>

  /**
   * Validate Machine Readable Zone (MRZ) on passports/IDs
   * 
   * @param fileBuffer - Document image
   * @returns MRZ string if found, validation result
   */
  validateMRZ(fileBuffer: Buffer): Promise<{
    mrzFound: boolean
    mrzData?: string
    mrzValid?: boolean
    extractedData?: Record<string, any>
  }>

  /**
   * ==================== COMPLIANCE & SCORING ====================
   */

  /**
   * Generate compliance score for document acceptance
   * Multi-factor scoring: integrity, authenticity, metadata, OCR, biometric, security
   * 
   * @param report - Forensic analysis report
   * @param customThresholds - Optional custom scoring thresholds
   * @returns Compliance score 0-100 with recommendation
   */
  scoreCompliance(
    report: ForensicReport,
    customThresholds?: Partial<ComplianceScore>
  ): Promise<ComplianceScore>

  /**
   * Get recommendation for blockchain action
   * Should this document be minted as SAS or NFT?
   * 
   * @param report - Forensic analysis report
   * @returns Blockchain action recommendation and reasoning
   */
  getBlockchainRecommendation(report: ForensicReport): Promise<{
    recommendation: 'MINT_SAS' | 'MINT_NFT' | 'MANUAL_REVIEW' | 'REJECT'
    confidence: number
    reasoning: string[]
  }>

  /**
   * ==================== TEMPLATE & VALIDATION ====================
   */

  /**
   * Load known document template for a document type
   * Used for validating document structure and layout
   * 
   * @param documentType - Type of document
   * @param country - Optional country code
   * @returns Template with expected structure
   */
  getDocumentTemplate(documentType: string, country?: string): Promise<DocumentTemplate>

  /**
   * Validate document against known template
   * 
   * @param fileBuffer - Document image
   * @param template - Document template
   * @returns Validation results and mismatches
   */
  validateAgainstTemplate(
    fileBuffer: Buffer,
    template: DocumentTemplate
  ): Promise<{
    isValid: boolean
    mismatches: string[]
    confidence: number
  }>

  /**
   * ==================== CACHING & OPTIMIZATION ====================
   */

  /**
   * Check cache for previously analyzed document
   * Avoids redundant API calls for identical files
   * 
   * @param fileHash - SHA-256 hash of file content
   * @returns Cached report if found and not expired, null otherwise
   */
  getCachedReport(fileHash: string): Promise<ForensicReport | null>

  /**
   * Clear forensic analysis cache
   * Useful for memory management in high-volume scenarios
   * 
   * @param olderThan - Optional: only clear entries older than this date
   */
  clearCache(olderThan?: Date): Promise<void>

  /**
   * Get cache statistics
   * 
   * @returns Cache hit/miss rates and memory usage
   */
  getCacheStats(): Promise<{
    entriesCount: number
    hitRate: number
    missRate: number
    totalMemoryMB: number
    oldestEntry?: Date
    newestEntry?: Date
  }>

  /**
   * ==================== HEALTH & MONITORING ====================
   */

  /**
   * Health check for Gemini API connection
   * 
   * @returns Connection status and quota information
   */
  healthCheck(): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'
    apiConnected: boolean
    quotaRemaining?: number
    quotaLimit?: number
    avgResponseTimeMs?: number
  }>

  /**
   * Get API usage metrics
   * 
   * @returns Usage statistics for monitoring and cost tracking
   */
  getUsageMetrics(): Promise<{
    totalAnalyzed: number
    totalBatches: number
    averageTimeMs: number
    totalCostUSD: number
    costPerDocument: number
    successRate: number
    lastResetDate: Date
  }>

  /**
   * ==================== CONFIGURATION ====================
   */

  /**
   * Update service configuration
   * Allows adjusting sensitivity, thresholds, model parameters
   * 
   * @param config - Configuration updates
   */
  updateConfig(config: Partial<{
    tamperSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    complianceThreshold: number
    cacheEnabled: boolean
    cacheTTLMinutes: number
    batchMaxSize: number
    timeoutSeconds: number
    retryAttempts: number
  }>): Promise<void>

  /**
   * ==================== ERROR HANDLING & RECOVERY ====================
   */

  /**
   * Retry failed forensic analysis
   * Implements exponential backoff for transient failures
   * 
   * @param input - Original analysis input
   * @param maxRetries - Maximum retry attempts
   * @returns Forensic report or throws after all retries exhausted
   */
  retryAnalysis(input: ForensicAnalysisInput, maxRetries?: number): Promise<ForensicReport>

  /**
   * Get failed analysis recovery options
   * 
   * @param reportId - ID of failed report
   * @returns Recovery actions and alternative analysis methods
   */
  getRecoveryOptions(reportId: string): Promise<{
    canRetry: boolean
    canUseAlternativeMethod: boolean
    alternativeMethods?: ('OCR_ONLY' | 'BIOMETRIC_ONLY' | 'METADATA_ONLY')[]
    estimatedCostUSD?: number
  }>
}
