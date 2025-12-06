import { NextResponse } from 'next/server'

/**
 * Standardized error handler for API routes
 * Provides consistent error responses across the application
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const message = error instanceof Error ? error.message : String(error)
  const errorName = error instanceof Error ? error.name : 'UnknownError'
  
  // Log error with context
  console.error(`[API Error]${context ? ` [${context}]` : ''}`, {
    error: message,
    name: errorName,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  })

  // Determine status code based on error type
  let status = 500
  let errorMessage = 'Operation failed'

  if (errorName === 'ValidationError' || message.includes('validation')) {
    status = 400
    errorMessage = 'Validation error'
  } else if (errorName === 'UnauthorizedError' || message.includes('unauthorized') || message.includes('authentication')) {
    status = 401
    errorMessage = 'Authentication required'
  } else if (errorName === 'ForbiddenError' || message.includes('forbidden') || message.includes('permission')) {
    status = 403
    errorMessage = 'Insufficient permissions'
  } else if (message.includes('not found')) {
    status = 404
    errorMessage = 'Resource not found'
  } else if (message.includes('timeout')) {
    status = 504
    errorMessage = 'Operation timeout'
  }

  return NextResponse.json(
    {
      error: errorMessage,
      message: process.env.NODE_ENV === 'development' ? message : undefined,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && context ? { context } : {}),
    },
    { status }
  )
}

/**
 * Wraps async route handlers with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error, context)
    }
  }) as T
}

/**
 * Creates a timeout wrapper for promises
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

