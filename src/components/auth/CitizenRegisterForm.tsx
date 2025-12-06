"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginWithEmail } from '@privy-io/react-auth'

export default function CitizenRegisterForm() {
  const router = useRouter()
  const { sendCode, loginWithCode, state } = useLoginWithEmail()

  const [step, setStep] = useState<'form' | 'code'>('form')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [nin, setNin] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !firstName || !lastName || !nin) {
      setError('Please fill all required fields')
      return
    }

    try {
      await sendCode({ email })
      setStep('code')
    } catch (err: any) {
      setError(err?.message || 'Failed to send code')
    }
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await loginWithCode({ code })
      // loginWithCode's onComplete will have set the Privy session; call backend register
      // result may not include id here; rely on usePrivy user in app. We'll send minimal payload

      const payload = { email, firstName, lastName, phone, nin, privyUserId: (result as any)?.id }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Stored cookie set by API; redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Create your account</h2>
      {error && <div className="mb-4 text-sm text-error">{error}</div>}

      {step === 'form' && (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm">NIN</label>
            <input value={nin} onChange={(e) => setNin(e.target.value)} className="input w-full" />
          </div>

          <div>
            <button type="submit" className="btn btn-primary w-full">Send verification code</button>
          </div>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm">Verification code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="input w-full" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? 'Verifying...' : 'Verify & Create Account'}</button>
          </div>
        </form>
      )}
    </div>
  )
}
