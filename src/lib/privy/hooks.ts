'use client'

import { useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'

/**
 * Hook to get the user's Solana wallet from Privy
 * Returns the first connected Solana wallet
 */
export function useSolanaWallet() {
  const { wallets } = useWallets()

  const solanaWallet = useMemo(() => {
    // Find the first Solana wallet (either embedded or external like Solflare)
    return wallets.find((wallet) => wallet.walletClientType === 'solana')
  }, [wallets])

  const publicKey = useMemo(() => {
    if (!solanaWallet?.address) return null
    try {
      return new PublicKey(solanaWallet.address)
    } catch (error) {
      console.error('Invalid Solana address:', error)
      return null
    }
  }, [solanaWallet])

  return {
    wallet: solanaWallet,
    publicKey,
    address: solanaWallet?.address,
    connected: !!solanaWallet,
    walletType: solanaWallet?.connectorType, // 'solflare', 'phantom', etc.
  }
}

/**
 * Hook to get all connected wallets with type information
 */
export function useConnectedWallets() {
  const { wallets } = useWallets()

  const solanaWallets = wallets.filter((w) => w.walletClientType === 'solana')
  const ethereumWallets = wallets.filter((w) => w.walletClientType === 'ethereum')

  return {
    allWallets: wallets,
    solanaWallets,
    ethereumWallets,
    hasSolanaWallet: solanaWallets.length > 0,
    hasEthereumWallet: ethereumWallets.length > 0,
  }
}

