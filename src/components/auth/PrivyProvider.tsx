'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'
import { privyConfig, PRIVY_APP_ID } from '@/lib/privy/config'
import { useEffect, useState } from 'react'

interface PrivyProviderProps {
  children: React.ReactNode
}

function WalletDetectionLogger({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Log wallet detection on mount
    if (typeof window !== 'undefined') {
      console.log('[PrivyProvider] Checking for wallet extensions...')
      
      // Check for common Solana wallet properties
      const walletChecks = {
        solflare: !!(window as any).solflare,
        solflareIsSolflare: (window as any).solflare?.isSolflare,
        phantom: !!(window as any).phantom?.solana,
        phantomIsPhantom: (window as any).phantom?.solana?.isPhantom,
        backpack: !!(window as any).backpack,
        glow: !!(window as any).glow,
        solana: !!(window as any).solana,
      }
      
      console.log('[PrivyProvider] Wallet detection results:', walletChecks)
    }
  }, [])

  return <>{children}</>
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Check if Privy is configured
  if (!PRIVY_APP_ID || PRIVY_APP_ID === 'undefined') {
    // Do not render children without the Privy provider - rendering children
    // without the provider can cause hooks like `usePrivy` to throw.
    return (
      <div style={{ padding: '20px', color: '#666', fontSize: '14px' }}>
        <p>⚠️ Privy not configured. Add `NEXT_PUBLIC_PRIVY_APP_ID` to `.env.local`</p>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          Get your Privy App ID from: https://console.privy.io
        </p>
      </div>
    )
  }

  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={privyConfig}
    >
      <WalletDetectionLogger>
        {children}
      </WalletDetectionLogger>
    </BasePrivyProvider>
  )
}