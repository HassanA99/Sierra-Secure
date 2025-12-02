/**
 * Auth utilities - token management and verification
 */

export const authUtils = {
  /**
   * Extract JWT token from Authorization header
   */
  extractToken: (authHeader: string | null): string | null => {
    if (!authHeader?.startsWith('Bearer ')) return null
    return authHeader.substring(7)
  },

  /**
   * Get auth headers for API calls
   */
  getAuthHeaders: (token?: string | null, userId?: string | null): Record<string, string> => {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (userId) headers['x-user-id'] = userId
    return headers
  },

  /**
   * Store auth credentials in localStorage (client-side only)
   */
  storeCredentials: (token: string, userId: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('nddv_token', token)
    localStorage.setItem('nddv_user_id', userId)
  },

  /**
   * Retrieve auth credentials from localStorage
   */
  getCredentials: (): { token: string | null; userId: string | null } => {
    if (typeof window === 'undefined') return { token: null, userId: null }
    return {
      token: localStorage.getItem('nddv_token'),
      userId: localStorage.getItem('nddv_user_id'),
    }
  },

  /**
   * Clear auth credentials from localStorage
   */
  clearCredentials: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('nddv_token')
    localStorage.removeItem('nddv_user_id')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return Boolean(localStorage.getItem('nddv_token'))
  },
}
