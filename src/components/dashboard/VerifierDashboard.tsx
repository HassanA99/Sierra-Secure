"use client"
import React, { useState, useRef, useEffect } from 'react'

interface DocumentVerification {
  id: string
  documentNumber: string
  type: string
  holder: {
    name: string
    phoneNumber: string
  }
  isValid: boolean
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED'
  lastVerifiedAt: string
  blocklinkId?: string
}

/**
 * Verifier Dashboard Component
 * 
 * Bank/Police staff dashboard for quick document verification
 * 
 * Flow:
 * 1. Scan QR code or enter document ID
 * 2. System returns document verification status
 * 3. Display VALID (green) or INVALID (red) with details
 */
export default function VerifierDashboard() {
  const [searchInput, setSearchInput] = useState('')
  const [result, setResult] = useState<DocumentVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useQR, setUseQR] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrScanning, setQrScanning] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      if (!searchInput.trim()) {
        setError('Please enter a document ID or QR code')
        setLoading(false)
        return
      }

      // Call verification API
      const res = await fetch(`/api/verify/document/${searchInput.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
        },
      })

      if (!res.ok) {
        if (res.status === 404) {
          setError('Document not found')
        } else {
          const data = await res.json()
          setError(data?.error || 'Failed to verify document')
        }
        return
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const startQRScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setQrScanning(true)
        setUseQR(true)
      }
    } catch (err) {
      setError('Unable to access camera. Please enter document ID manually.')
    }
  }

  const stopQRScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setQrScanning(false)
    setUseQR(false)
  }

  const captureQRCode = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0)
        // In a real app, would use a QR decoding library like jsQR
        // For now, simulate by prompting user
        const scannedCode = prompt('Scan complete. Enter QR code data:')
        if (scannedCode) {
          setSearchInput(scannedCode)
          stopQRScanning()
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Verification
          </h1>
          <p className="text-gray-600">
            Quick verification system for government staff
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Document ID or QR Code
            </label>
            {qrScanning ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border-2 border-blue-500"
                  style={{ maxHeight: '300px' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureQRCode}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    📷 Capture QR
                  </button>
                  <button
                    type="button"
                    onClick={stopQRScanning}
                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter document ID or scan QR code..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Checking...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={startQRScanning}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  📱 Scan QR
                </button>
              </div>
            )}
          </form>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              {/* Status Badge */}
              <div
                className={`mb-6 p-6 rounded-lg ${
                  result.isValid
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-red-50 border-2 border-red-500'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`text-5xl ${
                      result.isValid ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {result.isValid ? '✓' : '✗'}
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${
                        result.isValid ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {result.isValid ? 'VALID' : 'INVALID'}
                    </h2>
                    <p
                      className={`text-sm ${
                        result.isValid ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Status: {result.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Document Type
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {result.type}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Holder Name
                    </label>
                    <p className="text-gray-900">{result.holder.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{result.holder.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Last Verified
                  </label>
                  <p className="text-gray-900">
                    {new Date(result.lastVerifiedAt).toLocaleString()}
                  </p>
                </div>

                {result.blocklinkId && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Blockchain ID
                    </label>
                    <p className="text-sm text-gray-500 break-all">
                      {result.blocklinkId}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSearchInput('')
                    setResult(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Search Another
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Print Verification
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!result && !error && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How to verify:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Scan the QR code from the citizen's document, or</li>
                <li>Enter the document ID number manually</li>
                <li>System will instantly show VALID or INVALID status</li>
                <li>You can print or save the verification result</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Verification powered by secure blockchain infrastructure</p>
        </div>
      </div>
    </div>
  )
}
