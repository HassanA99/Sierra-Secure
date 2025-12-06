'use client'

import { useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Navbar } from '../components/layout/Navbar'
import { HeroSectionNew } from '../components/landing/HeroSectionNew'
import { FeaturesSectionNew } from '../components/landing/FeaturesSectionNew'
import { SecuritySectionNew } from '../components/landing/SecuritySectionNew'

// Lazy load heavy components for performance
const SocialProofSection = lazy(() => import('../components/landing/SocialProofSection').then(m => ({ default: m.SocialProofSection })))

export default function Home() {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/dashboard')
    }
  }, [ready, authenticated, router])

  // Optional: Show loading state while checking auth to prevent flash
  if (!ready) return null

  // If authenticated, don't render landing page (redirecting...)
  if (authenticated) return null

  return (
    <main className="w-full relative min-h-screen">
      <Navbar />
      <HeroSectionNew />
      <FeaturesSectionNew />
      <SecuritySectionNew />

      {/* Leadership Section - Simplified */}
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-background-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="bg-gradient-to-r from-[var(--sl-green)] to-[var(--sl-blue)] bg-clip-text text-transparent">
                Government Leadership
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Building a digital future for all Sierra Leone citizens.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'H.E. Julius Maada Bio', role: 'President', icon: '🇸🇱' },
              { name: 'David Moinina Sengeh', role: 'Chief Minister', icon: '🔭' },
              { name: 'Salima Monorma Bah', role: 'Minister of Tech', icon: '🌐' },
              { name: 'Mohamed M. Massaquoi', role: 'NCRA Director General', icon: '🆔' },
            ].map((leader, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--sl-green)]/30 transition-all text-center"
              >
                <div className="text-4xl mb-4">{leader.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{leader.name}</h3>
                <p className="text-sm text-[var(--sl-green)] font-semibold">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Lazy Loaded */}
      <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading...</div>}>
        <SocialProofSection />
      </Suspense>

      {/* Footer - Simplified */}
      <footer className="relative z-10 border-t border-white/10 bg-background-secondary/80 backdrop-blur-lg py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/NDDV_logo.png" alt="NDDV" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--sl-green)] to-[var(--sl-blue)] bg-clip-text text-transparent">NDDV</span>
                  <p className="text-xs text-gray-400">Sierra Leone</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">
                Official National Digital Document Vault of Sierra Leone.
              </p>
            </div>

            {/* Government */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase">Government</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">Ministry of Tech</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">NCRA</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">Land Registry</a></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase">Help</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--sl-green)] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                © 2025 National Digital Document Vault. Republic of Sierra Leone.
              </p>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
                <span>🇸🇱 Made for Sierra Leone</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
