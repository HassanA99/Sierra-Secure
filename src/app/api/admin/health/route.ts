import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { successResponse, errorResponse } from '@/utils/api-response'
import { handleApiError } from '@/utils/error-handler'
import { withTimeout } from '@/utils/error-handler'
import { getMissingEnvs } from '@/lib/env/check'

/**
 * GET /api/admin/health
 * System health check and metrics
 * Returns: database status, blockchain status, storage status
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only ADMIN role can access health check' },
        { status: 403 }
      )
    }

    const startTime = Date.now()

    // Check database connectivity
    let dbStatus = 'HEALTHY'
    let dbMessage = 'Connected'
    let dbResponseTime = 0
    try {
      const dbStart = Date.now()
      await withTimeout(prisma.user.count(), 5000, 'Database query timeout')
      dbResponseTime = Date.now() - dbStart
    } catch (err) {
      dbStatus = 'UNHEALTHY'
      dbMessage = err instanceof Error ? err.message : 'Connection failed'
    }

    // Check blockchain connectivity
    let blockchainStatus = 'HEALTHY'
    let blockchainMessage = 'Connected'
    let blockchainResponseTime = 0
    try {
      const { Connection } = await import('@solana/web3.js')
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      const connection = new Connection(rpcUrl, 'confirmed')
      const blockchainStart = Date.now()
      await withTimeout(connection.getVersion(), 5000, 'Blockchain RPC timeout')
      blockchainResponseTime = Date.now() - blockchainStart
    } catch (err) {
      blockchainStatus = 'UNHEALTHY'
      blockchainMessage = err instanceof Error ? err.message : 'Connection failed'
    }

    // Check Arweave connectivity
    let storageStatus = 'HEALTHY'
    let storageMessage = 'Connected'
    let storageResponseTime = 0
    try {
      const arweaveUrl = process.env.NEXT_PUBLIC_ARWEAVE_URL || 'https://arweave.net'
      const storageStart = Date.now()
      const response = await withTimeout(
        fetch(`${arweaveUrl}/info`, { method: 'GET', signal: AbortSignal.timeout(5000) }),
        5000,
        'Arweave connection timeout'
      )
      if (!response.ok) throw new Error(`Arweave returned ${response.status}`)
      storageResponseTime = Date.now() - storageStart
    } catch (err) {
      storageStatus = 'UNHEALTHY'
      storageMessage = err instanceof Error ? err.message : 'Connection failed'
    }

    // Check AI service (Gemini)
    let forensicStatus = 'HEALTHY'
    let forensicMessage = 'Ready'
    let forensicResponseTime = 0
    try {
      if (!process.env.GEMINI_API_KEY) {
        forensicStatus = 'DEGRADED'
        forensicMessage = 'API key not configured'
      } else {
        // Simple check - verify API key is set
        forensicStatus = 'HEALTHY'
        forensicMessage = 'API key configured'
      }
    } catch (err) {
      forensicStatus = 'UNHEALTHY'
      forensicMessage = err instanceof Error ? err.message : 'Service unavailable'
    }

    // Get system statistics
    const [userCount, documentCount, staffCount, verifiedCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.document.count().catch(() => 0),
      prisma.user.count({ where: { role: { in: ['VERIFIER', 'MAKER'] } } }).catch(() => 0),
      prisma.document.count({ where: { status: 'VERIFIED' } }).catch(() => 0),
    ])

    const totalResponseTime = Date.now() - startTime
    const overallStatus = 
      dbStatus === 'HEALTHY' && blockchainStatus === 'HEALTHY' && storageStatus === 'HEALTHY'
        ? 'OPERATIONAL'
        : 'DEGRADED'

    return successResponse(
      {
        missingEnvs: getMissingEnvs(),
        status: overallStatus,
        services: {
          database: {
            status: dbStatus,
            message: dbMessage,
            responseTime: `${dbResponseTime}ms`,
          },
          blockchain: {
            status: blockchainStatus,
            message: blockchainMessage,
            responseTime: `${blockchainResponseTime}ms`,
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          },
          storage: {
            status: storageStatus,
            message: storageMessage,
            responseTime: `${storageResponseTime}ms`,
            gatewayUrl: process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY || 'https://arweave.net',
          },
          forensic: {
            status: forensicStatus,
            message: forensicMessage,
            responseTime: `${forensicResponseTime}ms`,
            model: 'gemini-2.0-flash',
          },
        },
        metrics: {
          totalUsers: userCount,
          totalDocuments: documentCount,
          staffMembers: staffCount,
          verifiedDocuments: verifiedCount,
          pendingDocuments: documentCount - verifiedCount,
        },
        version: process.env.APP_VERSION || '1.0.0',
        responseTime: `${totalResponseTime}ms`,
      },
      'Health check completed',
      {
        timestamp: new Date().toISOString(),
      }
    )
  } catch (error) {
    return handleApiError(error, 'HealthCheck')
  }
}
