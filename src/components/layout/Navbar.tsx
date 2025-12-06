'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'

export function Navbar() {
  const router = useRouter()
  const { user, logout, authenticated } = usePrivy()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) return null

  const handleLogout = async () => {
    await logout()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nddv_token')
      localStorage.removeItem('nddv_user_id')
      localStorage.removeItem('nddv_privy_user_id')
      localStorage.removeItem('nddv_user_role')
    }
    router.push('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-background/90 backdrop-blur-xl border-b border-[var(--sl-green)]/20 shadow-lg shadow-black/20'
      : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--sl-green)]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/NDDV_logo.png"
                alt="NDDV Logo"
                className="relative h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[var(--sl-green)] to-[var(--sl-blue)] bg-clip-text text-transparent">NDDV</span>
              <span className="hidden sm:block text-[10px] text-gray-400 uppercase tracking-widest -mt-1">
                Sierra Leone
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-[var(--sl-green)] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/documents"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-[var(--sl-green)] transition-colors"
                >
                  Documents
                </Link>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--sl-green)]/30 to-[var(--sl-blue)]/30 flex items-center justify-center text-sm font-bold">
                    {(typeof user?.email === 'string' ? user.email : user?.email?.address)?.charAt(0)?.toUpperCase() || '👤'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-background-secondary border border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400/50 transition-all text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a
                  href="#features"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-[var(--sl-green)] transition-colors"
                >
                  Features
                </a>
                <a
                  href="#security"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-[var(--sl-green)] transition-colors"
                >
                  Security
                </a>

                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-[var(--sl-green)] hover:bg-[var(--sl-green-dark)] text-white font-semibold rounded-xl transition-all"
                  >
                    ⚡ Get Started
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-background-secondary/50 border border-white/10 hover:border-[var(--sl-green)]/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 fade-in">
            <div className="glass-card p-4 space-y-2">
              {authenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 rounded-xl text-gray-300 hover:text-[var(--sl-green)] hover:bg-background-secondary/50 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/documents"
                    className="block px-4 py-3 rounded-xl text-gray-300 hover:text-[var(--sl-green)] hover:bg-background-secondary/50 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    📄 Documents
                  </Link>
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="w-full px-4 py-3 rounded-xl text-left text-error hover:bg-error/10 transition-all"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a
                    href="#features"
                    className="block px-4 py-3 rounded-xl text-gray-300 hover:text-[var(--sl-green)] hover:bg-background-secondary/50 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    ✨ Features
                  </a>
                  <a
                    href="#security"
                    className="block px-4 py-3 rounded-xl text-gray-300 hover:text-[var(--sl-green)] hover:bg-background-secondary/50 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    🔒 Security
                  </a>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="btn btn-primary w-full py-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      ⚡ Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
