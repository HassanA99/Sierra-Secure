"use client"
import React from 'react'
import Link from 'next/link'
import DocumentList from '@/components/dashboard/DocumentList'

export default function VaultPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Document Vault</h1>
                    <p className="text-foreground-secondary mt-1">
                        All your securely stored documents
                    </p>
                </div>
                <Link
                    href="/dashboard/upload"
                    className="px-6 py-3 bg-solana-teal text-background font-semibold rounded-xl hover:bg-solana-teal/90 transition-colors flex items-center gap-2"
                >
                    <span>📤</span> Upload New
                </Link>
            </div>

            {/* Document List */}
            <div className="glass-card p-6">
                <DocumentList />
            </div>
        </div>
    )
}
