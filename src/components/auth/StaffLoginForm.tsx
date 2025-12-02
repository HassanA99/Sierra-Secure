"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Staff Login Form (For Verifiers and Makers)
 * 
 * Government staff can use traditional credentials
 * They need to be provisioned with proper roles by admin
 * 
 * Shows role-based login:
 * - VERIFIER: Views documents for validation
 * - MAKER: Issues new digital documents
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

      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        if (body.user?.id) localStorage.setItem('nddv_user_id', body.user.id)
        if (body.user?.role) localStorage.setItem('nddv_user_role', body.user.role)
      }

      // Redirect to role-based dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Logo/Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Government Portal
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Staff Access Only
          </p>
        </div>

        {/* Information */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 mb-2 font-semibold">Your Role:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li><strong>Verifier:</strong> Validate document status</li>
            <li><strong>Maker:</strong> Issue official documents</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff ID
            </label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="STF-123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 text-center">
          <p>Contact your administrator if you don't have credentials</p>
        </div>
      </div>
    </div>
  )
}
