'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to manage authentication state from localStorage
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setToken(localStorage.getItem('nddv_token'))
    setUserId(localStorage.getItem('nddv_user_id'))
    setLoading(false)
  }, [])

  const logout = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('nddv_token')
    localStorage.removeItem('nddv_user_id')
    setToken(null)
    setUserId(null)
  }

  const login = (token: string, userId: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('nddv_token', token)
    localStorage.setItem('nddv_user_id', userId)
    setToken(token)
    setUserId(userId)
  }

  return { token, userId, loading, login, logout, isAuthenticated: Boolean(token) }
}
