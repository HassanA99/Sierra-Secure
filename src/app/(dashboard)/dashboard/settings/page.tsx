'use client'

import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function SettingsPage() {
    const { user, logout } = usePrivy()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [showWalletKey, setShowWalletKey] = useState(false)
    const [saved, setSaved] = useState(false)

    // Load user data from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFirstName(localStorage.getItem('nddv_user_firstName') || '')
            setLastName(localStorage.getItem('nddv_user_lastName') || '')
            setEmail(user?.email?.address || '')
        }
    }, [user])

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('nddv_user_firstName', firstName)
            localStorage.setItem('nddv_user_lastName', lastName)
            localStorage.setItem('nddv_user_name', `${firstName} ${lastName}`)
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-foreground-secondary mt-1">
                    Manage your account and wallet preferences
                </p>
            </div>

            {/* Profile Section */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <span>👤</span> Profile Information
                </h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="input w-full"
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="input w-full"
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="input w-full opacity-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-foreground-secondary mt-1">
                            Email is managed by Privy and cannot be changed here
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        {saved ? '✓ Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Wallet Section */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <span>💳</span> Wallet Information
                </h2>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-solana-teal/5 border border-solana-teal/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Wallet Address</span>
                            <span className="text-xs text-solana-teal">Solana</span>
                        </div>
                        <p className="font-mono text-sm break-all">
                            {user?.wallet?.address || 'No wallet connected'}
                        </p>
                    </div>

                    {/* Export Wallet Keys (for Self-Custody awareness) */}
                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-warning mb-1">Wallet Keys</p>
                                <p className="text-sm text-foreground-secondary mb-3">
                                    Your wallet is managed by Privy with embedded security.
                                    The government pays all transaction fees on your behalf.
                                </p>

                                {!showWalletKey ? (
                                    <button
                                        onClick={() => setShowWalletKey(true)}
                                        className="text-sm text-warning hover:underline"
                                    >
                                        Show wallet recovery information →
                                    </button>
                                ) : (
                                    <div className="space-y-3 mt-3 p-3 rounded-lg bg-background/50">
                                        <p className="text-xs text-foreground-secondary">
                                            Your embedded wallet is secured by Privy. To export or backup:
                                        </p>
                                        <ol className="text-xs text-foreground-secondary space-y-1 list-decimal list-inside">
                                            <li>Go to Privy settings in your email</li>
                                            <li>Request wallet export via email verification</li>
                                            <li>Securely store your private key offline</li>
                                        </ol>
                                        <a
                                            href="https://docs.privy.io/guide/embedded-wallets/export"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-solana-teal hover:underline block"
                                        >
                                            Learn more about wallet export →
                                        </a>
                                        <button
                                            onClick={() => setShowWalletKey(false)}
                                            className="text-xs text-foreground-secondary hover:text-foreground"
                                        >
                                            Hide
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Government Fee Coverage Section */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <span>🏛️</span> Government Benefits
                </h2>
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="font-semibold text-success">All Fees Covered</p>
                            <p className="text-sm text-foreground-secondary mt-1">
                                As a citizen of Sierra Leone, all blockchain transaction fees
                                for document verification and storage are paid by the government.
                                You will never be charged for using this service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-error/20">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-error">
                    <span>🚨</span> Danger Zone
                </h2>
                <p className="text-sm text-foreground-secondary mb-4">
                    Logging out will end your session. Your documents remain safely stored on the blockchain.
                </p>
                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg border border-error/50 text-error hover:bg-error/10 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
