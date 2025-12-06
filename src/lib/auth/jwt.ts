import { sign, verify } from 'jsonwebtoken'

// Validate JWT secret is set
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'dev-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment')
  }
  console.warn('⚠️  Using default JWT_SECRET. Set JWT_SECRET environment variable for production.')
}

const JWT_SECRET_FINAL = JWT_SECRET || 'dev-secret-key-change-in-production'

export function generateToken(payload: {
  userId: string
  email?: string
  privyUserId?: string
  role: string
}) {
  return sign(payload, JWT_SECRET_FINAL, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET_FINAL)
  } catch (error) {
    return null
  }
}
