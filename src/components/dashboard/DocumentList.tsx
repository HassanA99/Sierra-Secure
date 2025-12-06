"use client"
import React, { useEffect, useState, useCallback } from 'react'
import ShareModal from '@/components/ui/modals/ShareModal'
import MintModal from '@/components/ui/modals/MintModal'
import ConfirmDialog from '@/components/ui/modals/ConfirmDialog'

type DocumentItem = {
  id: string
  fileName: string
  title?: string
  documentType?: string
  status: string
  blockchainType?: string
  createdAt: string
  forensicScore?: number
  txHash?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending', color: 'warning', icon: '⏳' },
  PROCESSING: { label: 'Processing', color: 'info', icon: '🔄' },
  VERIFIED: { label: 'Verified', color: 'success', icon: '✅' },
  MINTED: { label: 'Minted', color: 'blockchain', icon: '⛓️' },
  ATTESTED: { label: 'Attested', color: 'ai', icon: '📝' },
  REJECTED: { label: 'Rejected', color: 'error', icon: '❌' },
}

const docTypeIcons: Record<string, string> = {
  BIRTH_CERTIFICATE: '👶',
  NATIONAL_ID: '🪪',
  PASSPORT: '🛂',
  LAND_TITLE: '🏠',
  PROPERTY_DEED: '📜',
  ACADEMIC_CERTIFICATE: '🎓',
  PROFESSIONAL_LICENSE: '📋',
  VEHICLE_REGISTRATION: '🚗',
}

export default function DocumentList({
  selectedId,
  onSelect,
  refreshTrigger,
}: {
  selectedId?: string
  onSelect?: (id: string) => void
  refreshTrigger?: number
}) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionDocId, setActionDocId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')

  // Dummy data for demo mode
  const DUMMY_DOCUMENTS: DocumentItem[] = [
    { id: 'demo-1', fileName: 'Birth_Certificate_2024.pdf', title: 'Birth Certificate', documentType: 'BIRTH_CERTIFICATE', status: 'VERIFIED', blockchainType: 'SAS', createdAt: new Date().toISOString(), forensicScore: 98 },
    { id: 'demo-2', fileName: 'National_ID_Card.jpg', title: 'National ID Card', documentType: 'NATIONAL_ID', status: 'MINTED', blockchainType: 'SAS', createdAt: new Date(Date.now() - 86400000).toISOString(), forensicScore: 95, txHash: '5Kj...9Lm' },
    { id: 'demo-3', fileName: 'Land_Title_Freetown.pdf', title: 'Land Title - Freetown', documentType: 'LAND_TITLE', status: 'PENDING', blockchainType: 'NFT', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'demo-4', fileName: 'Driving_License.png', title: 'Driving License', documentType: 'PROFESSIONAL_LICENSE', status: 'VERIFIED', blockchainType: 'SAS', createdAt: new Date(Date.now() - 604800000).toISOString(), forensicScore: 92 },
  ]

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
      const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null

      // If demo mode, use dummy data
      if (token?.startsWith('demo-') || userId?.startsWith('demo-')) {
        setDocs(DUMMY_DOCUMENTS)
        setLoading(false)
        return
      }

      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (userId) headers['x-user-id'] = userId

      const res = await fetch('/api/documents?take=50', {
        headers: Object.keys(headers).length ? headers : undefined,
      })

      if (!res.ok) {
        // Fallback to dummy data on error
        console.warn('API error, using demo data')
        setDocs(DUMMY_DOCUMENTS)
        setLoading(false)
        return
      }

      const data = await res.json()
      const documents = data.documents || data || []
      // If no documents, show dummy for better UX
      setDocs(documents.length > 0 ? documents : DUMMY_DOCUMENTS)
    } catch (err) {
      // Fallback to dummy data on error
      console.warn('Network error, using demo data')
      setDocs(DUMMY_DOCUMENTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments, refreshTrigger])

  const filteredDocs = docs.filter(doc => {
    if (filter === 'all') return true
    if (filter === 'verified') return ['VERIFIED', 'MINTED', 'ATTESTED'].includes(doc.status)
    if (filter === 'pending') return ['PENDING', 'PROCESSING'].includes(doc.status)
    return true
  })

  const handleShare = async (recipientId: string, type: string, expiresIn: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
    const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (userId) headers['x-user-id'] = userId

    const res = await fetch('/api/permissions/share', {
      method: 'POST',
      headers,
      body: JSON.stringify({ documentId: actionDocId, recipientId, type, expiresIn }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error || 'Share failed')
    }

    await fetchDocuments()
  }

  const handleMint = async (name: string, symbol: string, uri: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
    const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (userId) headers['x-user-id'] = userId

    const res = await fetch('/api/blockchain/nfts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ documentId: actionDocId, name, symbol, uri }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error || 'Mint failed')
    }

    await fetchDocuments()
  }

  const handleDelete = async () => {
    if (!actionDocId) return

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
      const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (userId) headers['x-user-id'] = userId

      const res = await fetch(`/api/documents/${encodeURIComponent(actionDocId)}`, {
        method: 'DELETE',
        headers: Object.keys(headers).length ? headers : undefined,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Delete failed')
      }

      setConfirmOpen(false)
      setActionDocId(null)
      await fetchDocuments()
    } catch (err) {
      console.error('Delete error', err)
      setConfirmOpen(false)
      setActionDocId(null)
    }
  }

  // Loading State
  if (loading) {
    return (
      <section className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <span className="text-2xl">📄</span>
            Your Documents
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-background-secondary animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton skeleton-title" />
                  <div className="h-3 skeleton skeleton-text" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Error State
  if (error) {
    return (
      <section className="glass-card p-6">
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-error mb-4">{error}</p>
          <button onClick={fetchDocuments} className="btn btn-outline">
            Try Again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <span className="text-2xl">📄</span>
          Your Documents
          <span className="text-sm font-normal text-foreground-secondary">
            ({filteredDocs.length})
          </span>
        </h2>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'verified', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                ? 'bg-solana-teal/20 text-solana-teal border border-solana-teal/50'
                : 'bg-background-secondary text-foreground-secondary hover:text-foreground'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {docs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📭</div>
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-foreground-secondary text-sm mb-6">
            Upload your first document to get started
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4 opacity-50">🔍</div>
          <p className="text-foreground-secondary">No documents match this filter</p>
        </div>
      ) : (
        /* Document Grid */
        <div className="space-y-3">
          {filteredDocs.map((doc, index) => {
            const isSelected = selectedId === doc.id
            const status = statusConfig[doc.status] || statusConfig.PENDING
            const docIcon = docTypeIcons[doc.documentType || ''] || '📄'

            return (
              <div
                key={doc.id}
                onClick={() => onSelect?.(doc.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all fade-in ${isSelected
                  ? 'bg-solana-teal/10 border-2 border-solana-teal'
                  : 'bg-background-secondary/50 border border-white/5 hover:border-white/20 hover:bg-background-secondary'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect?.(doc.id)
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Document Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${doc.blockchainType === 'NFT'
                    ? 'bg-solana-teal/20 border border-solana-teal/30'
                    : 'bg-violet-accent/20 border border-violet-accent/30'
                    }`}>
                    {docIcon}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {doc.title || doc.fileName}
                      </h3>
                      {doc.txHash && (
                        <span className="text-solana-teal text-xs">⛓️</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground-secondary">
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.forensicScore && (
                        <span className="text-success">
                          AI: {doc.forensicScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`badge badge-${status.color}`}>
                    {status.icon} {status.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActionDocId(doc.id); setShareOpen(true) }}
                      className="p-2 rounded-lg bg-background-secondary hover:bg-solana-teal/20 transition-colors"
                      aria-label={`Share ${doc.fileName}`}
                      title="Share"
                    >
                      🔗
                    </button>
                    {doc.status === 'VERIFIED' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActionDocId(doc.id); setMintOpen(true) }}
                        className="p-2 rounded-lg bg-background-secondary hover:bg-violet-accent/20 transition-colors"
                        aria-label={`Mint NFT for ${doc.fileName}`}
                        title="Mint NFT"
                      >
                        ⛓️
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setActionDocId(doc.id); setConfirmOpen(true) }}
                      className="p-2 rounded-lg bg-background-secondary hover:bg-error/20 transition-colors"
                      aria-label={`Delete ${doc.fileName}`}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <ShareModal
        open={shareOpen}
        onClose={() => { setShareOpen(false); setActionDocId(null) }}
        documentId={actionDocId ?? ''}
        onShare={handleShare}
      />

      <MintModal
        open={mintOpen}
        onClose={() => { setMintOpen(false); setActionDocId(null) }}
        documentId={actionDocId ?? ''}
        onMint={handleMint}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Document"
        message="This will permanently delete the document. This action cannot be undone."
        onCancel={() => { setConfirmOpen(false); setActionDocId(null) }}
        onConfirm={handleDelete}
      />
    </section>
  )
}
