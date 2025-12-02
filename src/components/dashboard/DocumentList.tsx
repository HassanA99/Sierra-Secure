"use client"
import React, { useEffect, useState } from 'react'
import ShareModal from '@/components/ui/modals/ShareModal'
import MintModal from '@/components/ui/modals/MintModal'
import ConfirmDialog from '@/components/ui/modals/ConfirmDialog'

type DocumentItem = {
  id: string
  fileName: string
  status: string
  createdAt: string
}

export default function DocumentList({
  selectedId,
  onSelect,
}: {
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionDocId, setActionDocId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
        const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (userId) headers['x-user-id'] = userId
        const res = await fetch('/api/documents?take=20', {
          headers: Object.keys(headers).length ? headers : undefined,
        })
        if (!res.ok) {
          setError('Failed to load documents')
          return
        }
        const data = await res.json()
        if (!mounted) return
        setDocs(data.documents || data || [])
      } catch (err) {
        setError('Failed to fetch')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="bg-white p-4 rounded shadow">Loading documents...</div>
  if (error) return <div className="bg-white p-4 rounded shadow text-red-600">{error}</div>

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
      const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (userId) headers['x-user-id'] = userId
      const res = await fetch('/api/documents?take=20', {
        headers: Object.keys(headers).length ? headers : undefined,
      })
      if (!res.ok) throw new Error('Failed to load documents')
      const data = await res.json()
      setDocs(data.documents || data || [])
    } catch (err) {
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="documents" className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium">Your Documents</h2>
      {docs.length === 0 ? (
        <div className="mt-3 text-sm text-gray-600">No documents yet</div>
      ) : (
        <ul className="mt-3 space-y-2">
          {docs.map((d) => {
            const isSelected = selectedId === d.id
            return (
              <li
                key={d.id}
                onClick={() => onSelect?.(d.id)}
                className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                role="listitem"
              >
                <div
                  className="flex-1"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelect?.(d.id)
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select document ${d.fileName}`}
                >
                  <div className="font-medium">{d.fileName}</div>
                  <div className="text-sm text-gray-500">{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 mr-4">{d.status}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActionDocId(d.id); setShareOpen(true) }}
                    className="text-sm px-2 py-1 border rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label={`Share ${d.fileName}`}
                    type="button"
                  >
                    Share
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActionDocId(d.id); setMintOpen(true) }}
                    className="text-sm px-2 py-1 border rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label={`Mint NFT for ${d.fileName}`}
                    type="button"
                  >
                    Mint
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActionDocId(d.id); setConfirmOpen(true) }}
                    className="text-sm px-2 py-1 border rounded text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Delete ${d.fileName}`}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => { setShareOpen(false); setActionDocId(null) }}
        documentId={actionDocId ?? ''}
        onShare={async (recipientId, type, expiresIn) => {
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
          await refresh()
        }}
      />

      <MintModal
        open={mintOpen}
        onClose={() => { setMintOpen(false); setActionDocId(null) }}
        documentId={actionDocId ?? ''}
        onMint={async (name, symbol, uri) => {
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
          await refresh()
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Document"
        message="This will permanently delete the document. This action cannot be undone."
        onCancel={() => { setConfirmOpen(false); setActionDocId(null) }}
        onConfirm={async () => {
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
            await refresh()
          } catch (err) {
            console.error('Delete error', err)
            setConfirmOpen(false)
            setActionDocId(null)
          }
        }}
      />
    </section>
  )
}
