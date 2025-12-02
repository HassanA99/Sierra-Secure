import React, { useState } from 'react'
import DocumentUpload from '@/components/dashboard/DocumentUpload'
import DocumentList from '@/components/dashboard/DocumentList'
import ForensicResultsPanel from '@/components/dashboard/ForensicResultsPanel'
import NFTPanel from '@/components/dashboard/NFTPanel'
import PermissionsPanel from '@/components/dashboard/PermissionsPanel'

export default function DashboardPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'documents' | 'forensic' | 'nft' | 'permissions'>('documents')

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-semibold">My Documents</h1>
      </div>

      {/* Desktop Layout (3 columns) */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        <section className="col-span-2 space-y-4">
          <DocumentUpload />
          <DocumentList selectedId={selectedDocumentId ?? undefined} onSelect={(id) => setSelectedDocumentId(id)} />
        </section>

        <aside className="col-span-1 space-y-4">
          <ForensicResultsPanel selectedDocumentId={selectedDocumentId ?? undefined} />
          <NFTPanel />
          <PermissionsPanel selectedDocumentId={selectedDocumentId ?? undefined} />
        </aside>
      </div>

      {/* Mobile Layout (single column + tabs) */}
      <div className="md:hidden space-y-4">
        {/* Mobile Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setMobileTab('documents')}
            className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
              mobileTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            📄 Documents
          </button>
          <button
            onClick={() => setMobileTab('forensic')}
            className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
              mobileTab === 'forensic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            🔍 Analysis
          </button>
          <button
            onClick={() => setMobileTab('nft')}
            className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
              mobileTab === 'nft'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            🎖️ NFT
          </button>
          <button
            onClick={() => setMobileTab('permissions')}
            className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
              mobileTab === 'permissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            🔐 Share
          </button>
        </div>

        {/* Mobile Content */}
        <div className="space-y-4">
          {mobileTab === 'documents' && (
            <>
              <DocumentUpload />
              <DocumentList selectedId={selectedDocumentId ?? undefined} onSelect={(id) => setSelectedDocumentId(id)} />
            </>
          )}
          {mobileTab === 'forensic' && <ForensicResultsPanel selectedDocumentId={selectedDocumentId ?? undefined} />}
          {mobileTab === 'nft' && <NFTPanel />}
          {mobileTab === 'permissions' && <PermissionsPanel selectedDocumentId={selectedDocumentId ?? undefined} />}
        </div>
      </div>
    </main>
  )
}
