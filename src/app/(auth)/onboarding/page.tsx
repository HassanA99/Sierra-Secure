'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, authenticated, ready } = usePrivy()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.replace('/login')
    }
  }, [ready, authenticated, router])

  // Check if already onboarded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('nddv_user_firstName')
      if (storedName) {
        // Already onboarded, go to dashboard
        router.replace('/dashboard')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name')
      return
    }

    setLoading(true)

    try {
      // Save to localStorage
      localStorage.setItem('nddv_user_firstName', firstName.trim())
      localStorage.setItem('nddv_user_lastName', lastName.trim())
      localStorage.setItem('nddv_user_name', `${firstName.trim()} ${lastName.trim()}`)
      if (phoneNumber.trim()) {
        localStorage.setItem('nddv_user_phone', phoneNumber.trim())
      }

      // Optionally update the backend user profile
      const userId = localStorage.getItem('nddv_user_id')
      if (userId) {
        await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('nddv_token')}`,
            'x-user-id': userId
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim() || null
          })
        }).catch(() => {
          // Ignore API errors, localStorage is enough for now
        })
      }

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!ready) return null

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />
      <div className="neural-grid" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-solana-teal/20 to-violet-accent/20 border border-solana-teal/50 flex items-center justify-center">
              <span className="text-4xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to NDDV</h1>
            <p className="text-foreground-secondary text-sm">
              Let&apos;s set up your digital identity vault
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                First Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Last Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Phone Number <span className="text-foreground-secondary/50">(Optional)</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+232 XX XXX XXXX"
                className="input w-full"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-4 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Continue to Dashboard</span>
                    <span>→</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-solana-teal/5 border border-solana-teal/20">
            <div className="flex items-start gap-3">
              <span className="text-solana-teal">🔐</span>
              <p className="text-xs text-foreground-secondary">
                Your information is stored securely and used only to personalize your experience.
                All document storage fees are covered by the Government of Sierra Leone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
