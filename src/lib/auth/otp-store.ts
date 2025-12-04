/**
 * In-memory OTP storage
 * 
 * In production, this should be replaced with Redis or a database
 * with proper TTL and rate limiting
 */

interface OTPRecord {
  code: string
  timestamp: number
  attempts: number
  expiresAt: number
}

const otpStore = new Map<string, OTPRecord>()

// Cleanup expired OTPs every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of otpStore) {
    if (record.expiresAt < now) {
      otpStore.delete(key)
    }
  }
}, 60 * 1000)

export function generateAndStoreOTP(email: string): string {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const otpKey = `otp:${email}`
  otpStore.set(otpKey, {
    code: otp,
    timestamp: Date.now(),
    attempts: 0,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  })

  return otp
}

export function verifyOTP(email: string, otp: string): { valid: boolean; error?: string } {
  const otpKey = `otp:${email}`
  const record = otpStore.get(otpKey)

  if (!record) {
    return { valid: false, error: 'OTP not found or expired' }
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(otpKey)
    return { valid: false, error: 'OTP expired' }
  }

  if (record.attempts >= 5) {
    otpStore.delete(otpKey)
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' }
  }

  if (record.code !== otp) {
    record.attempts++
    return { valid: false, error: 'Invalid OTP' }
  }

  // OTP is valid, remove it
  otpStore.delete(otpKey)
  return { valid: true }
}

export function deleteOTP(email: string): void {
  const otpKey = `otp:${email}`
  otpStore.delete(otpKey)
}
