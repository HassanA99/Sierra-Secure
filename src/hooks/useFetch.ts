'use client'

/**
 * Custom hook for making authenticated API calls with token and user ID
 */
export function useFetch() {
  async function fetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
    const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) headers['Authorization'] = `Bearer ${token}`
    if (userId) headers['x-user-id'] = userId
    if (!options.method || options.method === 'POST' || options.method === 'PUT') {
      headers['Content-Type'] = 'application/json'
    }

    const res = await globalThis.fetch(url, { ...options, headers })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  return { fetch }
}
