'use client'

import { useState, useEffect } from 'react'

export function SecuritySection() {
  const [scanProgress, setScanProgress] = useState(0)
  const [scanActive, setScanActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setScanActive(true)
        }
      },
      { threshold: 0.3 }
    )

    const section = document.getElementById('security')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (scanActive && scanProgress < 100) {
      const timer = setTimeout(() => {
        setScanProgress((prev) => Math.min(prev + 2, 100))
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [scanActive, scanProgress])

  const securityFeatures = [
    {
      icon: '🔐',
      title: 'Zero-Knowledge Architecture',
      description: 'Your sensitive data never leaves your device unencrypted. We cannot see your documents.',
      color: 'solana-teal',
    },
    {
      icon: '✍️',
      title: 'Multi-Signature Support',
      description: 'High-value documents can require multiple authorized signatures before transfer.',
      color: 'violet',
    },
    {
      icon: '⏰',
      title: 'Time-Based Permissions',
      description: 'Share document access with automatic expiration. You stay in control.',
      color: 'cyan',
    },
    {
      icon: '📝',
      title: 'Immutable Audit Trail',
      description: 'Every access, share, and verification is logged forever on blockchain.',
      color: 'solana-teal',
    },
    {
      icon: '🌍',
      title: 'Geographic Restrictions',
      description: 'Optional IP-based access controls for sensitive documents.',
      color: 'violet',
    },
    {
      icon: '🤖',
      title: 'AI Fraud Detection',
      description: 'Gemini AI analyzes every document for signs of tampering or forgery.',
      color: 'cyan',
    },
  ]

  return (
    <section id="security" className="py-24 relative overflow-hidden bg-background-secondary/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(20, 241, 149, 0.1) 50px,
            rgba(20, 241, 149, 0.1) 51px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-violet-accent/10 border border-violet-accent/30 text-violet-accent text-sm font-medium mb-6">
            🛡️ Enterprise Security
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-violet-accent">AI-Powered</span>{' '}
            <span className="text-foreground">Security</span>
          </h2>
          <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
            Military-grade encryption meets artificial intelligence.
            Every document is scanned, verified, and protected.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* AI Visualization */}
          <div className="relative">
            <div className="glass-card p-8 relative overflow-hidden">
              {/* Scanning Animation */}
              {scanActive && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-accent to-transparent"
                  style={{
                    top: `${scanProgress}%`,
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)',
                    transition: 'top 0.05s linear'
                  }}
                />
              )}

              {/* Document Preview */}
              <div className="bg-background rounded-lg p-6 mb-6 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-solana-teal/20 flex items-center justify-center">
                    📄
                  </div>
                  <div>
                    <p className="font-semibold">Land_Title_2024.pdf</p>
                    <p className="text-sm text-foreground-secondary">Scanning for anomalies...</p>
                  </div>
                </div>

                {/* Fake Document Lines */}
                <div className="space-y-2">
                  {[80, 60, 90, 45, 70].map((width, i) => (
                    <div
                      key={i}
                      className="h-2 rounded skeleton"
                      style={{ width: `${width}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Analysis Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Analysis Progress</span>
                  <span className="text-sm text-solana-teal font-mono">{scanProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>

                {/* Analysis Steps */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { label: 'Metadata Check', status: scanProgress > 20 },
                    { label: 'Image Analysis', status: scanProgress > 40 },
                    { label: 'Text Extraction', status: scanProgress > 60 },
                    { label: 'Fraud Detection', status: scanProgress > 80 },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${step.status
                          ? 'bg-success/10 border border-success/30'
                          : 'bg-white/5 border border-white/10'
                        }`}
                    >
                      {step.status ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 animate-pulse" />
                      )}
                      <span className="text-xs">{step.label}</span>
                    </div>
                  ))}
                </div>

                {/* Final Score */}
                {scanProgress === 100 && (
                  <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30 fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-success font-bold">✓ Document Verified</p>
                        <p className="text-xs text-foreground-secondary">No signs of tampering detected</p>
                      </div>
                      <div className="fraud-score">98%</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-5 hover:scale-105 transition-transform fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-xl ${feature.color === 'solana-teal' ? 'bg-solana-teal/20' :
                    feature.color === 'violet' ? 'bg-violet-accent/20' : 'bg-cyan-400/20'
                  }`}>
                  {feature.icon}
                </div>
                <h4 className="font-bold mb-2 text-sm">{feature.title}</h4>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Encryption Visualization */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-bold mb-6">End-to-End Encryption</h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {/* Your Device */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-solana-teal/20 border border-solana-teal/50 flex items-center justify-center text-3xl">
                📱
              </div>
              <p className="font-medium">Your Device</p>
              <p className="text-xs text-foreground-secondary">Encrypted locally</p>
            </div>

            {/* Arrow with Lock */}
            <div className="flex items-center gap-2">
              <div className="w-16 md:w-32 h-1 bg-gradient-to-r from-solana-teal to-violet-accent rounded" />
              <div className="w-10 h-10 rounded-full bg-background-secondary border border-white/20 flex items-center justify-center">
                🔒
              </div>
              <div className="w-16 md:w-32 h-1 bg-gradient-to-r from-violet-accent to-solana-teal rounded" />
            </div>

            {/* Blockchain */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-violet-accent/20 border border-violet-accent/50 flex items-center justify-center text-3xl">
                ⛓️
              </div>
              <p className="font-medium">Blockchain</p>
              <p className="text-xs text-foreground-secondary">Immutable proof</p>
            </div>

            {/* Arrow with Lock */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 h-1 bg-gradient-to-r from-solana-teal to-violet-accent rounded" />
              <div className="w-10 h-10 rounded-full bg-background-secondary border border-white/20 flex items-center justify-center">
                🔒
              </div>
              <div className="w-32 h-1 bg-gradient-to-r from-violet-accent to-solana-teal rounded" />
            </div>

            {/* Arweave */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center text-3xl">
                ☁️
              </div>
              <p className="font-medium">Arweave</p>
              <p className="text-xs text-foreground-secondary">Permanent storage</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-foreground-secondary max-w-2xl mx-auto">
            Your documents are encrypted on your device before upload. Only you hold the decryption keys.
            We store encrypted blobs - we literally cannot read your files.
          </p>
        </div>
      </div>
    </section>
  )
}
