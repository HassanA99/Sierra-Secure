/**
 * Forensic Service Health & Monitoring API
 * 
 * GET /api/forensic/health - Health check
 * GET /api/forensic/metrics - Usage metrics
 * GET /api/forensic/cache - Cache statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { AIDocumentForensicService } from '@/services/implementations/ai-forensic.service'

const forensicService = new AIDocumentForensicService()

/**
 * GET /api/forensic/health
 * Health check for forensic service
 */
export async function GET_HEALTH(request: NextRequest) {
  try {
    const health = await forensicService.healthCheck()

    return NextResponse.json({
      success: true,
      data: health,
    })
  } catch (error) {
    console.error('[Forensic Health] Error:', error)
    return NextResponse.json(
      {
        success: false,
        status: 'UNAVAILABLE',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    )
  }
}

/**
 * GET /api/forensic/metrics
 * Get API usage metrics
 */
export async function GET_METRICS(request: NextRequest) {
  try {
    const metrics = await forensicService.getUsageMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error('[Forensic Metrics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/forensic/cache
 * Get cache statistics
 */
export async function GET_CACHE(request: NextRequest) {
  try {
    const stats = await forensicService.getCacheStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('[Forensic Cache] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve cache stats' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forensic/cache/clear
 * Clear cache (admin only in production)
 */
export async function POST_CACHE_CLEAR(request: NextRequest) {
  try {
    const body = await request.json()
    const olderThan = body.olderThan ? new Date(body.olderThan) : undefined

    await forensicService.clearCache(olderThan)

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    console.error('[Forensic Cache Clear] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

/**
 * Routing handler for the API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  switch (endpoint) {
    case 'health':
      return GET_HEALTH(request)
    case 'metrics':
      return GET_METRICS(request)
    case 'cache':
      return GET_CACHE(request)
    default:
      return NextResponse.json(
        {
          success: true,
          message: 'Forensic Service Available',
          endpoints: {
            health: 'GET /api/forensic/health?endpoint=health',
            metrics: 'GET /api/forensic/health?endpoint=metrics',
            cache: 'GET /api/forensic/health?endpoint=cache',
          },
        },
        { status: 200 }
      )
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  if (endpoint === 'cache-clear') {
    return POST_CACHE_CLEAR(request)
  }

  return NextResponse.json(
    { error: 'Unknown endpoint' },
    { status: 404 }
  )
}
