"use client"
import React, { useState } from 'react'

interface NFTData {
  tokenAddress?: string
  mintAddress?: string
  name?: string
  symbol?: string
  uri?: string
  txHash?: string
  status: 'not_minted' | 'minting' | 'minted' | 'failed'
}

export default function NFTPanel({
  documentId,
  nftData
}: {
  documentId?: string
  nftData?: NFTData
}) {
  const [isMinting, setIsMinting] = useState(false)

  // Default state when no document selected or no NFT data
  const data: NFTData = nftData || { status: 'not_minted' }

  const handleViewOnExplorer = () => {
    if (data.txHash) {
      window.open(`https://explorer.solana.com/tx/${data.txHash}?cluster=devnet`, '_blank')
    } else if (data.mintAddress) {
      window.open(`https://explorer.solana.com/address/${data.mintAddress}?cluster=devnet`, '_blank')
    }
  }

  return (
    <section className="glass-card p-6">
      <h2 className="text-lg font-bold flex items-center gap-3 mb-6">
        <span className="text-xl">🎖️</span>
        NFT / Blockchain Status
      </h2>

      {!documentId ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-30">⛓️</div>
          <p className="text-foreground-secondary text-sm">
            Select a document to view blockchain status
          </p>
        </div>
      ) : data.status === 'minted' ? (
        /* Minted State */
        <div className="space-y-4 fade-in">
          {/* NFT Card Preview */}
          <div className="relative aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-solana-teal pulse-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-solana-teal/20 via-violet-accent/20 to-background-secondary" />

            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
              <span className="text-5xl mb-3">🏆</span>
              <p className="font-bold text-sm text-center">{data.name || 'Document NFT'}</p>
              <p className="text-xs text-foreground-secondary">{data.symbol || 'NDDV'}</p>
            </div>

            {/* Verified Badge */}
            <div className="absolute top-2 right-2">
              <span className="badge badge-blockchain text-xs">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-3">
            {data.mintAddress && (
              <div className="p-3 rounded-lg bg-background-secondary/50">
                <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">
                  Mint Address
                </p>
                <p className="font-mono text-xs truncate">{data.mintAddress}</p>
              </div>
            )}

            {data.txHash && (
              <div className="p-3 rounded-lg bg-background-secondary/50">
                <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">
                  Transaction Hash
                </p>
                <p className="font-mono text-xs truncate">{data.txHash}</p>
              </div>
            )}
          </div>

          {/* Explorer Button */}
          <button
            onClick={handleViewOnExplorer}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            View on Solana Explorer
          </button>
        </div>
      ) : data.status === 'minting' || isMinting ? (
        /* Minting State */
        <div className="text-center py-8 fade-in">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-solana-teal/30" />
            <div className="absolute inset-0 rounded-full border-4 border-solana-teal border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">⛓️</span>
            </div>
          </div>
          <p className="font-medium text-solana-teal mb-2">Minting on Solana...</p>
          <p className="text-xs text-foreground-secondary">
            This may take a few moments
          </p>
        </div>
      ) : data.status === 'failed' ? (
        /* Failed State */
        <div className="text-center py-8 fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <p className="font-medium text-error mb-2">Minting Failed</p>
          <p className="text-xs text-foreground-secondary mb-4">
            There was an error minting your document as an NFT
          </p>
          <button className="btn btn-outline" onClick={() => setIsMinting(true)}>
            Retry
          </button>
        </div>
      ) : (
        /* Not Minted State */
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-background-secondary border border-dashed border-white/20 flex items-center justify-center">
            <span className="text-3xl opacity-50">⛓️</span>
          </div>
          <p className="text-foreground-secondary text-sm mb-2">
            Document not yet minted
          </p>
          <p className="text-xs text-foreground-secondary opacity-70 mb-4">
            Mint this document as an NFT to create permanent blockchain ownership
          </p>
          {documentId && (
            <p className="text-xs text-foreground-secondary">
              Use the &quot;Mint&quot; button on your document to begin
            </p>
          )}
        </div>
      )}

      {/* Blockchain Info */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-foreground-secondary">
          <span>Network</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-solana-teal animate-pulse" />
            Solana Devnet
          </span>
        </div>
      </div>
    </section>
  )
}
