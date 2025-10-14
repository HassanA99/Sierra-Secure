'use client'

import { useLogout, usePrivy } from '@privy-io/react-auth'

export function LogoutButton() {
  const { logout } = useLogout()
  const { authenticated, ready } = usePrivy()

  if (!ready || !authenticated) {
    return null
  }

  return (
    <button
      onClick={logout}
      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Disconnect
    </button>
  )
}