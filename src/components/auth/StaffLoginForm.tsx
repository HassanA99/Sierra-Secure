"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Staff Login Form - Modern Futuristic UI
 * 
 * Government staff login (Verifiers and Makers)
 */
export default function StaffLoginForm() {
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!staffId || !password) {
      setError('Staff ID and password required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        if (body.user?.id) localStorage.setItem('nddv_user_id', body.user.id)
        if (body.user?.role) localStorage.setItem('nddv_user_role', body.user.role)
      }

      const role = body.user?.role
      if (role === 'VERIFIER') {
        router.push('/verifier')
      } else if (role === 'MAKER') {
        router.push('/maker')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card fade-in">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="gradient-text text-4xl font-bold mb-2">NDDV</h1>
          <div className="neon-line mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Government Staff</h2>
          <span className="text-sm text-gray-400">Secure access for authorized personnel</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error-light rounded-lg border-l-4 border-red-500 fade-in">
            <span className="text-error text-sm">{error}</span>
          </div>
        )}

        {/* Role Information */}
        <div className="mb-6 p-4 bg-success-light rounded-lg">
          <span className="text-xs text-success font-semibold block mb-2">Your Authorized Roles:</span>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>🔍 <strong>Verifier:</strong> Validate document status</li>
            <li>✍️ <strong>Maker:</strong> Issue official documents</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3">Staff ID</label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="VER-123456 or MAK-123456"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-top text-center">
          <span className="text-xs text-gray-500">Contact your administrator for access</span>
        </div>
      </div>
    </div>
  )
}

