'use client'

import React, { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function TopBanner() {
    const { user, logout } = usePrivy()
    const [userName, setUserName] = useState<string>('')

    // Get user's name from localStorage (set during onboarding) or fallback to email
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('nddv_user_name')
            const storedFirstName = localStorage.getItem('nddv_user_firstName')
            const storedLastName = localStorage.getItem('nddv_user_lastName')

            if (storedFirstName && storedLastName) {
                setUserName(`${storedFirstName} ${storedLastName}`)
            } else if (storedName) {
                setUserName(storedName)
            } else if (user?.email?.address) {
                // Extract name from email as fallback
                setUserName(user.email.address.split('@')[0])
            } else {
                setUserName('Citizen')
            }
        }
    }, [user])

    // Mock AI Confidence Score (in production, fetch from API)
    const aiConfidence = 99.9

    return (
        <div className="bg-background-secondary border-b border-white/10 p-4 mb-6 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                {/* Welcome Section */}
                <div>
                    <h2 className="text-xl font-bold">
                        Welcome, <span className="gradient-text">{userName}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-foreground-secondary mt-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span>Wallet Connected</span>
                        <span className="text-white/20">|</span>
                        <span className="font-mono text-xs opacity-70">
                            {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'No Wallet'}
                        </span>
                    </div>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-4">

                    {/* Custody Status */}
                    <div className="glass-card px-4 py-2 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-solana-teal/10">
                            <span className="text-xl">🔐</span>
                        </div>
                        <div>
                            <p className="text-xs text-foreground-secondary uppercase tracking-wider">Custody</p>
                            <p className="text-sm font-bold text-solana-teal">Self-Sovereign</p>
                        </div>
                    </div>

                    {/* AI Score */}
                    <div className="glass-card px-4 py-2 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-accent/10">
                            <span className="text-xl">🤖</span>
                        </div>
                        <div>
                            <p className="text-xs text-foreground-secondary uppercase tracking-wider">Vault Integrity</p>
                            <p className="text-sm font-bold text-violet-accent">{aiConfidence}% Secure</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-foreground-secondary transition-colors"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </div>
    )
}
