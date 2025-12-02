"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Citizen Login Form
 * 
 * Hides all cryptocurrency complexity.
 * Only shows: Phone Number and PIN
 * 
 * The embedded Privy wallet is created automatically - citizens never see it.
 * No "Connect Wallet" buttons. No "Phantom" or "Solana" references.
 * This feels like government app login, not a crypto exchange.
 */
export default function CitizenLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'phone' | 'pin'>('phone')
  const router = useRouter()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    
    setStep('pin')
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!pin || pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    setLoading(true)
    try {
      // In production, this would verify against Privy's authentication
      // For now, we exchange phone + PIN for a session token
      const res = await fetch('/api/auth/citizen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, pin }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed')
        setStep('phone')
        setPin('')
        return
      }

      // Store token and user info - user role is automatically CITIZEN
      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        if (body.user?.id) localStorage.setItem('nddv_user_id', body.user.id)
        if (body.user?.role) localStorage.setItem('nddv_user_role', body.user.role)
      }

      router.push('/dashboard')
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
            Digital Document Vault
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Secure access to your government documents
          </p>
        </div>

        {/* Phone Entry Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
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
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        )}

        {/* PIN Entry Step */}
        {step === 'pin' && (
          <form onSubmit={handlePinSubmit}>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg">
              Code sent to {phoneNumber}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                disabled={loading}
                autoFocus
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
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setPin('')
                setError(null)
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* Footer - No crypto language */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 text-center">
          <p>Your documents are secured with government-grade encryption</p>
        </div>
      </div>
    </div>
  )
}
