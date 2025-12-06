"use client"
import React from 'react'
import Link from 'next/link'
import DocumentList from '@/components/dashboard/DocumentList' // Reusing for now, but ideally should be a table
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export default function DashboardPage() {
  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="gradient-orb gradient-orb-1 opacity-20" />
        <div className="gradient-orb gradient-orb-2 opacity-20" />
      </div>

      <div className="max-w-5xl mx-auto space-y-12">

        {/* Action Section (Central Widget) */}
        <section className="text-center space-y-8 py-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Republic of <span className="gradient-text">Sierra Leone</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground-secondary">
            National Digital Document Vault
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Securely upload, verify, and share your official documents with government-backed blockchain immutability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard/upload"
              className="group relative px-8 py-4 bg-solana-teal text-background font-bold text-lg rounded-xl shadow-lg shadow-solana-teal/20 hover:shadow-solana-teal/40 transition-all hover:-translate-y-1"
            >
              <span className="absolute inset-0 rounded-xl bg-white/20 animate-pulse group-hover:animate-none" />
              <span className="relative flex items-center gap-3">
                <span>📤</span> Upload New Document
              </span>
            </Link>

            <Link
              href="/dashboard/share"
              className="px-8 py-4 bg-background-secondary border border-white/10 text-foreground font-semibold text-lg rounded-xl hover:bg-white/5 transition-all hover:-translate-y-1 flex items-center gap-3"
            >
              <span>🔗</span> Share Documents
            </Link>
          </div>
        </section>

        {/* Recent Activity / Quick Summary */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Documents</h2>
            <Link href="/dashboard/vault" className="text-solana-teal hover:underline text-sm">
              View All &rarr;
            </Link>
          </div>

          {/* Reusing DocumentList for now, but limiting items if possible or just showing it */}
          {/* In a real implementation, we'd pass a 'limit' prop or use a specific 'RecentDocumentsTable' component */}
          <div className="glass-card p-6">
            <DocumentList />
          </div>
        </section>

      </div>
    </div>
  )
}
