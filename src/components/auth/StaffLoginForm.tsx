"use client"
import React, { useState } from 'react'

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  verifier: { staffId: 'VER-123456', password: 'demo123', role: 'VERIFIER', name: 'John Kamara' },
  maker: { staffId: 'MAK-123456', password: 'demo123', role: 'MAKER', name: 'Fatmata Sesay' },
  issuer: { staffId: 'ISS-123456', password: 'demo123', role: 'ISSUER', name: 'Mohamed Conteh' },
  admin: { staffId: 'ADM-123456', password: 'demo123', role: 'ADMIN', name: 'Aminata Koroma' },
}

/**
 * Staff Login Form - Government Staff Portal
 * 
 * How government staff get onboarded:
 * 1. Admin creates staff accounts through admin portal
 * 2. Staff receives credentials via official email
 * 3. Staff logs in using their assigned Staff ID and password
 * 
 * Demo credentials available for testing.
 */
export default function StaffLoginForm() {
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!staffId || !password) {
      setError('Staff ID and password required')
      return
    }

    setLoading(true)

    // Check demo credentials first
    const demoUser = Object.values(DEMO_CREDENTIALS).find(
      cred => cred.staffId.toLowerCase() === staffId.toLowerCase() && cred.password === password
    )

    if (demoUser) {
      // Demo login - bypass API
      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', 'demo-token-' + Date.now())
        localStorage.setItem('nddv_user_id', 'demo-' + demoUser.role.toLowerCase())
        localStorage.setItem('nddv_user_role', demoUser.role)
        localStorage.setItem('nddv_user_firstName', demoUser.name.split(' ')[0])
        localStorage.setItem('nddv_user_lastName', demoUser.name.split(' ')[1] || '')
        localStorage.setItem('nddv_user_name', demoUser.name)
        localStorage.setItem('nddv_staff_id', demoUser.staffId)

        // Use window.location for reliable navigation
        if (demoUser.role === 'VERIFIER') {
          window.location.href = '/verifier'
        } else if (demoUser.role === 'MAKER' || demoUser.role === 'ISSUER') {
          window.location.href = '/maker'
        } else if (demoUser.role === 'ADMIN') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
      return
    }

    // Try API login
    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        if (body.user?.id) localStorage.setItem('nddv_user_id', body.user.id)
        if (body.user?.role) localStorage.setItem('nddv_user_role', body.user.role)

        const role = body.user?.role
        if (role === 'VERIFIER') {
          window.location.href = '/verifier'
        } else if (role === 'MAKER' || role === 'ISSUER') {
          window.location.href = '/maker'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err: any) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const fillDemo = (type: 'verifier' | 'maker') => {
    const cred = DEMO_CREDENTIALS[type]
    setStaffId(cred.staffId)
    setPassword(cred.password)
  }

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-accent/20 border border-violet-accent/50 flex items-center justify-center">
          <span className="text-3xl">👔</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Government Staff</h1>
        <p className="text-foreground-secondary text-sm">Secure access for authorized personnel</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 fade-in">
          <span className="text-error text-sm">{error}</span>
        </div>
      )}

      {/* Demo Credentials Info */}
      <div className="mb-6 p-4 rounded-xl bg-solana-teal/5 border border-solana-teal/20">
        <p className="text-xs font-semibold text-solana-teal mb-3">🔑 Demo Credentials (click to fill):</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo('verifier')}
            className="px-3 py-1.5 rounded-lg bg-background-secondary text-xs hover:bg-solana-teal/20 transition-colors"
          >
            🔍 Verifier
          </button>
          <button
            type="button"
            onClick={() => fillDemo('maker')}
            className="px-3 py-1.5 rounded-lg bg-background-secondary text-xs hover:bg-violet-accent/20 transition-colors"
          >
            ✍️ Maker/Issuer
          </button>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-background/50 text-xs text-foreground-secondary">
          <p>📋 <strong>Verifier:</strong> VER-123456 / demo123</p>
          <p>📋 <strong>Maker:</strong> MAK-123456 / demo123</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">Staff ID</label>
          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            placeholder="Enter your Staff ID"
            disabled={loading}
            className="input w-full"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            className="input w-full"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Onboarding Info */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-foreground-secondary mb-2">💼 <strong>How to get access:</strong></p>
        <ol className="text-xs text-foreground-secondary/70 space-y-1 list-decimal list-inside">
          <li>Contact your department administrator</li>
          <li>Complete staff verification process</li>
          <li>Receive your Staff ID and password via official email</li>
        </ol>
      </div>
    </div>
  )
}
