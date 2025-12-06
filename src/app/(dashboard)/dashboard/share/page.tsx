"use client"
import React from 'react'
import Link from 'next/link'
import PermissionsPanel from '@/components/dashboard/PermissionsPanel'

export default function SharePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Share Documents</h1>
                <p className="text-foreground-secondary mt-1">
                    Manage document sharing and permissions
                </p>
            </div>

            {/* Info Card */}
            <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">🔗</div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Secure Document Sharing</h2>
                        <p className="text-foreground-secondary text-sm">
                            Share your verified documents with third parties securely.
                            All sharing is logged on the blockchain for complete transparency and audit trail.
                        </p>
                    </div>
                </div>
            </div>

            {/* Steps to Share */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-6 text-center">
                    <div className="text-3xl mb-4">1️⃣</div>
                    <h3 className="font-semibold mb-2">Select Document</h3>
                    <p className="text-sm text-foreground-secondary">
                        Choose a document from your vault to share
                    </p>
                </div>
                <div className="glass-card p-6 text-center">
                    <div className="text-3xl mb-4">2️⃣</div>
                    <h3 className="font-semibold mb-2">Set Permissions</h3>
                    <p className="text-sm text-foreground-secondary">
                        Control what data is shared and for how long
                    </p>
                </div>
                <div className="glass-card p-6 text-center">
                    <div className="text-3xl mb-4">3️⃣</div>
                    <h3 className="font-semibold mb-2">Share Link</h3>
                    <p className="text-sm text-foreground-secondary">
                        Send the secure verification link to the recipient
                    </p>
                </div>
            </div>

            {/* Permissions Panel */}
            <PermissionsPanel />

            {/* Back to Vault */}
            <div className="text-center">
                <Link
                    href="/dashboard/vault"
                    className="text-solana-teal hover:underline"
                >
                    ← Back to Document Vault
                </Link>
            </div>
        </div>
    )
}
