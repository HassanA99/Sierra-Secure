"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ForensicResultsPanel from '@/src/components/documents/forensic/ForensicResultsPanel'

type ForensicApiResponse = {
  success: boolean
  data?: any
  error?: string
}

const ForensicDemoPage: React.FC = () => {
  // Always call useParams at the top level (no conditional calls)
  const params = useParams() as { documentId?: string }
  const documentId = params?.documentId || 'demo-document-id'

  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchReport = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/documents/${documentId}/forensic`, { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`HTTP ${res.status}: ${text}`)
        }
        const json: ForensicApiResponse = await res.json()
        if (!mounted) return
        if (!json.success) {
          setError(json.error || 'Unknown error from forensic API')
          setReport(null)
        } else {
          setReport(json.data)
        }
      } catch (err: any) {
        if (!mounted) return
        setError(err.message || String(err))
        setReport(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchReport()

    return () => {
      mounted = false
    }
  }, [documentId])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Forensic Analysis — Document: {documentId}</h1>

      {loading && (
        <div className="text-sm text-gray-600">Loading forensic report...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 p-3 bg-red-50 rounded">Error: {error}</div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          <ForensicResultsPanel report={report} />
        </div>
      )}
    </div>
  )
}

export default ForensicDemoPage
