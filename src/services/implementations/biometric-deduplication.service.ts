import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export class BiometricDeduplicationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Extract biometric data from forensic analysis
   * The forensic service already extracts facial recognition data from ID documents
   * We use this to prevent duplicate registrations
   */
  async processBiometricData(
    forensicReport: any,
    userId: string
  ): Promise<{ biometricHash: string; deduplicateMatch: string | null }> {
    // Extract facial recognition data from Gemini analysis
    const faceData = {
      hasFaceImage: forensicReport.hasFaceImage,
      faceConfidence: forensicReport.faceConfidence,
      faceQuality: forensicReport.biometricAnalysis?.faceQuality,
      facialFeatures: forensicReport.biometricAnalysis?.facialFeatures,
    }

    if (!faceData.hasFaceImage) {
      return { biometricHash: '', deduplicateMatch: null }
    }

    // Create SHA256 hash of facial data for comparison
    // We hash the confidence + quality + facial features to create unique signature
    const dataToHash = JSON.stringify({
      faceConfidence: faceData.faceConfidence,
      quality: faceData.faceQuality,
      features: faceData.facialFeatures,
    })

    const biometricHash = crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex')

    // Check if this biometric already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        biometricHash,
        id: {
          not: userId, // Exclude current user
        },
      },
    })

    return {
      biometricHash,
      deduplicateMatch: existingUser?.id || null,
    }
  }

  /**
   * Check if user trying to register has duplicate biometric
   * Called during citizen onboarding
   */
  async checkForDuplicate(biometricHash: string): Promise<{
    isDuplicate: boolean
    existingUser?: {
      id: string
      phoneNumber: string
      firstName: string
      lastName: string
    }
  }> {
    if (!biometricHash) {
      return { isDuplicate: false }
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { biometricHash },
    })

    if (!existingUser) {
      return { isDuplicate: false }
    }

    return {
      isDuplicate: true,
      existingUser: {
        id: existingUser.id,
        phoneNumber: existingUser.phoneNumber || 'Unknown',
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
    }
  }

  /**
   * Store biometric data for a user
   * Called after document upload and forensic analysis
   */
  async storeBiometricData(
    userId: string,
    biometricData: any,
    biometricHash: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        biometricData,
        biometricHash,
      },
    })
  }

  /**
   * Get biometric data for a user
   */
  async getBiometricData(userId: string): Promise<{
    biometricData: any
    biometricHash: string
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        biometricData: true,
        biometricHash: true,
      },
    })

    return user
  }
}
