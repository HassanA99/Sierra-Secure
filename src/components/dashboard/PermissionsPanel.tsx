"use client"
import React, { useState, useEffect } from 'react'

interface Permission {
  id: string
  recipientId: string
  recipientEmail?: string
  type: 'VIEW' | 'DOWNLOAD' | 'VERIFY'
  expiresAt?: string
  createdAt: string
}

const permissionIcons = {
  VIEW: '👁️',
  DOWNLOAD: '📥',
  VERIFY: '✅',
}

export default function PermissionsPanel({
  selectedDocumentId
}: {
  selectedDocumentId?: string
}) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!selectedDocumentId) {
      setPermissions([])
      return
    }

    // Simulate fetching permissions
    setLoading(true)
    const timer = setTimeout(() => {
      setPermissions([
        {
          id: '1',
          recipientId: 'john@example.com',
          recipientEmail: 'john@example.com',
          type: 'VIEW',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          recipientId: 'ministry@gov.sl',
          recipientEmail: 'ministry@gov.sl',
          type: 'VERIFY',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [selectedDocumentId])

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/verify/${selectedDocumentId}?token=${Math.random().toString(36).substring(7)}`
    setShareLink(link)
  }

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRevokePermission = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId))
  }

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  if (!selectedDocumentId) {
    return (
      <section className="glass-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-3 mb-4">
          <span className="text-xl">🔐</span>
          Sharing & Permissions
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-30">🔗</div>
          <p className="text-foreground-secondary text-sm">
            Select a document to manage permissions
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-card p-6">
      <h2 className="text-lg font-bold flex items-center gap-3 mb-6">
        <span className="text-xl">🔐</span>
        Sharing & Permissions
      </h2>

      {/* Quick Share Link */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground-secondary mb-3">
          Quick Share Link
        </p>

        {shareLink ? (
          <div className="flex gap-2 fade-in">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="input text-xs font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`btn ${copied ? 'btn-primary' : 'btn-ghost'} whitespace-nowrap`}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateLink}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            Generate Verification Link
          </button>
        )}

        <p className="text-xs text-foreground-secondary mt-2 opacity-70">
          Anyone with this link can verify the document&apos;s authenticity
        </p>
      </div>

      {/* Permission Types Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(permissionIcons).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-1 text-xs text-foreground-secondary">
            <span>{icon}</span>
            <span>{type.toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Active Permissions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
          Active Permissions
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-background-secondary/50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="flex-1">
                    <div className="h-3 skeleton" style={{ width: '60%' }} />
                    <div className="h-2 skeleton mt-2" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-6 text-foreground-secondary text-sm">
            No active permissions
          </div>
        ) : (
          permissions.map((permission, index) => (
            <div
              key={permission.id}
              className="group p-3 rounded-lg bg-background-secondary/50 border border-white/5 hover:border-white/10 transition-all fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solana-teal/30 to-violet-accent/30 flex items-center justify-center text-lg">
                  {permission.recipientEmail?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {permission.recipientEmail || permission.recipientId}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <span>{permissionIcons[permission.type]}</span>
                    <span>{permission.type.toLowerCase()} access</span>
                    {permission.expiresAt && (
                      <>
                        <span>•</span>
                        <span className="text-warning">
                          ⏰ {getRemainingTime(permission.expiresAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Revoke Button */}
                <button
                  onClick={() => handleRevokePermission(permission.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-error/20 text-error"
                  title="Revoke access"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Note */}
      <div className="mt-6 p-3 rounded-lg bg-violet-accent/10 border border-violet-accent/30">
        <div className="flex items-start gap-2">
          <span className="text-violet-accent">🛡️</span>
          <p className="text-xs text-foreground-secondary">
            All document access is logged on the blockchain. You maintain full control over who can see your documents.
          </p>
        </div>
      </div>
    </section>
  )
}
