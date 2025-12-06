"use client"
import React, { useState } from 'react'
import MakerDashboard from '@/components/dashboard/MakerDashboardFixed'

/**
 * Maker Dashboard
 * 
 * Government staff issues digital documents and reviews forensic analysis
 * 
 * Features:
 * - Issue new Birth Certificates, Land Titles, etc.
 * - View Audit Queue (documents with 70-84 forensic score)
 * - Approve or reject documents for blockchain
 * - Add comments when rejecting
 * - NO CRYPTO - just "issue" and "approve"
 */
export default function MakerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <MakerDashboard />
    </div>
  )
}
