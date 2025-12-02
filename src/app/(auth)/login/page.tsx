"use client"
import React, { useState } from 'react'
import CitizenLoginForm from '@/components/auth/CitizenLoginForm'
import StaffLoginForm from '@/components/auth/StaffLoginForm'

export default function LoginPage() {
  const [userType, setUserType] = useState<'citizen' | 'staff' | null>(null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      {/* Login Type Selection */}
      {userType === null && (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Digital Document Vault
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Secure government document management system
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('citizen')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <div className="text-2xl mb-2">🏛️</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Citizen
              </h2>
              <p className="text-sm text-gray-600">
                Access your personal documents
              </p>
            </button>

            <button
              onClick={() => setUserType('staff')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <div className="text-2xl mb-2">👔</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Government Staff
              </h2>
              <p className="text-sm text-gray-600">
                Verify or issue documents
              </p>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 text-center">
            <p>All interactions are secure and encrypted</p>
          </div>
        </div>
      )}

      {/* Citizen Login Form */}
      {userType === 'citizen' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setUserType(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            ← Back
          </button>
          <CitizenLoginForm />
        </div>
      )}

      {/* Staff Login Form */}
      {userType === 'staff' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setUserType(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            ← Back
          </button>
          <StaffLoginForm />
        </div>
      )}
    </main>
  )
}
