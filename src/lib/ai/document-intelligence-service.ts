/**
 * AI-Powered Document Intelligence Service
 * 
 * Uses Google Gemini 2.0 (multimodal) for:
 * - Deepfake detection
 * - Document tampering analysis
 * - Automatic document classification
 * - OCR and data extraction
 * - Biometric liveness detection
 * - Fraud risk scoring
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DocumentAIAnalysis, FraudDetectionAnalysis } from './revolutionary-architecture'
import crypto from 'crypto'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')

export class DocumentIntelligenceService {
  /**
   * Analyze document image for authenticity and extract data
   * Uses Gemini's vision capabilities
   */
  async analyzeDocumentAuthenticity(
    imageBase64: string,
    documentType?: string,
  ): Promise<DocumentAIAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
You are an expert document authentication specialist. Analyze this document image for authenticity.

Provide a detailed analysis including:

1. AUTHENTICITY ASSESSMENT
   - Overall authenticity score (0-100)
   - Risk level: LOW, MEDIUM, HIGH, or CRITICAL
   - Specific tampering indicators (if any)

2. DOCUMENT CLASSIFICATION
   - Document type (passport, driver's license, diploma, certificate, ID card, etc.)
   - Issuing country
   - Issuing authority
   - Security features present

3. TEMPORAL VALIDATION
   - Is the document valid now?
   - Issue date
   - Expiry date
   - Days until expiration

4. EXTRACTED DATA (if readable)
   - Full name
   - Date of birth
   - ID/Reference number
   - Issue date
   - Expiry date
   - Any other visible important fields

5. BIOMETRIC ANALYSIS (if face visible)
   - Is there a face in the document?
   - Does it appear to be a real photo or digital manipulation?
   - Signs of deepfake indicators (eye quality, skin texture, artifacts)
   - Liveness indicators (natural lighting, realistic features)

6. FRAUD INDICATORS
   - List any red flags or suspicious elements
   - Quality issues (print quality, alignment, colors)
   - Security feature concerns
   - Data inconsistencies

7. RECOMMENDATION
   - AUTO_APPROVE: Document appears legitimate
   - MANUAL_REVIEW: Some concerns need human verification
   - REJECT: Clear signs of forgery or tampering
   - Confidence level (0-100)

Provide response as JSON.
      `

      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ])

      const responseText = response.response.text()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('Could not parse Gemini response as JSON')
      }

      const analysisData = JSON.parse(jsonMatch[0])

      return {
        authenticityScore: analysisData.authenticity_score || 0,
        deepfakeRisk: analysisData.deepfake_risk || 'UNKNOWN',
        tamperedRegions: analysisData.tampered_regions || [],
        documentType: analysisData.document_type || 'UNKNOWN',
        issuingCountry: analysisData.issuing_country,
        issuingAuthority: analysisData.issuing_authority,
        isValidNow: analysisData.is_valid_now || false,
        expiresAt: analysisData.expires_at ? new Date(analysisData.expires_at) : undefined,
        issuedAt: analysisData.issued_at ? new Date(analysisData.issued_at) : undefined,
        daysUntilExpiry: analysisData.days_until_expiry,
        extractedFields: {
          name: analysisData.extracted_data?.name,
          dateOfBirth: analysisData.extracted_data?.date_of_birth,
          idNumber: analysisData.extracted_data?.id_number,
          issueDate: analysisData.extracted_data?.issue_date,
          expiryDate: analysisData.extracted_data?.expiry_date,
        },
        faceDetected: analysisData.face_detected || false,
        faceLivenessCheck: analysisData.face_liveness_check,
        recommendedAction: analysisData.recommendation || 'MANUAL_REVIEW',
        confidence: analysisData.confidence || 50,
        reasonForRecommendation: analysisData.reason || 'Unable to determine',
      }
    } catch (error) {
      console.error('Document analysis error:', error)
      throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Detect deepfakes and biometric spoofing
   * Uses advanced ML models
   */
  async detectDeepfakeAndSpoof(imageBase64: string): Promise<FraudDetectionAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
You are a deepfake detection expert. Analyze this image for signs of deepfake, face swapping, or biometric spoofing.

Provide detailed analysis:

1. DEEPFAKE DETECTION
   - Deepfake likelihood score (0-100)
   - Artifacts indicating digital manipulation
   - AI-generated face characteristics

2. LIVENESS DETECTION
   - Is the face alive (real person) or a photo/video?
   - Eye blink patterns
   - Head movement naturalness
   - Skin texture realism
   - Blood flow under skin

3. FORGERY INDICATORS
   - Edge artifacts
   - Blending inconsistencies
   - Lighting mismatches
   - Reflection inconsistencies

4. SPOOFING DETECTION
   - Is this a printed photo being shown to camera?
   - Is this a screen-based presentation?
   - Is this a 3D mask?
   - Naturalness score

5. OVERALL FRAUD RISK
   - Risk score (0-100)
   - Risk level: LOW, MEDIUM, HIGH, CRITICAL
   - Specific red flags

Respond as JSON.
      `

      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ])

      const responseText = response.response.text()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('Could not parse Gemini response')
      }

      const analysisData = JSON.parse(jsonMatch[0])

      return {
        deepfakeScore: analysisData.deepfake_score || 0,
        tamperingDetected: analysisData.tampering_detected || false,
        tamperingAreas: analysisData.tampering_areas || [],
        livenessScore: analysisData.liveness_score || 0,
        eyeBlinkDetected: analysisData.eye_blink_detected || false,
        headMovementDetected: analysisData.head_movement_detected || false,
        skinTextureRealistic: analysisData.skin_texture_realistic || false,
        overallFraudRisk: analysisData.overall_fraud_risk || 0,
        redFlags: analysisData.red_flags || [],
      }
    } catch (error) {
      console.error('Deepfake detection error:', error)
      throw error
    }
  }

  /**
   * Extract and verify biometric data from face
   * Computes hash for duplicate detection
   */
  async extractBiometricData(imageBase64: string): Promise<{
    faceDetected: boolean
    biometricHash: string
    confidence: number
    landmarks: Record<string, unknown>
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
Extract biometric data from the face in this image.

For a detected face, describe:
1. Key facial landmarks (eyes, nose, mouth, jawline)
2. Unique characteristics (scars, moles, asymmetries)
3. Measurement ratios (eye distance, face shape, proportions)
4. Overall facial geometry description

This will be used to create a unique biometric hash for duplicate detection across documents.

Respond as JSON with format:
{
  "face_detected": boolean,
  "landmarks": {
    "eye_distance": value,
    "face_shape": "...",
    "other_features": "..."
  }
}
      `

      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ])

      const responseText = response.response.text()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('Could not parse biometric data')
      }

      const biometricData = JSON.parse(jsonMatch[0])

      // Create a SHA256 hash of the biometric data for duplicate detection
      const biometricString = JSON.stringify(biometricData.landmarks || {})
      const biometricHash = crypto.createHash('sha256').update(biometricString).digest('hex')

      return {
        faceDetected: biometricData.face_detected || false,
        biometricHash,
        confidence: biometricData.confidence || 50,
        landmarks: biometricData.landmarks || {},
      }
    } catch (error) {
      console.error('Biometric extraction error:', error)
      throw error
    }
  }

  /**
   * Comprehensive fraud detection combining all analyses
   */
  async detectFraud(imageBase64: string): Promise<FraudDetectionAnalysis> {
    try {
      // Run parallel analyses
      const [deepfakeAnalysis, biometricData] = await Promise.all([
        this.detectDeepfakeAndSpoof(imageBase64),
        this.extractBiometricData(imageBase64),
      ])

      // Combine results
      const analysis: FraudDetectionAnalysis = {
        deepfakeScore: deepfakeAnalysis.deepfakeScore,
        tamperingDetected: deepfakeAnalysis.tamperingDetected,
        tamperingAreas: deepfakeAnalysis.tamperingAreas,
        livenessScore: deepfakeAnalysis.livenessScore,
        eyeBlinkDetected: deepfakeAnalysis.eyeBlinkDetected,
        headMovementDetected: deepfakeAnalysis.headMovementDetected,
        skinTextureRealistic: deepfakeAnalysis.skinTextureRealistic,
        biometricHashMatch: undefined,
        ocrConfidence: 85, // Would extract from document analysis
        validationErrors: [],
        idNumberExists: false,
        issuingAuthorityVerified: false,
        documentFormatValid: false,
        overallFraudRisk:
          (deepfakeAnalysis.deepfakeScore +
            deepfakeAnalysis.livenessScore +
            deepfakeAnalysis.overallFraudRisk) /
          3,
        redFlags: deepfakeAnalysis.redFlags,
      }

      return analysis
    } catch (error) {
      console.error('Fraud detection error:', error)
      throw error
    }
  }
}

// Singleton instance
export const documentIntelligence = new DocumentIntelligenceService()

export default DocumentIntelligenceService
