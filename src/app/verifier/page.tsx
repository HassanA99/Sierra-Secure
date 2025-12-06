"use client"
import React, { useState } from 'react'
import VerifierDashboard from '@/components/dashboard/VerifierDashboard'

/**
 * Verifier Dashboard - Web3.5 Document Verification
 * 
 * NCRA/Police staff quickly verify document status
 * 
 * Features:
 * - Simple ID number or QR code input
 * - Big, clear VALID/INVALID status  
 * - Show document details and verification history
 * - Blockchain attestation verification
 * - NO JARGON - just "Verified" or "Not Found"
 */
export default function VerifierPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <VerifierDashboard />
    </main>
  )
}
