"use client"
import React, { useEffect, useState } from 'react'

interface ForensicResult {
  overallScore: number
  checks: {
    name: string
    status: 'pass' | 'warning' | 'fail'
    message: string
  }[]
  aiAnalysis?: string
  timestamp?: string
}

export default function ForensicResultsPanel({
  selectedDocumentId
}: {
  selectedDocumentId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ForensicResult | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!selectedDocumentId) {
      setResults(null)
      return
    }

    // Simulate fetching forensic results
    setLoading(true)
    setScanning(true)

    // In production, this would fetch from /api/forensic/{documentId}
    const timer = setTimeout(() => {
      setResults({
        overallScore: 96,
        checks: [
          { name: 'Metadata Integrity', status: 'pass', message: 'All metadata fields validated' },
          { name: 'Image Analysis', status: 'pass', message: 'No signs of manipulation detected' },
          { name: 'Text Extraction', status: 'pass', message: 'OCR confidence: 98%' },
          { name: 'Signature Verification', status: 'pass', message: 'Digital signatures valid' },
          { name: 'Duplicate Detection', status: 'pass', message: 'No duplicates found in system' },
        ],
        aiAnalysis: 'Document appears authentic with high confidence. No signs of tampering, splicing, or digital manipulation detected. Text content is consistent with document type.',
        timestamp: new Date().toISOString(),
      })
      setLoading(false)
      setScanning(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [selectedDocumentId])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-error'
  }

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return { icon: '✓', color: 'text-success' }
      case 'warning': return { icon: '⚠', color: 'text-warning' }
      case 'fail': return { icon: '✗', color: 'text-error' }
    }
  }

  if (!selectedDocumentId) {
    return (
      <section className="glass-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-3 mb-4">
          <span className="text-xl">🤖</span>
          AI Forensic Analysis
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-30">🔍</div>
          <p className="text-foreground-secondary text-sm">
            Select a document to view AI analysis
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-card p-6 relative overflow-hidden">
      {/* Scanning Animation */}
      {scanning && (
        <div className="scan-line" />
      )}

      <h2 className="text-lg font-bold flex items-center gap-3 mb-6">
        <span className="text-xl">🤖</span>
        AI Forensic Analysis
        {scanning && (
          <span className="badge badge-ai">
            <span className="animate-pulse">Scanning...</span>
          </span>
        )}
      </h2>

      {loading ? (
        <div className="space-y-4">
          {/* Score Skeleton */}
          <div className="text-center py-4">
            <div className="w-24 h-24 mx-auto rounded-full skeleton mb-2" />
            <div className="h-4 skeleton skeleton-title mx-auto" />
          </div>

          {/* Checks Skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50">
              <div className="w-6 h-6 rounded-full skeleton" />
              <div className="flex-1">
                <div className="h-3 skeleton" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Circular Progress Background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${results.overallScore * 3.5} 350`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#14F195" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score Value */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}%
                </span>
              </div>
            </div>

            <p className="font-medium text-success">Authenticity Score</p>
            <p className="text-xs text-foreground-secondary mt-1">
              Powered by Gemini AI
            </p>
          </div>

          {/* Check Results */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
              Verification Checks
            </h3>

            {results.checks.map((check, index) => {
              const statusInfo = getStatusIcon(check.status)
              return (
                <div
                  key={check.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50 fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className={`text-lg ${statusInfo.color}`}>
                    {statusInfo.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{check.name}</p>
                    <p className="text-xs text-foreground-secondary">{check.message}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Analysis */}
          {results.aiAnalysis && (
            <div className="p-4 rounded-xl bg-violet-accent/10 border border-violet-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-violet-accent">✦</span>
                <span className="text-sm font-medium text-violet-accent">AI Analysis</span>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                {results.aiAnalysis}
              </p>
            </div>
          )}

          {/* Timestamp */}
          {results.timestamp && (
            <p className="text-xs text-foreground-secondary text-center">
              Last analyzed: {new Date(results.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
