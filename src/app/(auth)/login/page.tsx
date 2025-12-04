"use client"
import React, { useState } from 'react'
import CitizenLoginForm from '@/components/auth/CitizenLoginForm'
import StaffLoginForm from '@/components/auth/StaffLoginForm'

export default function LoginPage() {
  const [userType, setUserType] = useState<'citizen' | 'staff' | null>(null)

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Login Type Selection */}
      {userType === null && (
        <div className="w-full max-w-md card fade-in">
          <div className="mb-8 text-center">
            <h1 className="gradient-text text-4xl font-bold mb-4">NDDV</h1>
            <div className="neon-line mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">National Digital Document Vault</h2>
            <span className="text-sm text-gray-400">Secure blockchain-verified document management</span>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('citizen')}
              className="w-full btn btn-primary p-6 rounded-12 text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-lg font-semibold mb-2">Citizen Portal</h3>
              <span className="text-sm opacity-80">Access your personal documents</span>
            </button>

            <button
              onClick={() => setUserType('staff')}
              className="w-full btn btn-secondary p-6 rounded-12 text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">👔</div>
              <h3 className="text-lg font-semibold mb-2">Government Staff</h3>
              <span className="text-sm opacity-80">Verify or issue documents</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-top text-center">
            <span className="text-xs text-gray-500">All interactions are encrypted and secure</span>
          </div>
        </div>
      )}

      {/* Citizen Login Form */}
      {userType === 'citizen' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setUserType(null)}
            className="mb-4 text-primary hover:text-primary-dark text-sm font-medium flex items-center transition-colors"
          >
            ← Back to Login Selection
          </button>
          <CitizenLoginForm />
        </div>
      )}

      {/* Staff Login Form */}
      {userType === 'staff' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setUserType(null)}
            className="mb-4 text-primary hover:text-primary-dark text-sm font-medium flex items-center transition-colors"
          >
            ← Back to Login Selection
          </button>
          <StaffLoginForm />
        </div>
      )}
    </main>
  )
}

