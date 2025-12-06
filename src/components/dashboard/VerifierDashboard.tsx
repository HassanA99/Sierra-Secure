"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface DocumentVerification {
  id: string
  documentNumber: string
  type: string
  holder: {
    name: string
    phoneNumber: string
    email?: string
  }
  isValid: boolean
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'NOT_FOUND'
  lastVerifiedAt: string
  blockchainId?: string
  forensicScore?: number
  issuedBy?: string
  expiryDate?: string
}

// Demo verification results
const DEMO_VERIFICATIONS: Record<string, DocumentVerification> = {
  'BC-2024-001': {
    id: 'doc-1',
    documentNumber: 'BC-2024-001',
    type: 'BIRTH_CERTIFICATE',
    holder: { name: 'Mohamed Kamara', phoneNumber: '+232 76 123 4567', email: 'mohamed.k@email.com' },
    isValid: true,
    status: 'VERIFIED',
    lastVerifiedAt: new Date().toISOString(),
    blockchainId: '5Kj9mN...3xYz',
    forensicScore: 98,
    issuedBy: 'NCRA Freetown',
    expiryDate: 'N/A (Permanent)'
  },
  'NID-SL-12345': {
    id: 'doc-2',
    documentNumber: 'NID-SL-12345',
    type: 'NATIONAL_ID',
    holder: { name: 'Aminata Sesay', phoneNumber: '+232 77 987 6543' },
    isValid: true,
    status: 'VERIFIED',
    lastVerifiedAt: new Date(Date.now() - 86400000).toISOString(),
    blockchainId: '7Hy4kL...9aBc',
    forensicScore: 95,
    issuedBy: 'Ministry of Internal Affairs',
    expiryDate: '2029-12-31'
  },
  'LT-FT-2024-789': {
    id: 'doc-3',
    documentNumber: 'LT-FT-2024-789',
    type: 'LAND_TITLE',
    holder: { name: 'Fatmata Conteh', phoneNumber: '+232 78 456 7890' },
    isValid: false,
    status: 'EXPIRED',
    lastVerifiedAt: new Date(Date.now() - 604800000).toISOString(),
    expiryDate: '2023-06-30'
  },
}

/**
 * Verifier Dashboard Component
 * 
 * Bank/Police staff dashboard for quick document verification
 */
export default function VerifierDashboard() {
  const [searchInput, setSearchInput] = useState('')
  const [result, setResult] = useState<DocumentVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentVerifications, setRecentVerifications] = useState<DocumentVerification[]>([])
  const [userName, setUserName] = useState('Verifier')

  useEffect(() => {
    // Load user name
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('nddv_user_name')
      if (name) setUserName(name)
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    if (!searchInput.trim()) {
      setError('Please enter a document ID')
      setLoading(false)
      return
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check demo data first
    const demoResult = DEMO_VERIFICATIONS[searchInput.trim().toUpperCase()]

    if (demoResult) {
      setResult(demoResult)
      setRecentVerifications(prev => [demoResult, ...prev.filter(v => v.id !== demoResult.id)].slice(0, 5))
    } else {
      // Try API (will likely fail in demo, so show not found)
      try {
        const token = localStorage.getItem('nddv_token')
        const userId = localStorage.getItem('nddv_user_id')

        const res = await fetch(`/api/verify/document/${searchInput.trim()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '',
          },
        })

        if (!res.ok) {
          setResult({
            id: 'not-found',
            documentNumber: searchInput.trim(),
            type: 'UNKNOWN',
            holder: { name: 'Not Found', phoneNumber: 'N/A' },
            isValid: false,
            status: 'NOT_FOUND',
            lastVerifiedAt: new Date().toISOString(),
          })
        } else {
          const data = await res.json()
          setResult(data)
        }
      } catch (err) {
        setResult({
          id: 'not-found',
          documentNumber: searchInput.trim(),
          type: 'UNKNOWN',
          holder: { name: 'Not Found', phoneNumber: 'N/A' },
          isValid: false,
          status: 'NOT_FOUND',
          lastVerifiedAt: new Date().toISOString(),
        })
      }
    }

    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-700 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      case 'EXPIRED': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'NOT_FOUND': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold text-gray-900">NDDV</span>
            </Link>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Verifier Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {userName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Verification
          </h1>
          <p className="text-gray-600">
            Instantly verify the authenticity of Sierra Leone government documents
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document ID / QR Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter document ID (e.g., BC-2024-001, NID-SL-12345)"
                  className="flex-1 px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {loading ? '...' : '🔍 Verify'}
                </button>
              </div>
            </div>

            {/* Demo IDs */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-gray-500">Try:</span>
              {Object.keys(DEMO_VERIFICATIONS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSearchInput(id)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-full transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-8">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl overflow-hidden mb-8 ${result.isValid ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
            {/* Status Header */}
            <div className={`p-6 ${result.isValid ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              <div className="flex items-center gap-4">
                <div className="text-6xl">
                  {result.isValid ? '✓' : '✗'}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {result.status === 'NOT_FOUND' ? 'NOT FOUND' : result.isValid ? 'VALID' : 'INVALID'}
                  </h2>
                  <p className="text-white/80">
                    {result.status === 'NOT_FOUND'
                      ? 'This document is not in our system'
                      : result.isValid
                        ? 'This document is authentic and verified on blockchain'
                        : `Status: ${result.status}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            {result.status !== 'NOT_FOUND' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Document Type</label>
                    <p className="text-lg text-gray-900">{result.type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Document Number</label>
                    <p className="text-lg text-gray-900 font-mono">{result.documentNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Holder Name</label>
                    <p className="text-lg text-gray-900">{result.holder.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                    <p className="text-lg text-gray-900">{result.holder.phoneNumber}</p>
                  </div>
                  {result.issuedBy && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Issued By</label>
                      <p className="text-gray-900">{result.issuedBy}</p>
                    </div>
                  )}
                  {result.expiryDate && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Expiry Date</label>
                      <p className="text-gray-900">{result.expiryDate}</p>
                    </div>
                  )}
                  {result.forensicScore && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">AI Authenticity Score</label>
                      <p className="text-lg text-green-600 font-bold">{result.forensicScore}%</p>
                    </div>
                  )}
                  {result.blockchainId && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Blockchain ID</label>
                      <p className="text-gray-900 font-mono text-sm">{result.blockchainId}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => { setSearchInput(''); setResult(null) }}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Verify Another
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    🖨️ Print Result
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Verifications</h3>
            <div className="divide-y divide-gray-100">
              {recentVerifications.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{v.documentNumber}</p>
                    <p className="text-sm text-gray-500">{v.holder.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(v.status)}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        {!result && !error && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <h3 className="font-semibold text-blue-900 mb-3">🔍 How to verify:</h3>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Scan the QR code from the citizen&apos;s document, or</li>
              <li>Enter the document ID number manually</li>
              <li>System will instantly show VALID or INVALID status</li>
              <li>You can print or save the verification result</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
