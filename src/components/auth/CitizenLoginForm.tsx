"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Citizen Login Form - Modern Futuristic UI
 * 
 * Hides all cryptocurrency complexity.
 * Only shows: Email Address and OTP Code
 * 
 * The embedded Privy wallet is created automatically - citizens never see it.
 * No "Connect Wallet" buttons. No "Phantom" or "Solana" references.
 */
export default function CitizenLoginForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    
    try {
      const res = await fetch('/api/auth/citizen-login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      setOtpSent(true)
      setStep('otp')
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed')
        setOtp('')
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


        {/* Email Entry Step */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6 fade-in">
            <div>
              <label className="block mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="user@example.com"
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* OTP Entry Step */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6 fade-in">
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                We've sent a 6-digit OTP code to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block mb-3">Enter OTP Code</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
                className="w-full text-center text-3xl tracking-widest font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setOtpSent(false)
              }}
              className="w-full btn-secondary"
            >
              Back to Email
            </button>
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

