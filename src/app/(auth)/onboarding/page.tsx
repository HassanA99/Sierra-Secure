import React from 'react'

export const metadata = {
  title: 'Onboarding — NDDV'
}

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="mt-2 text-sm text-gray-600">Onboarding flow will be implemented here. For now, proceed to the dashboard after login.</p>
      </div>
    </main>
  )
}
