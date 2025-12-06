'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'

export function HeroSectionNew() {
  const { authenticated, login } = usePrivy()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-background via-background-secondary/50 to-background">
      {/* Sierra Leone Flag Colors Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-[var(--sl-green)]" />
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-[var(--sl-white)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[var(--sl-blue)]" />
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Logo & Sierra Leone Badge */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <img
            src="/NDDV_logo.png"
            alt="NDDV - National Digital Document Vault"
            className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
          />
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xl">🇸🇱</span>
            <span className="text-sm font-semibold text-white">Republic of Sierra Leone</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="block text-white mb-2">Your Documents,</span>
          <span className="block bg-gradient-to-r from-[var(--sl-green)] via-[var(--sl-white)] to-[var(--sl-blue)] bg-clip-text text-transparent">
            Forever Secure
          </span>
        </h1>

        {/* Subheadline - Simple, No Jargon */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Store your important documents safely with government-backed protection.
          <br className="hidden sm:block" />
          <span className="text-white font-medium">Verified. Protected. Yours Forever.</span>
        </p>

        {/* Simple Benefits */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm sm:text-base">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sl-green)]/10 border border-[var(--sl-green)]/30">
            <span className="text-[var(--sl-green)]">✓</span>
            <span className="text-white">Government Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sl-blue)]/10 border border-[var(--sl-blue)]/30">
            <span className="text-[var(--sl-blue)]">✓</span>
            <span className="text-white">Cannot Be Lost</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30">
            <span className="text-white">✓</span>
            <span className="text-white">Free for Citizens</span>
          </div>
        </div>

        {/* CTA Buttons - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
          {authenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--sl-green)] hover:bg-[var(--sl-green-dark)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--sl-green)]/30 transition-all transform hover:scale-105 text-center"
            >
              Go to My Documents
            </Link>
          ) : (
            <>
              <button
                onClick={() => login()}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--sl-green)] hover:bg-[var(--sl-green-dark)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--sl-green)]/30 transition-all transform hover:scale-105"
              >
                Get Started Free
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[var(--sl-blue)] text-[var(--sl-blue)] hover:bg-[var(--sl-blue)]/10 font-semibold rounded-xl transition-all"
              >
                Citizen Login
              </Link>
            </>
          )}
        </div>

        {/* Simple Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { value: '10K+', label: 'Documents', icon: '📄' },
            { value: '5K+', label: 'Citizens', icon: '👥' },
            { value: '99.9%', label: 'Uptime', icon: '⚡' },
            { value: '100%', label: 'Free', icon: '🆓' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center"
            >
              <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Badges - Government Partners */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-6">
            Trusted by Government
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[
              { name: 'Ministry of Lands', icon: '🏛️' },
              { name: 'NCRA', icon: '📋' },
              { name: 'Digital Services', icon: '⚙️' },
            ].map((org) => (
              <div
                key={org.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[var(--sl-green)]/30 transition-colors"
              >
                <span className="text-lg">{org.icon}</span>
                <span className="text-sm text-gray-300">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#features" className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <span className="text-xs uppercase tracking-wider">Learn More</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  )
}

