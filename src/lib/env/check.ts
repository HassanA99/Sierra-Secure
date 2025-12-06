export const REQUIRED_ENVS = [
  'NEXT_PUBLIC_PRIVY_APP_ID',
  'PRIVY_APP_SECRET',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_SOLANA_RPC_URL',
]

export function getMissingEnvs() {
  return REQUIRED_ENVS.filter((name) => {
    const v = process.env[name]
    return !v || v === ''
  })
}

export function ensureEnvs() {
  const missing = getMissingEnvs()
  if (missing.length > 0) {
    console.warn('[env-check] Missing environment variables:', missing.join(', '))
  }
  return missing
}

export default getMissingEnvs
