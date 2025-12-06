'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { ParticleBackground } from '../ui/ParticleBackground'

export function HeroSection() {
  const { authenticated, login } = usePrivy()
  const [mounted, setMounted] = useState(false)
  const [currentText, setCurrentText] = useState(0)

  const headlines = [
    { text: 'Sovereign Identity.', color: 'text-primary' },
    { text: 'Immutable Assets.', color: 'text-secondary' },
    { text: 'Zero Fraud.', color: 'text-foreground' },
  ]

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Gradient Orbs */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      {/* Neural Grid */}
      <div className="neural-grid" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* 3D Shield Animation */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            {/* Outer Glow Ring */}
            <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-solana-teal/20 via-violet-accent/20 to-solana-teal/20 blur-2xl animate-pulse" />

            {/* Middle Ring */}
            <div className="absolute inset-[-10px] rounded-full border-2 border-solana-teal/30 animate-[spin_20s_linear_infinite]" />

            {/* Shield Container */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              {/* Holographic Shield */}
              <svg
                className="w-full h-full drop-shadow-[0_0_30px_rgba(20,241,149,0.5)]"
                viewBox="0 0 100 100"
                fill="none"
              >
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14F195" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Shield Path */}
                <path
                  d="M50 10 L85 25 L85 55 Q85 75 50 90 Q15 75 15 55 L15 25 Z"
                  fill="url(#shieldGrad)"
                  fillOpacity="0.2"
                  stroke="url(#shieldGrad)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Checkmark */}
                <path
                  d="M35 50 L45 60 L65 40"
                  stroke="#14F195"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="animate-pulse"
                />

                {/* Lock Icon */}
                <circle cx="50" cy="70" r="6" fill="#8B5CF6" fillOpacity="0.6" />
                <rect x="44" y="64" width="12" height="8" rx="2" fill="#8B5CF6" fillOpacity="0.6" />
              </svg>

              {/* Orbiting Dots */}
              <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-solana-teal shadow-[0_0_10px_#14F195]" />
              </div>
              <div className="absolute inset-0 animate-[spin_15s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-accent shadow-[0_0_10px_#8B5CF6]" />
              </div>
            </div>
          </div>
        </div>

        {/* Headline with Animation */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight">
          {headlines.map((headline, index) => (
            <span
              key={headline.text}
              className={`block transition-all duration-500 ${index === currentText
                  ? 'opacity-100 transform-none'
                  : 'opacity-30 scale-95'
                } ${headline.color}`}
              style={{
                textShadow: index === currentText
                  ? headline.color === 'text-primary'
                    ? '0 0 40px rgba(20, 241, 149, 0.5)'
                    : headline.color === 'text-secondary'
                      ? '0 0 40px rgba(139, 92, 246, 0.5)'
                      : 'none'
                  : 'none'
              }}
            >
              {headline.text}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-foreground-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
          Government-backed digital identity protected by{' '}
          <span className="text-violet-accent font-semibold">Gemini AI</span> and{' '}
          <span className="text-solana-teal font-semibold">Solana blockchain</span>.
          <br className="hidden sm:block" />
          No hidden fees. No private key management. Pure sovereignty.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {authenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-primary text-lg px-10 py-4"
            >
              🚀 Go to Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={() => login()}
                className="btn btn-primary text-lg px-10 py-4 group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Get Started Free
                </span>
              </button>
              <Link
                href="/login"
                className="btn btn-outline text-lg px-10 py-4"
              >
                Citizen Login
              </Link>
            </>
          )}
        </div>

        {/* Stats Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {[
            { value: '10K+', label: 'Documents Secured', icon: '📄' },
            { value: '5K+', label: 'Citizens Protected', icon: '👥' },
            { value: '99.9%', label: 'Uptime', icon: '⚡' },
            { value: '0', label: 'Fraud Cases', icon: '🛡️' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-4 sm:p-6 text-center fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text-animated">{stat.value}</div>
              <div className="text-xs sm:text-sm text-foreground-secondary mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="border-t border-solana-teal/20 pt-8">
          <p className="text-sm text-foreground-secondary uppercase tracking-widest mb-6">
            Trusted by Government Institutions
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { icon: '🏛️', name: 'Ministry of Lands' },
              { icon: '📋', name: 'NCRA' },
              { icon: '⚙️', name: 'Digital Services' },
              { icon: '🔐', name: 'Security Authority' },
            ].map((org) => (
              <div
                key={org.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background-secondary/50 border border-solana-teal/10 hover:border-solana-teal/30 transition-colors"
              >
                <span className="text-lg">{org.icon}</span>
                <span className="text-sm font-medium text-foreground-secondary">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#features" className="flex flex-col items-center gap-2 text-foreground-secondary hover:text-solana-teal transition-colors">
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  )
}
