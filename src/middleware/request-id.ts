import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Request ID middleware
 * Adds a unique request ID to all requests for tracing
 */

const REQUEST_ID_HEADER = 'x-request-id'
const REQUEST_ID_RESPONSE_HEADER = 'X-Request-ID'

/**
 * Middleware to add request ID to requests
 */
export function withRequestId(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Get or generate request ID
    let requestId = request.headers.get(REQUEST_ID_HEADER)
    
    if (!requestId) {
      requestId = randomUUID()
    }

    // Add request ID to request headers
    const newHeaders = new Headers(request.headers)
    newHeaders.set(REQUEST_ID_HEADER, requestId)

    // Create new request with request ID
    const newRequest = new NextRequest(request, {
      headers: newHeaders,
    })

    // Call handler
    const response = await handler(newRequest)

    // Add request ID to response headers
    response.headers.set(REQUEST_ID_RESPONSE_HEADER, requestId)

    return response
  }
}

/**
 * Get request ID from request
 */
export function getRequestId(request: NextRequest): string | null {
  return request.headers.get(REQUEST_ID_HEADER)
}

/**
 * Add request ID to response
 */
export function addRequestIdToResponse(response: NextResponse, requestId: string): NextResponse {
  response.headers.set(REQUEST_ID_RESPONSE_HEADER, requestId)
  return response
}

