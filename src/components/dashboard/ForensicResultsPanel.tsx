"use client"
import React, { useEffect, useState } from 'react'

type Forensic = {
  analysisId?: string
  complianceScore?: number
  tamperingDetected?: boolean
  confidenceLevel?: number
  ocrResults?: any
  recommendations?: string[]
  analyzedAt?: string
}

export default function ForensicResultsPanel({ selectedDocumentId }: { selectedDocumentId?: string }) {
  const [forensic, setForensic] = useState<Forensic | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!selectedDocumentId) {
        setForensic(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
        try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
        const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
        const url = `/api/verify/document?documentId=${encodeURIComponent(selectedDocumentId)}`
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (userId) headers['x-user-id'] = userId
        const res = await fetch(url, {
          headers: Object.keys(headers).length ? headers : undefined,
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || 'Failed to fetch forensic')
        }
        const data = await res.json()
        if (!mounted) return
        setForensic(data.forensic ?? null)
      } catch (err: any) {
        setError(err?.message || 'Error loading forensic')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [selectedDocumentId])

  return (
    <section id="forensic" className="bg-white p-4 rounded shadow" aria-labelledby="forensic-title">
      <h3 id="forensic-title" className="text-md font-medium">Forensic Summary</h3>
      <div className="mt-3 text-sm text-gray-600" role="region" aria-live="polite">
        {!selectedDocumentId && <div>No forensic report selected. Click a document to view analysis.</div>}
        {loading && <div>Loading forensic analysis...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && forensic && (
          <div className="space-y-2">
            <div><span className="font-semibold">Compliance Score:</span> {forensic.complianceScore ?? 'N/A'}</div>
            <div><span className="font-semibold">Tampering Detected:</span> {forensic.tamperingDetected ? 'Yes' : 'No'}</div>
            <div><span className="font-semibold">Confidence:</span> {forensic.confidenceLevel ?? 'N/A'}</div>
            <div><span className="font-semibold">Recommendations:</span>
              <ul className="list-disc list-inside ml-4">
                {(forensic.recommendations || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
