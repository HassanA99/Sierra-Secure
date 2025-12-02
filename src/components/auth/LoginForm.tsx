"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [privyUserId, setPrivyUserId] = useState('')
  const [email, setEmail] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!privyUserId) return setError('Privy user id required for local testing')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privyUserId, email, walletAddress, displayName: email }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Login failed')
        return
      }

      // store token and user id
      if (typeof window !== 'undefined') {
        localStorage.setItem('nddv_token', body.token)
        if (body.user?.id) localStorage.setItem('nddv_user_id', body.user.id)
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Developer Login (local)</h2>

      <div className="mb-3">
        <label className="block text-sm">Privy User ID</label>
        <input value={privyUserId} onChange={(e) => setPrivyUserId(e.target.value)} className="mt-1 w-full border rounded p-2" placeholder="privy_user_123" />
      </div>

      <div className="mb-3">
        <label className="block text-sm">Email (optional)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded p-2" placeholder="dev@example.com" />
      </div>

      <div className="mb-3">
        <label className="block text-sm">Wallet Address (optional)</label>
        <input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="mt-1 w-full border rounded p-2" placeholder="Solana wallet address" />
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
      </div>
    </form>
  )
}
