'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/**
 * ISSUER LOGIN - Government Official (Ministry of Lands)
 * 
 * Dummy Credentials:
 * Email: issuer@lands.gov
 * Password: IssuerPass123!
 * 
 * Roles: Can upload documents, verify citizens, issue NFTs
 */
export default function IssuerLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('issuer@lands.gov')
  const [password, setPassword] = useState('IssuerPass123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Demo login bypass
    if (email === 'issuer@lands.gov' && password === 'IssuerPass123!') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', 'demo-token-issuer-' + Date.now())
        localStorage.setItem('nddv_user_id', 'demo-issuer')
        localStorage.setItem('nddv_user_role', 'ISSUER')
        localStorage.setItem('nddv_user_firstName', 'Mohamed')
        localStorage.setItem('nddv_user_lastName', 'Conteh')
        localStorage.setItem('nddv_user_name', 'Mohamed Conteh')
      }
      window.location.href = '/maker'
      return
    }

    try {
      const res = await fetch('/api/auth/issuer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed. Try demo credentials.')
        setLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        localStorage.setItem('nddv_user_id', body.user.id)
        localStorage.setItem('nddv_user_role', body.user.role)
        localStorage.setItem('nddv_user_name', body.user.firstName)
      }

      window.location.href = '/maker'
    } catch (err: any) {
      setError('Network error. Try demo credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="w-full max-w-md card fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-solana-teal">🏛️ NDDV</span>
          </h1>
          <h2 className="text-2xl font-bold mb-2">Issuer Portal</h2>
          <p className="text-foreground-secondary text-sm">Government Officials</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="mb-6 p-4 rounded-lg bg-solana-teal/10 border border-solana-teal/30">
          <p className="text-xs uppercase font-bold text-solana-teal mb-2">Demo Credentials</p>
          <p className="text-xs text-foreground-secondary mb-1">📧 issuer@lands.gov</p>
          <p className="text-xs text-foreground-secondary">🔑 IssuerPass123!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-background-secondary border border-solana-teal/20 text-foreground placeholder-foreground-secondary/50 focus:outline-none focus:border-solana-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-background-secondary border border-solana-teal/20 text-foreground placeholder-foreground-secondary/50 focus:outline-none focus:border-solana-teal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-solana-teal to-solana-teal/80 text-background font-bold hover:shadow-lg hover:shadow-solana-teal/50 transition-all disabled:opacity-50"
          >
            {loading ? '🔄 Logging in...' : '✅ Login as Issuer'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 pt-6 border-t border-solana-teal/20 flex gap-4 text-xs text-center">
          <Link href="/login" className="flex-1 text-foreground-secondary hover:text-solana-teal transition-colors">
            Citizen Login
          </Link>
          <div className="text-foreground-secondary/30">•</div>
          <Link href="/login/verifier" className="flex-1 text-foreground-secondary hover:text-solana-teal transition-colors">
            Verifier Login
          </Link>
        </div>
      </div>
    </div>
  )
}
