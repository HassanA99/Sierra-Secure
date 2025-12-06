import { NextResponse } from 'next/server'

/**
 * Standardized API response utilities
 * Ensures consistent response format across all endpoints
 */

export interface ApiResponseData<T = any> {
  success: boolean
  data?: T
  message?: string
  meta?: {
    total?: number
    count?: number
    skip?: number
    take?: number
    hasMore?: boolean
    [key: string]: any
  }
  error?: string
  errors?: string[]
  timestamp?: string
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponseData['meta'],
  status: number = 200
): NextResponse<ApiResponseData<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  errors?: string[],
  status: number = 400,
  message?: string
): NextResponse<ApiResponseData> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(errors && { errors }),
      ...(message && { message }),
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  skip: number,
  take: number,
  message?: string
): NextResponse<ApiResponseData<T[]>> {
  return successResponse(
    items,
    message,
    {
      total,
      count: items.length,
      skip,
      take,
      hasMore: skip + take < total,
    },
    200
  )
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponseData<T>> {
  return successResponse(data, message, undefined, 201)
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

