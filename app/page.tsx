'use client'

import { usePrivy } from '@privy-io/react-auth'
import { LoginButton } from '../src/components/auth/LoginButton'
import { LogoutButton } from '../src/components/auth/LogoutButton'
import { WalletTroubleshooting } from '../src/components/auth/WalletTroubleshooting'

export default function Home() {
  const { ready, authenticated, user } = usePrivy()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              National Digital Document Vault
            </h1>
            <div className="flex items-center gap-4">
              {authenticated && user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.email || 'User'}
                </span>
              )}
              <LoginButton />
              <WalletTroubleshooting />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Digital Document Storage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Store, verify, and share your official documents using blockchain technology. 
            Powered by Solana for identity verification and NFTs for ownership documents.
          </p>
        </div>

        {authenticated ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Documents</h3>
              <p className="text-gray-600 mb-4">
                View and manage your stored documents
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                View Documents
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h3>
              <p className="text-gray-600 mb-4">
                Add new documents to your vault
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Upload New
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verify Document</h3>
              <p className="text-gray-600 mb-4">
                Verify the authenticity of any document
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Verify Now
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to access the National Digital Document Vault
              </p>
              <LoginButton />
              <div className="mt-4">
                <WalletTroubleshooting />
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Verified</h4>
            <p className="text-gray-600">
              All documents are cryptographically secured and verified on the Solana blockchain
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8.5h.01M12 17v2m-6 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Encryption</h4>
            <p className="text-gray-600">
              Your sensitive document data is encrypted and only accessible by you
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure Sharing</h4>
            <p className="text-gray-600">
              Safely share documents with granular permissions and expiration controls
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
