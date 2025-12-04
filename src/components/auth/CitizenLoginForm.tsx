"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Citizen Login Form - Modern Futuristic UI
 * 
 * Hides all cryptocurrency complexity.
 * Only shows: Phone Number and PIN
 * 
 * The embedded Privy wallet is created automatically - citizens never see it.
 * No "Connect Wallet" buttons. No "Phantom" or "Solana" references.
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card fade-in">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="gradient-text text-4xl font-bold mb-2">NDDV</h1>
          <div className="neon-line mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Citizen Portal</h2>
          <span className="text-sm text-gray-400">Access your documents securely</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error-light rounded-lg border-l-4 border-red-500 fade-in">
            <span className="text-error text-sm">{error}</span>
          </div>
        )}


        {/* Phone Entry Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6 fade-in">
            <div>
              <label className="block mb-3">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        )}

        {/* PIN Entry Step */}
        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-6 fade-in">
            <div className="p-4 bg-success-light rounded-lg border-l-4 border-green-500">
              <span className="text-sm text-success">Verification code sent to {phoneNumber}</span>
            </div>

            <div>
              <label className="block mb-3">Enter PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                maxLength={6}
                disabled={loading}
                autoFocus
                className="w-full text-center text-2xl tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
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
              className="w-full btn btn-secondary"
            >
              Back
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-top text-center">
          <span className="text-xs text-gray-500">Government-grade encryption protects your data</span>
        </div>
      </div>
    </div>
  )
}

