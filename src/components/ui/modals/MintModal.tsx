"use client"
import React, { useState } from 'react'

export default function MintModal({
  open,
  onClose,
  onMint,
  documentId,
}: {
  open: boolean
  onClose: () => void
  onMint: (name: string, symbol: string, uri: string) => Promise<void>
  documentId: string
}) {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('DOC')
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="mint-title">
      <div className="bg-white rounded p-4 w-96 shadow" role="document">
        <h3 id="mint-title" className="font-semibold">Mint NFT</h3>
        <p className="text-sm text-gray-600">Document ID: {documentId}</p>

        <div className="mt-3 space-y-2">
          <div>
            <label className="block text-sm" htmlFor="mint-name">Name</label>
            <input id="mint-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm" htmlFor="mint-symbol">Symbol</label>
            <input id="mint-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm" htmlFor="mint-uri">Metadata URI</label>
            <input id="mint-uri" value={uri} onChange={(e) => setUri(e.target.value)} placeholder="https://.../metadata.json" className="mt-1 w-full border rounded p-2" />
          </div>
        </div>

        {error && <div className="text-red-600 mt-2">{error}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border focus:outline-none focus:ring-2" type="button">Cancel</button>
          <button
            onClick={async () => {
              if (!name || !symbol || !uri) return setError('All fields are required')
              setError(null)
              setLoading(true)
              try {
                await onMint(name, symbol, uri)
                onClose()
              } catch (err: any) {
                setError(err?.message || 'Mint failed')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
          >
            {loading ? 'Minting...' : 'Mint'}
          </button>
        </div>
      </div>
    </div>
  )
}
