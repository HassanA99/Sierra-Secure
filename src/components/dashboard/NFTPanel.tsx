"use client"
import React, { useEffect, useState } from 'react'

type NFTItem = {
  id: string
  mintAddress: string
  name: string
  symbol: string
  transactionHash?: string
}

export default function NFTPanel() {
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
        const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (userId) headers['x-user-id'] = userId

        const res = await fetch('/api/blockchain/nfts', { headers: Object.keys(headers).length ? headers : undefined })
        if (!res.ok) throw new Error('Failed to load NFTs')
        const body = await res.json()
        if (!mounted) return
        setNfts(body.nfts || [])
      } catch (err: any) {
        setError(err?.message || 'Error loading NFTs')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <section id="blockchain" className="bg-white p-4 rounded shadow" aria-labelledby="nft-title">
      <h3 id="nft-title" className="text-md font-medium">NFTs</h3>
      <div className="mt-3 text-sm text-gray-600">
        {loading && <div>Loading NFTs...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && nfts.length === 0 && (
          <div>No NFTs minted yet. Use the blockchain tools to mint a document NFT.</div>
        )}
        {!loading && nfts.length > 0 && (
          <ul className="list-disc list-inside ml-4">
            {nfts.map((n) => (
              <li key={n.id}>
                <div className="font-medium">{n.name} ({n.symbol})</div>
                <div className="text-xs text-gray-500">Mint: {n.mintAddress}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
