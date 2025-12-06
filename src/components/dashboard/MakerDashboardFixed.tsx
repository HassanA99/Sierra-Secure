"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface AuditQueueItem {
  id: string
  documentId: string
  type: string
  title: string
  uploader: {
    name: string
    email: string
  }
  forensicScore: number
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  concerns?: string[]
}

// Demo data for the audit queue
const DEMO_AUDIT_QUEUE: AuditQueueItem[] = [
  {
    id: 'audit-1',
    documentId: 'doc-101',
    type: 'BIRTH_CERTIFICATE',
    title: 'Birth Certificate - Mohamed Kamara',
    uploader: { name: 'Mohamed Kamara', email: 'mohamed.k@email.com' },
    forensicScore: 78,
    status: 'PENDING_REVIEW',
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    concerns: ['Low resolution scan', 'Metadata inconsistency']
  },
  {
    id: 'audit-2',
    documentId: 'doc-102',
    type: 'LAND_TITLE',
    title: 'Land Title - Plot 45 Freetown',
    uploader: { name: 'Aminata Sesay', email: 'aminata.s@email.com' },
    forensicScore: 82,
    status: 'PENDING_REVIEW',
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    concerns: ['Date format mismatch']
  },
  {
    id: 'audit-3',
    documentId: 'doc-103',
    type: 'NATIONAL_ID',
    title: 'National ID Renewal',
    uploader: { name: 'Fatmata Conteh', email: 'fatmata.c@email.com' },
    forensicScore: 75,
    status: 'PENDING_REVIEW',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    concerns: ['Photo quality low', 'Signature unclear']
  },
]

const DOCUMENT_TYPES = [
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', icon: '👶' },
  { value: 'NATIONAL_ID', label: 'National ID', icon: '🪪' },
  { value: 'LAND_TITLE', label: 'Land Title', icon: '🏠' },
  { value: 'PASSPORT', label: 'Passport', icon: '🛂' },
  { value: 'ACADEMIC_CERTIFICATE', label: 'Academic Certificate', icon: '🎓' },
]

export default function MakerDashboard() {
  const [activeTab, setActiveTab] = useState<'issue' | 'audit'>('audit')
  const [auditQueue, setAuditQueue] = useState<AuditQueueItem[]>([])
  const [selectedItem, setSelectedItem] = useState<AuditQueueItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewComments, setReviewComments] = useState('')
  const [userName, setUserName] = useState('Staff Member')

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    documentType: '',
    documentNumber: '',
    expiryDate: '',
    additionalData: ''
  })

  useEffect(() => {
    // Load user name
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('nddv_user_name')
      if (name) setUserName(name)
    }

    // Simulate loading audit queue
    setLoading(true)
    setTimeout(() => {
      setAuditQueue(DEMO_AUDIT_QUEUE)
      setLoading(false)
    }, 500)
  }, [])

  const handleApprove = (item: AuditQueueItem) => {
    setAuditQueue(prev => prev.map(q =>
      q.id === item.id ? { ...q, status: 'APPROVED' as const } : q
    ))
    setSelectedItem(null)
    setReviewComments('')
  }

  const handleReject = (item: AuditQueueItem) => {
    if (!reviewComments.trim()) {
      alert('Please provide rejection comments')
      return
    }
    setAuditQueue(prev => prev.map(q =>
      q.id === item.id ? { ...q, status: 'REJECTED' as const } : q
    ))
    setSelectedItem(null)
    setReviewComments('')
  }

  const handleIssueDocument = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Document issued successfully!\n\nType: ${issueForm.documentType}\nRecipient: ${issueForm.recipientName}\nDocument #: ${issueForm.documentNumber}`)
    setIssueForm({
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      documentType: '',
      documentNumber: '',
      expiryDate: '',
      additionalData: ''
    })
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const pendingCount = auditQueue.filter(q => q.status === 'PENDING_REVIEW').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold text-gray-900">NDDV</span>
            </Link>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Maker Dashboard
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Approved Today</p>
            <p className="text-3xl font-bold text-green-600">12</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Rejected Today</p>
            <p className="text-3xl font-bold text-red-600">2</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Documents Issued</p>
            <p className="text-3xl font-bold text-blue-600">156</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'audit'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            📋 Review Queue ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'issue'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            ✍️ Issue Document
          </button>
        </div>

        {/* Audit Queue Tab */}
        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue List */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Documents Pending Review</h2>
                <p className="text-sm text-gray-500">Documents with forensic score 70-84% require manual review</p>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : auditQueue.filter(q => q.status === 'PENDING_REVIEW').length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="text-gray-600">No pending documents to review</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {auditQueue.filter(q => q.status === 'PENDING_REVIEW').map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedItem?.id === item.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.uploader.name} • {item.uploader.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${item.forensicScore >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {item.forensicScore}% AI Score
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {selectedItem ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{selectedItem.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${selectedItem.forensicScore >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      Forensic Score: {selectedItem.forensicScore}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Uploader</p>
                      <p className="text-gray-900">{selectedItem.uploader.name}</p>
                      <p className="text-sm text-gray-500">{selectedItem.uploader.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Document Type</p>
                      <p className="text-gray-900">{selectedItem.type.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {selectedItem.concerns && selectedItem.concerns.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-sm font-medium text-orange-700 mb-2">⚠️ AI Concerns:</p>
                      <ul className="text-sm text-orange-600 space-y-1">
                        {selectedItem.concerns.map((concern, i) => (
                          <li key={i}>• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments
                    </label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Add comments (required for rejection)"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedItem)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve & Mint
                    </button>
                    <button
                      onClick={() => handleReject(selectedItem)}
                      className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">👈</span>
                  <p>Select a document to review</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issue Document Tab */}
        {activeTab === 'issue' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Issue New Document</h2>

              <form onSubmit={handleIssueDocument} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DOCUMENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setIssueForm(prev => ({ ...prev, documentType: type.value }))}
                        className={`p-4 rounded-xl text-center border transition-all ${issueForm.documentType === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                    <input
                      type="text"
                      value={issueForm.recipientName}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Full legal name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={issueForm.recipientEmail}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="recipient@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
                    <input
                      type="text"
                      value={issueForm.documentNumber}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Auto-generated or manual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={issueForm.expiryDate}
                      onChange={(e) => setIssueForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✍️ Issue Document on Blockchain
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
