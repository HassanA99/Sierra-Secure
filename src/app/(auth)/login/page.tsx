"use client"
import React, { useState } from 'react'
import CitizenLoginForm from '@/components/auth/CitizenLoginForm'
import StaffLoginForm from '@/components/auth/StaffLoginForm'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export default function LoginPage() {
  const [userType, setUserType] = useState<'citizen' | 'staff' | null>(null)

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground />
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      {/* Neural Grid */}
      <div className="neural-grid" />

      {/* Login Type Selection */}
      {userType === null && (
        <div className="relative z-10 w-full max-w-lg">
          <div className="glass-card p-8 fade-in">
            {/* Logo & Header */}
            <div className="mb-10 text-center">
              {/* Animated Shield */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-solana-teal/30 to-violet-accent/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-solana-teal/20 to-violet-accent/20 border border-solana-teal/50 flex items-center justify-center">
                  <span className="text-4xl">🛡️</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-2 gradient-text-animated">NDDV</h1>
              <div className="neon-line w-32 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                National Digital Document Vault
              </h2>
              <p className="text-sm text-foreground-secondary">
                Secure blockchain-verified document management
              </p>
            </div>

            {/* User Type Selection */}
            <div className="space-y-4">
              <button
                onClick={() => setUserType('citizen')}
                className="group w-full p-6 rounded-2xl bg-background-secondary/50 border border-solana-teal/20 hover:border-solana-teal transition-all hover:shadow-lg hover:shadow-solana-teal/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-solana-teal/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🏛️
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-solana-teal mb-1">Citizen Portal</h3>
                    <p className="text-sm text-foreground-secondary">
                      Access your personal documents with Privy wallet
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-solana-teal opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => setUserType('staff')}
                className="group w-full p-6 rounded-2xl bg-background-secondary/50 border border-violet-accent/20 hover:border-violet-accent transition-all hover:shadow-lg hover:shadow-violet-accent/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-violet-accent/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    👔
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-violet-accent mb-1">Government Staff</h3>
                    <p className="text-sm text-foreground-secondary">
                      Verify or issue official documents
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-violet-accent opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-foreground-secondary">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Secured by Solana Blockchain</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Login Form */}
      {userType === 'citizen' && (
        <div className="relative z-10 w-full max-w-md fade-in">
          <button
            onClick={() => setUserType(null)}
            className="mb-6 text-foreground-secondary hover:text-solana-teal text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login Selection
          </button>
          <CitizenLoginForm />
        </div>
      )}

      {/* Staff Login Form */}
      {userType === 'staff' && (
        <div className="relative z-10 w-full max-w-md fade-in">
          <button
            onClick={() => setUserType(null)}
            className="mb-6 text-foreground-secondary hover:text-violet-accent text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login Selection
          </button>
          <StaffLoginForm />
        </div>
      )}
    </main>
  )
}
