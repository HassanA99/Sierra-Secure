"use client"
import React, { useState, useEffect } from 'react'

interface ForensicStatus {
  documentId: string
  status: 'PENDING' | 'ANALYZING' | 'COMPLETED'
  decision?: 'APPROVED' | 'UNDER_REVIEW' | 'REJECTED'
  overallScore?: number
  userMessage?: string
  blockchainStatus?: string
  breakdown?: {
    integrityScore: number
    authenticityScore: number
    metadataScore: number
    ocrScore: number
    biometricScore: number
    securityScore: number
  }
  tamperingDetected?: boolean
  analyzedAt?: string
}

interface ForensicStatusPanelProps {
  documentId: string
  onStatusChange?: (status: ForensicStatus) => void
  hideDetails?: boolean // Show only decision, not breakdown
}

/**
 * Forensic Analysis Status Panel
 * 
 * Shows real-time status of document security analysis
 * - PENDING: Waiting to analyze
 * - ANALYZING: "Analyzing Document Security..." (shows spinner)
 * - COMPLETED: Shows decision with user-friendly message
 * 
 * Decisions:
 * - APPROVED (85+): Green checkmark, document will be written to blockchain
 * - UNDER_REVIEW (70-84): Orange warning, sent to government staff for review
 * - REJECTED (<70): Red X, user should upload clearer copy
 */
export default function ForensicStatusPanel({
  documentId,
  onStatusChange,
  hideDetails = true,
}: ForensicStatusPanelProps) {
  const [status, setStatus] = useState<ForensicStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Poll forensic status every 1 second until complete
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('nddv_token')
        const userId = localStorage.getItem('nddv_user_id')

        const res = await fetch(`/api/forensic/status/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '',
          },
        })

        if (!res.ok) {
          throw new Error('Failed to get forensic status')
        }

        const data = await res.json()
        setStatus(data)
        setLoading(false)
        onStatusChange?.(data)

        // Stop polling when analysis is complete
        if (data.status === 'COMPLETED') {
          if (interval) clearInterval(interval)
        }
      } catch (err) {
        console.error('Error fetching forensic status:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    // Fetch immediately
    fetchStatus()

    // Then poll every 1 second
    interval = setInterval(fetchStatus, 1000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [documentId, onStatusChange])

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <div>
            <p className="font-medium text-blue-900">Analyzing Document Security...</p>
            <p className="text-sm text-blue-700">This usually takes 2-3 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Analysis Error</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!status) {
    return null
  }

  // APPROVED (Score 85+)
  if (status.decision === 'APPROVED') {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">✓</div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">Document Approved</p>
            <p className="text-sm text-green-700 mt-1">
              {status.userMessage}
            </p>
            <p className="text-xs text-green-600 mt-2">
              Trust Score: {status.overallScore}/100
            </p>
          </div>
        </div>

        {/* Score Breakdown (staff view) */}
        {!hideDetails && status.breakdown && (
          <div className="mt-4 p-3 bg-white rounded border border-green-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Analysis Breakdown:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Integrity: {status.breakdown.integrityScore}/100</div>
              <div>Authenticity: {status.breakdown.authenticityScore}/100</div>
              <div>Metadata: {status.breakdown.metadataScore}/100</div>
              <div>OCR: {status.breakdown.ocrScore}/100</div>
              <div>Biometric: {status.breakdown.biometricScore}/100</div>
              <div>Security: {status.breakdown.securityScore}/100</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // UNDER_REVIEW (Score 70-84)
  if (status.decision === 'UNDER_REVIEW') {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⏳</div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Document Under Review</p>
            <p className="text-sm text-amber-700 mt-1">
              {status.userMessage}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Trust Score: {status.overallScore}/100
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        {!hideDetails && status.breakdown && (
          <div className="mt-4 p-3 bg-white rounded border border-amber-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Analysis Breakdown:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Integrity: {status.breakdown.integrityScore}/100</div>
              <div>Authenticity: {status.breakdown.authenticityScore}/100</div>
              <div>Metadata: {status.breakdown.metadataScore}/100</div>
              <div>OCR: {status.breakdown.ocrScore}/100</div>
              <div>Biometric: {status.breakdown.biometricScore}/100</div>
              <div>Security: {status.breakdown.securityScore}/100</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // REJECTED (Score <70)
  if (status.decision === 'REJECTED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">✗</div>
          <div className="flex-1">
            <p className="font-semibold text-red-900">Document Rejected</p>
            <p className="text-sm text-red-700 mt-1">
              {status.userMessage}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Trust Score: {status.overallScore}/100 (minimum 70 required)
            </p>
            {status.tamperingDetected && (
              <p className="text-xs text-red-600 mt-1 font-semibold">
                ⚠️ Tampering detected - please provide original document
              </p>
            )}
          </div>
        </div>

        {/* What to do */}
        <div className="mt-4 p-3 bg-white rounded border border-red-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">What to do:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Take a new photo with better lighting</li>
            <li>Make sure the entire document is visible</li>
            <li>Avoid glare and shadows</li>
            <li>Hold the phone steady and level</li>
          </ul>
        </div>
      </div>
    )
  }

  return null
}
