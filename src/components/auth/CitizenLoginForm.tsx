"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy, useLoginWithEmail } from '@privy-io/react-auth'

/**
 * Citizen Login Form - Web3.5 Approach
 * 
 * Citizens login with email + Privy embedded wallet
 * Privy handles OTP verification internally
 * Government backend creates citizen profile
 */
export default function CitizenLoginForm() {
  const router = useRouter()
  const { user, authenticated } = usePrivy()
  const { sendCode, loginWithCode, state } = useLoginWithEmail()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // OTP Input Refs
  const otpRefs = Array(6).fill(0).map(() => React.createRef<HTMLInputElement>())

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Handle successful authentication
  useEffect(() => {
    if (authenticated && user?.id && step === 'code') {
      completeLogin()
    }
  }, [authenticated, user?.id])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await sendCode({ email })
      setStep('code')
      setCountdown(60)
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerifyCode(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      handleVerifyCode(pastedData)
    }
  }

  const handleVerifyCode = async (code: string) => {
    setError(null)
    setLoading(true)

    try {
      await loginWithCode({ code })
      // The useEffect above will call completeLogin when authenticated
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
      otpRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const completeLogin = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privyUserId: user.id }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        localStorage.setItem('nddv_user_id', body.user.id)
        localStorage.setItem('nddv_privy_user_id', user.id)
        localStorage.setItem('nddv_user_role', 'CITIZEN')

        // Save user name if returned from API
        if (body.user.firstName) {
          localStorage.setItem('nddv_user_firstName', body.user.firstName)
        }
        if (body.user.lastName) {
          localStorage.setItem('nddv_user_lastName', body.user.lastName)
        }

        // Check if user needs onboarding (no name set)
        const hasName = localStorage.getItem('nddv_user_firstName')
        if (!hasName && !body.user.firstName) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete login')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError(null)
    try {
      await sendCode({ email })
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code')
    }
  }

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-solana-teal/20 border border-solana-teal/50 flex items-center justify-center">
          <span className="text-3xl">🛡️</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-solana-teal">Citizen</span> Portal
        </h1>
        <p className="text-foreground-secondary text-sm">Web3.5 Digital Identity</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 fade-in">
          <div className="flex items-center gap-2">
            <span className="text-error">⚠️</span>
            <span className="text-error text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Email Step */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-6 fade-in">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary">
                📧
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={state.status === 'sending-code'}
                className="input pl-12"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={state.status === 'sending-code'}
            className="btn btn-primary w-full py-4 text-lg"
          >
            {state.status === 'sending-code' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Code...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>📧</span>
                Send Verification Code
              </span>
            )}
          </button>

          <p className="text-xs text-foreground-secondary text-center">
            We&apos;ll send a 6-digit code to verify your identity
          </p>
        </form>
      )}

      {/* OTP Step */}
      {step === 'code' && (
        <div className="space-y-6 fade-in">
          {/* Email Confirmation */}
          <div className="p-4 rounded-xl bg-solana-teal/10 border border-solana-teal/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Code sent to</p>
                <p className="font-medium">{email}</p>
              </div>
              <button
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']) }}
                className="text-sm text-solana-teal hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-4 text-center">
              Enter 6-digit code
            </label>
            <div
              className="flex justify-center gap-2 sm:gap-3"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl bg-background-secondary border-2 border-white/10 focus:border-solana-teal focus:outline-none transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyCode(otp.join(''))}
            disabled={loading || otp.some(d => d === '')}
            className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>✅</span>
                Verify & Login
              </span>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-foreground-secondary">
                Resend code in <span className="text-solana-teal font-mono">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-solana-teal hover:underline"
              >
                Didn&apos;t receive code? Resend
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-foreground-secondary">
          <span className="flex items-center gap-1">
            <span className="text-solana-teal">◎</span> Solana
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="text-violet-accent">🔐</span> Privy
          </span>
        </div>
      </div>
    </div>
  )
}
