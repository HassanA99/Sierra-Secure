"use client"
import React, { useState } from 'react'
import VerifierDashboard from '@/components/dashboard/VerifierDashboard'

/**
 * Verifier Dashboard
 * 
 * Bank/Police staff quickly verify document status
 * 
 * Features:
 * - Simple ID number or QR code input
 * - Big, clear VALID/INVALID status
 * - Show document details and last verification time
 * - NO BLOCKCHAIN JARGON - just "valid" or "not found"
 */
export default function VerifierPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <VerifierDashboard />
    </div>
  )
}
