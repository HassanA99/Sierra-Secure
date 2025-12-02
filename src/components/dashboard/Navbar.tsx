"use client"
"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    setLoggedIn(Boolean(localStorage.getItem('nddv_token')))
  }, [])

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nddv_token')
      localStorage.removeItem('nddv_user_id')
    }
    setLoggedIn(false)
    router.push('/login')
  }

  return (
    <header className="bg-white shadow" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-bold">NDDV</div>
          <nav aria-label="Main navigation" className="hidden sm:flex space-x-2 text-sm text-gray-600">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/documents" className="hover:underline">Documents</Link>
            <Link href="/forensic" className="hover:underline">Forensic</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {!loggedIn ? (
            <Link href="/login" className="text-sm px-3 py-1 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-300">Login</Link>
          ) : (
            <button onClick={handleLogout} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Logout</button>
          )}
        </div>
      </div>
    </header>
  )
}
