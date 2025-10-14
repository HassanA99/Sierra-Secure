'use client'

import { useState } from 'react'
import { debugWalletProviders } from '@/lib/privy/wallet-detection'

export function WalletTroubleshooting() {
  const [isOpen, setIsOpen] = useState(false)

  const handleDebug = () => {
    debugWalletProviders()
    alert('Check your browser console for wallet detection logs')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-700 underline"
      >
        Having trouble connecting your wallet?
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">Wallet Connection Help</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <div>
          <p className="font-medium mb-1">If Solflare redirects to download page:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Refresh the page (Ctrl+R or Cmd+R)</li>
            <li>Check if Solflare extension is enabled in chrome://extensions</li>
            <li>Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
            <li>Disable other Solana wallet extensions temporarily</li>
          </ol>
        </div>

        <div>
          <p className="font-medium mb-1">To verify Solflare is installed:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open browser console (F12)</li>
            <li>Type: <code className="bg-gray-200 px-1 rounded">window.solflare</code></li>
            <li>Should return an object (not undefined)</li>
          </ol>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDebug}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
          >
            Run Debug Check
          </button>
          <a
            href="https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
          >
            Install Solflare
          </a>
        </div>
      </div>
    </div>
  )
}

