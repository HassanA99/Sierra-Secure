import { NextRequest, NextResponse } from 'next/server'
import { FeeRelayerService } from '@/services/implementations/fee-relayer.service'

/**
 * GET /api/pricing
 * 
 * Show pricing to citizens
 * 
 * ANSWER: Everything is FREE
 * 
 * All blockchain transaction fees are paid by the government
 * Citizens never pay a cent to use the system
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    uploadDocument: {
      displayPrice: 'FREE',
      actualCost: 0,
      paidBy: 'Government',
    },
    shareDocument: {
      displayPrice: 'FREE',
      actualCost: 0,
      paidBy: 'Government',
    },
    mintNFT: {
      displayPrice: 'FREE',
      actualCost: 0,
      paidBy: 'Government',
    },
    issueAttestation: {
      displayPrice: 'FREE',
      actualCost: 0,
      paidBy: 'Government',
    },
    deleteDocument: {
      displayPrice: 'FREE',
      actualCost: 0,
      paidBy: 'Government',
    },
    summary: {
      message: 'No fees for citizens ever',
      guarantee: 'You will never be charged to access or share your documents',
      supportedCountries: ['Kenya', 'Nigeria', 'Ghana', 'South Africa'],
    },
  })
}
