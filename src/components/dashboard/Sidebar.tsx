"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/vault', label: 'My Vault', icon: '🗄️' },
    { href: '/dashboard/upload', label: 'Upload Documents', icon: '📤' },
    { href: '/dashboard/share', label: 'Share Documents', icon: '🔗' },
    { href: '/dashboard/logs', label: 'Audit Logs', icon: '📜' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-background-secondary border-r border-white/10 min-h-screen p-4 hidden md:flex flex-col" role="navigation" aria-label="Dashboard sidebar">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <img src="/NDDV_logo.png" alt="NDDV" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold gradient-text">NDDV</span>
        </div>
        <p className="text-xs text-foreground-secondary mt-1">Secure Workspace</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-solana-teal/10 text-solana-teal border border-solana-teal/20'
                : 'text-foreground-secondary hover:text-foreground hover:bg-white/5'
                }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-2 py-4 border-t border-white/10">
        <div className="text-xs text-foreground-secondary">
          <p>Government Verified</p>
          <p className="mt-1 opacity-50">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
