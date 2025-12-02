/**
 * AI Document Forensic Analysis Types
 * 
 * Comprehensive type definitions for Gemini multimodal document verification,
 * tamper detection, and compliance scoring before blockchain issuance.
 */

/**
 * Tamper Detection Result
 * Identifies potentially forged or manipulated document elements
 */
export interface TamperIndicator {
  type: 'CLONE_ARTIFACT' | 'FONT_INCONSISTENCY' | 'COMPRESSION_ARTIFACT' | 'SIGNATURE_ANOMALY' | 'WATERMARK_TAMPERING' | 'TEXT_MISALIGNMENT' | 'PIXEL_ANOMALY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number // 0-1
  location?: {
    x: number
    y: number
    width: number
    height: number
  }
  description: string
  recommendation: string
}

/**
 * OCR Extraction Result
 * High-confidence text extraction with spatial coordinates
 */
export interface OCRResult {
  text: string
  confidence: number // 0-1
  boundingBox?: {
    topLeft: { x: number; y: number }
    topRight: { x: number; y: number }
    bottomLeft: { x: number; y: number }
    bottomRight: { x: number; y: number }
  }
  language: string
  fontSize?: number
  fontName?: string
  isBold?: boolean
  isItalic?: boolean
}

/**
 * Document Metadata Analysis
 * Extracts and validates document-specific metadata
 */
export interface DocumentMetadataAnalysis {
  issuingCountry?: string
  issuingAuthority?: string
  documentNumber?: string
  holderName?: string
  dateOfBirth?: string
  issueDate?: Date
  expiryDate?: Date
  mrz?: string // Machine Readable Zone for passports/IDs
  mrzValid?: boolean
  documentQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  resolutionDPI?: number
  colorProfile?: string
  hasSecurityFeatures: boolean
  securityFeatures?: string[]
}

/**
 * Biometric Verification (if applicable)
 * Face recognition and biometric data validation
 */
export interface BiometricAnalysis {
  hasFaceImage: boolean
  faceConfidence?: number // 0-1
  faceQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  faceMatchesMetadata?: boolean // If document has name field
  ageApproximate?: number
  facialFeatures?: {
    hasGlasses: boolean
    hasMask: boolean
    facialHairPresent: boolean
    lighting: 'GOOD' | 'FAIR' | 'POOR'
  }
  livenessScore?: number // 0-1 (for video/3D images)
}

/**
 * Compliance & Validation Scoring
 * Multi-factor scoring system for document acceptance
 */
export interface ComplianceScore {
  overall: number // 0-100
  integrity: number // 0-100: Document tampering analysis
  authenticity: number // 0-100: Known forged pattern detection
  metadata: number // 0-100: Metadata consistency
  ocr: number // 0-100: Text recognition confidence
  biometric: number // 0-100: Face/biometric validation
  security: number // 0-100: Security features present
  thresholdMet: boolean // true if overall >= 75
  recommendedAction: 'APPROVED' | 'REVIEW' | 'REJECTED'
}

/**
 * Complete Forensic Report
 * Comprehensive document analysis before blockchain commitment
 */
export interface ForensicReport {
  documentId: string
  analysisId: string
  timestamp: Date
  status: 'ANALYZING' | 'COMPLETED' | 'FAILED'
  
  // Core analysis results
  tampering: {
    detected: boolean
    indicators: TamperIndicator[]
    overallTamperRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }
  
  ocrAnalysis: {
    extractedText: string
    zones: OCRResult[]
    confidence: number // 0-1
    language: string
  }
  
  metadata: DocumentMetadataAnalysis
  
  biometric: BiometricAnalysis
  
  compliance: ComplianceScore
  
  // Detailed findings
  findings: {
    strengths: string[]
    weaknesses: string[]
    anomalies: string[]
    recommendations: string[]
  }
  
  // Blockchain readiness
  blockchainReady: boolean
  blockchainRecommendation: 'MINT_SAS' | 'MINT_NFT' | 'MANUAL_REVIEW' | 'REJECT'
  
  // Audit trail
  aiModel: string // 'gemini-2.0-flash' or similar
  analysisMethod: 'MULTIMODAL' | 'OCR_ONLY' | 'BIOMETRIC_ONLY' | 'FULL_SUITE'
  costEstimate?: number // API call cost
  
  // Error handling
  errors?: string[]
}

/**
 * Forensic Analysis Request Input
 * Configuration for forensic analysis
 */
export interface ForensicAnalysisInput {
  documentId: string
  fileBuffer: Buffer
  mimeType: string
  documentType: string
  expectedMetadata?: Record<string, any>
  performBiometricAnalysis?: boolean
  performMRZAnalysis?: boolean
  strictMode?: boolean // If true, lower compliance thresholds
  customThresholds?: Partial<ComplianceScore>
}

/**
 * Batch Forensic Analysis
 * Process multiple documents efficiently
 */
export interface BatchForensicInput {
  documents: ForensicAnalysisInput[]
  priorityMode?: 'SPEED' | 'ACCURACY' | 'BALANCED'
}

export interface BatchForensicResult {
  batchId: string
  totalDocuments: number
  completedAnalysis: ForensicReport[]
  failedDocuments: Array<{
    documentId: string
    error: string
  }>
  summary: {
    approvedCount: number
    reviewCount: number
    rejectedCount: number
    totalTamperingDetected: number
    averageComplianceScore: number
    processingTimeMs: number
  }
}

/**
 * Forensic Cache Entry
 * Cache forensic results to optimize repeated analysis
 */
export interface ForensicCacheEntry {
  fileHash: string // SHA-256 of file content
  reportHash: string // Hash of generated report
  report: ForensicReport
  cachedAt: Date
  expiresAt: Date
  hitCount: number
}

/**
 * Real-time Forensic Progress
 * Stream forensic analysis progress to client
 */
export interface ForensicProgressUpdate {
  documentId: string
  analysisId: string
  stage: 'INITIALIZING' | 'LOADING_IMAGE' | 'TAMPER_ANALYSIS' | 'OCR_EXTRACTION' | 'METADATA_ANALYSIS' | 'BIOMETRIC_ANALYSIS' | 'COMPLIANCE_SCORING' | 'COMPLETE'
  progress: number // 0-100
  message: string
  currentResult?: Partial<ForensicReport>
}

/**
 * Template Validation for Document Types
 * Known patterns for specific document types
 */
export interface DocumentTemplate {
  type: string
  country?: string
  expectedLayout: {
    hasPhotoZone: boolean
    photoLocation: 'TOP_LEFT' | 'TOP_RIGHT' | 'CENTER' | 'BOTTOM'
    hasSecurityThread: boolean
    hasHologram: boolean
    hasMRZ: boolean
    mrzLocation?: string
  }
  requiredMetadataFields: string[]
  expectedColorProfile?: string
  expectedDPI?: number
}
