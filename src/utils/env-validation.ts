/**
 * Environment variable validation utility
 * Ensures all required environment variables are set
 */

interface EnvVar {
  name: string
  required: boolean
  defaultValue?: string
  validator?: (value: string) => boolean
  errorMessage?: string
}

const envVars: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    validator: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
    errorMessage: 'DATABASE_URL must be a valid PostgreSQL connection string',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (v) => v.length >= 32,
    errorMessage: 'JWT_SECRET must be at least 32 characters long',
  },
  {
    name: 'NEXT_PUBLIC_PRIVY_APP_ID',
    required: true,
    validator: (v) => v.startsWith('cl'),
    errorMessage: 'NEXT_PUBLIC_PRIVY_APP_ID must be a valid Privy app ID',
  },
  {
    name: 'PRIVY_APP_SECRET',
    required: true,
    errorMessage: 'PRIVY_APP_SECRET is required',
  },
  {
    name: 'NEXT_PUBLIC_SOLANA_RPC_URL',
    required: false,
    defaultValue: 'https://api.devnet.solana.com',
    validator: (v) => v.startsWith('http'),
    errorMessage: 'NEXT_PUBLIC_SOLANA_RPC_URL must be a valid HTTP URL',
  },
  {
    name: 'GEMINI_API_KEY',
    required: false,
    errorMessage: 'GEMINI_API_KEY is recommended for AI features',
  },
  {
    name: 'NEXT_PUBLIC_ARWEAVE_URL',
    required: false,
    defaultValue: 'https://arweave.net',
    validator: (v) => v.startsWith('http'),
    errorMessage: 'NEXT_PUBLIC_ARWEAVE_URL must be a valid HTTP URL',
  },
  {
    name: 'NEXT_PUBLIC_ARWEAVE_GATEWAY',
    required: false,
    defaultValue: 'https://arweave.net',
    validator: (v) => v.startsWith('http'),
    errorMessage: 'NEXT_PUBLIC_ARWEAVE_GATEWAY must be a valid HTTP URL',
  },
]

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const envVar of envVars) {
    const value = process.env[envVar.name]

    if (!value) {
      if (envVar.required) {
        errors.push(
          `Missing required environment variable: ${envVar.name}${envVar.errorMessage ? ` (${envVar.errorMessage})` : ''}`
        )
      } else if (envVar.defaultValue) {
        // Set default value
        process.env[envVar.name] = envVar.defaultValue
      } else {
        warnings.push(`Optional environment variable not set: ${envVar.name}`)
      }
      continue
    }

    // Run validator if provided
    if (envVar.validator && !envVar.validator(value)) {
      errors.push(
        `Invalid value for ${envVar.name}: ${envVar.errorMessage || 'Validation failed'}`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name]
  
  if (!value) {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`Environment variable ${name} is not set`)
  }

  return value
}

/**
 * Validate environment on module load (only in production)
 */
if (process.env.NODE_ENV === 'production') {
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.error('❌ Environment validation failed:')
    validation.errors.forEach((error) => console.error(`  - ${error}`))
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Environment warnings:')
      validation.warnings.forEach((warning) => console.warn(`  - ${warning}`))
    }
    // Don't throw in production to allow graceful degradation
    // throw new Error('Environment validation failed')
  } else if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }
}

