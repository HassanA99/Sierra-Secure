'use client'

import { useLogin, usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { debugWalletProviders, getDetectedWallets, waitForWallet } from '@/lib/privy/wallet-detection'

export function LoginButton() {
  const { login } = useLogin()
  const { authenticated, ready } = usePrivy()
  const [walletsDetected, setWalletsDetected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Debug wallet providers on mount
    debugWalletProviders()

    // Wait for wallets to be injected
    const checkWallets = async () => {
      setIsChecking(true)
      
      // Wait a bit for wallet extensions to inject
      await waitForWallet('solflare', 2000)
      
      const detected = getDetectedWallets()
      setWalletsDetected(detected.length > 0)
      setIsChecking(false)
      
      console.log('[LoginButton] Wallet detection complete:', {
        detected: detected.map(w => w.name),
        count: detected.length
      })
    }

    checkWallets()
  }, [])

  const handleLogin = () => {
    // Debug again right before login
    console.log('[LoginButton] Login clicked - checking wallets again...')
    debugWalletProviders()
    
    login({
      onSuccess: () => {
        console.log('[LoginButton] Login successful')
      },
      onError: (error) => {
        console.error('[LoginButton] Login error:', error)
      }
    })
  }

  if (!ready || isChecking) {
    return (
      <div className="text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (authenticated) {
    return null
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Connect Wallet
      </button>
      {walletsDetected && (
        <span className="text-xs text-green-600">
          ✓ Wallet detected
        </span>
      )}
    </div>
  )
}