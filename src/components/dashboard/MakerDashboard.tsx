"use client"
import React, { useState, useEffect } from 'react'

interface AuditQueueItem {
  documentId: string
  type: string
  title: string
  uploader: {
    name: string
    email: string
    phone: string
  }
  forensic: {
    score: number
    status: string
    breakdown: {
      integrityScore: number
      authenticityScore: number
      metadataScore: number
      ocrScore: number
      biometricScore: number
      securityScore: number
    }
    concerns: any
  }
  uploadedAt: string
}

/**
 * Maker Dashboard Component
 * 
 * Government staff dashboard for issuing documents and reviewing suspicious uploads
 * 
 * Features:
 * 1. Issue new documents (Birth Certificates, Land Titles, etc.)
 * 2. Audit Queue - documents with forensic score 70-84 waiting for human review
 * 3. Approve/Reject interface with comment capability
 */
export default function MakerDashboard() {
  const [activeTab, setActiveTab] = useState<'issue' | 'audit'>('audit')
  const [auditQueue, setAuditQueue] = useState<AuditQueueItem[]>([])
  const [selectedDocument, setSelectedDocument] = useState<AuditQueueItem | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [reviewComments, setReviewComments] = useState('')
  const [isBatchMode, setIsBatchMode] = useState(false)

  // Load audit queue on mount
  useEffect(() => {
    loadAuditQueue()
  }, [])

  const loadAuditQueue = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/forensic/audit-queue', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'x-user-role': 'MAKER',
        },
      })

      if (!res.ok) {
        throw new Error('Failed to load audit queue')
      }

      const data = await res.json()
      setAuditQueue(data.queue || [])
    } catch (error) {
      console.error('Error loading audit queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (documentId: string) => {
    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/forensic/audit-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'x-user-role': 'MAKER',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          action: 'APPROVE',
          comments: reviewComments,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to approve document')
      }

      // Remove from queue and reset
      setAuditQueue(auditQueue.filter((d) => d.documentId !== documentId))
      setSelectedDocument(null)
      setReviewComments('')
    } catch (error) {
      console.error('Error approving document:', error)
      alert('Failed to approve document')
    }
  }

  const handleReject = async (documentId: string) => {
    if (!reviewComments.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/forensic/audit-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'x-user-role': 'MAKER',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          action: 'REJECT',
          comments: reviewComments,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to reject document')
      }

      // Remove from queue and reset
      setAuditQueue(auditQueue.filter((d) => d.documentId !== documentId))
      setSelectedDocument(null)
      setReviewComments('')
    } catch (error) {
      console.error('Error rejecting document:', error)
      alert('Failed to reject document')
    }
  }

  const handleBatchToggle = (documentId: string) => {
    const newBatch = new Set(selectedBatch)
    if (newBatch.has(documentId)) {
      newBatch.delete(documentId)
    } else {
      newBatch.add(documentId)
    }
    setSelectedBatch(newBatch)
  }

  const handleBatchApprove = async () => {
    if (selectedBatch.size === 0) {
      alert('Please select documents to approve')
      return
    }

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/forensic/audit-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'x-user-role': 'MAKER',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedBatch),
          action: 'APPROVE',
          comments: reviewComments || 'Batch approval',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to approve batch')
      }

      // Remove approved documents from queue
      setAuditQueue(auditQueue.filter((d) => !selectedBatch.has(d.documentId)))
      setSelectedBatch(new Set())
      setReviewComments('')
      setIsBatchMode(false)
    } catch (error) {
      console.error('Error approving batch:', error)
      alert('Failed to approve batch')
    }
  }

  const handleBatchReject = async () => {
    if (selectedBatch.size === 0) {
      alert('Please select documents to reject')
      return
    }

    if (!reviewComments.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/forensic/audit-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'x-user-role': 'MAKER',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedBatch),
          action: 'REJECT',
          comments: reviewComments,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to reject batch')
      }

      // Remove rejected documents from queue
      setAuditQueue(auditQueue.filter((d) => !selectedBatch.has(d.documentId)))
      setSelectedBatch(new Set())
      setReviewComments('')
      setIsBatchMode(false)
    } catch (error) {
      console.error('Error rejecting batch:', error)
      alert('Failed to reject batch')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Government Document Management
          </h1>
          <p className="text-gray-600 mt-2">Issue documents and review document submissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'audit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📋 Document Review</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {auditQueue.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'issue'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 Issue New Document
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Audit Queue Tab */}
        {activeTab === 'audit' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600">Loading documents...</p>
              </div>
            ) : auditQueue.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-600">
                  No documents waiting for review. All submissions have been processed.
                </p>
              </div>
            ) : (
              <div>
                {/* Batch Mode Toggle */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isBatchMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isBatchMode ? `✓ Batch Mode (${selectedBatch.size} selected)` : '📋 Batch Mode'}
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:grid grid-cols-12 gap-6">
                  {/* Table */}
                  <div className="col-span-7 overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {isBatchMode && <th className="px-6 py-3 text-left"><input type="checkbox" /></th>}
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Uploader</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditQueue.map((doc) => (
                          <tr
                            key={doc.documentId}
                            onClick={() => !isBatchMode && setSelectedDocument(doc)}
                            className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedDocument?.documentId === doc.documentId ? 'bg-blue-50' : ''
                            }`}
                          >
                            {isBatchMode && (
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedBatch.has(doc.documentId)}
                                  onChange={() => handleBatchToggle(doc.documentId)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{doc.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{doc.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{doc.holder.name}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-sm font-semibold px-3 py-1 rounded ${
                                  doc.forensic.score >= 85
                                    ? 'bg-green-100 text-green-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {doc.forensic.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedDocument(doc)
                                }}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Details Panel */}
                  {selectedDocument && (
                    <div className="col-span-5 bg-white rounded-lg p-6 border border-gray-200 max-h-screen overflow-y-auto">
                <div className="lg:hidden grid grid-cols-3 gap-6">
                  {/* Queue List */}
                  <div className="col-span-1 space-y-3">
                    {auditQueue.map((doc) => (
                      <div
                        key={doc.documentId}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                          selectedDocument?.documentId === doc.documentId
                            ? 'border-blue-500 bg-blue-50'
                            : selectedBatch.has(doc.documentId)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isBatchMode && (
                          <input
                            type="checkbox"
                            checked={selectedBatch.has(doc.documentId)}
                            onChange={() => handleBatchToggle(doc.documentId)}
                            className="mt-2 w-4 h-4"
                          />
                        )}
                        <button
                          onClick={() => !isBatchMode && setSelectedDocument(doc)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-gray-900">{doc.type}</div>
                          <div className="text-sm text-gray-600">{doc.title}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              Score: {doc.forensic.score}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                {/* Details Panel */}
                {selectedDocument && (
                  <div className="lg:col-span-2 col-span-full bg-white rounded-lg p-6 border border-gray-200">
                    {/* Document Info */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {selectedDocument.type}
                      </h2>

                      {/* Uploader Info */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                          Submitted By
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedDocument.uploader.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedDocument.uploader.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedDocument.uploader.phone}
                        </p>
                      </div>

                      {/* Forensic Score */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                          Forensic Analysis Score
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="text-5xl font-bold text-amber-600">
                            {selectedDocument.forensic.score}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Score between 70-84</p>
                            <p>Requires manual verification</p>
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-gray-600 uppercase mb-3">
                          Detailed Breakdown
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Integrity</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.integrityScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Authenticity</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.authenticityScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Metadata</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.metadataScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">OCR Quality</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.ocrScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Biometric</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.biometricScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Security</p>
                            <p className="font-semibold text-gray-900">
                              {selectedDocument.forensic.breakdown.securityScore}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Section */}
                    <div className="border-t pt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Assessment & Comments
                      </label>
                      <textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder="Based on your manual review, should this document be approved? Add any concerns or observations..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    {isBatchMode && selectedBatch.size > 0 ? (
                      <div className="flex gap-3 mt-6 pt-6 border-t">
                        <button
                          onClick={handleBatchApprove}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✓ Approve All ({selectedBatch.size})
                        </button>
                        <button
                          onClick={handleBatchReject}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✗ Reject All ({selectedBatch.size})
                        </button>
                      </div>
                    ) : selectedDocument ? (
                      <div className="flex gap-3 mt-6 pt-6 border-t">
                        <button
                          onClick={() => handleApprove(selectedDocument.documentId)}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✓ Approve & Write to Blockchain
                        </button>
                        <button
                          onClick={() => handleReject(selectedDocument.documentId)}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Issue Document Tab */}
        {activeTab === 'issue' && (
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Issue New Document
            </h2>
            <div className="text-center text-gray-500">
              <p className="mb-4">Document issuance forms coming soon</p>
              <p className="text-sm">
                Options: Birth Certificate, Land Title, Vehicle Registration
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
