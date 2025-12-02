"use client"
import React from 'react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block" role="navigation" aria-label="Dashboard sidebar">
      <div className="mb-6">
        <div className="font-semibold">Navigation</div>
      </div>
      <nav className="space-y-2 text-sm">
        <div>
          <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2">Overview</Link>
        </div>
        <div>
          <Link href="/dashboard#documents" className="block px-2 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2">Documents</Link>
        </div>
        <div>
          <Link href="/dashboard#forensic" className="block px-2 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2">Forensic</Link>
        </div>
        <div>
          <Link href="/dashboard#blockchain" className="block px-2 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2">Blockchain</Link>
        </div>
      </nav>
    </aside>
  )
}
