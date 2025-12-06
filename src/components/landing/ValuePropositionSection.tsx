'use client'

import { useState } from 'react'

const features = [
  {
    id: 'nft',
    title: 'NFT Land Titles',
    subtitle: 'Ownership Documents',
    icon: '🏠',
    color: 'solana-teal',
    description: 'Your verified documents become government-sealed NFTs minted on Solana blockchain.',
    benefits: [
      { icon: '✓', text: 'Permanent ownership that cannot be revoked' },
      { icon: '✓', text: 'Transferable to heirs automatically' },
      { icon: '✓', text: 'Government verified & sealed' },
      { icon: '✓', text: '200+ years guaranteed storage' },
    ],
    technical: 'Metaplex NFT Standard on Solana',
    useCases: ['Land Titles', 'Property Deeds', 'Vehicle Registration', 'IP Rights'],
  },
  {
    id: 'sas',
    title: 'SAS Attestations',
    subtitle: 'Identity Documents',
    icon: '🆔',
    color: 'violet',
    description: 'Blockchain-signed government attestations prove document authenticity forever.',
    benefits: [
      { icon: '✓', text: 'Cryptographically signed proof' },
      { icon: '✓', text: 'Immutable on-chain record' },
      { icon: '✓', text: 'Verifiable by anyone, anywhere' },
      { icon: '✓', text: 'Revocable only by issuing authority' },
    ],
    technical: 'Solana Attestation Service (SAS)',
    useCases: ['Birth Certificates', 'National IDs', 'Passports', 'Academic Degrees'],
  },
  {
    id: 'arweave',
    title: 'Arweave Storage',
    subtitle: 'Permanent Files',
    icon: '☁️',
    color: 'cyber',
    description: 'Encrypted documents stored permanently on decentralized storage. Pay once, store forever.',
    benefits: [
      { icon: '✓', text: 'AES-256 military-grade encryption' },
      { icon: '✓', text: '200+ years permanent storage' },
      { icon: '✓', text: 'No monthly subscription fees' },
      { icon: '✓', text: 'Decentralized global backup' },
    ],
    technical: 'Arweave Permaweb Storage',
    useCases: ['All Document Types', 'Scanned Originals', 'Legal Documents', 'Photos'],
  },
]

export function ValuePropositionSection() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background-secondary/30 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-solana-teal/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-accent/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full bg-solana-teal/10 border border-solana-teal/30 text-solana-teal text-sm font-medium mb-6">
            🔗 Blockchain Technology
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Blockchain Ownership.</span>
            <br />
            <span className="text-foreground">Forever.</span>
          </h2>
          <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
            Every verified document becomes an immutable asset on Solana blockchain.
            You own it. You control it. No one can revoke it.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`holo-card cursor-pointer transition-all duration-500 ${activeCard === feature.id ? 'scale-105 z-20' : 'hover:scale-102'
                }`}
              onClick={() => setActiveCard(activeCard === feature.id ? null : feature.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`doc-icon doc-icon-${feature.id === 'nft' ? 'land' : feature.id === 'sas' ? 'id' : 'certificate'}`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <span className={`badge ${feature.color === 'solana-teal' ? 'badge-blockchain' :
                    feature.color === 'violet' ? 'badge-ai' : 'badge-info'
                  }`}>
                  {feature.subtitle}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className={`text-2xl font-bold mb-3 ${feature.color === 'solana-teal' ? 'text-solana-teal' :
                  feature.color === 'violet' ? 'text-violet-accent' : 'text-cyan-400'
                }`}>
                {feature.title}
              </h3>
              <p className="text-foreground-secondary mb-6">
                {feature.description}
              </p>

              {/* Benefits List */}
              <ul className="space-y-3 mb-6">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`${feature.color === 'solana-teal' ? 'text-solana-teal' :
                        feature.color === 'violet' ? 'text-violet-accent' : 'text-cyan-400'
                      } font-bold`}>
                      {benefit.icon}
                    </span>
                    <span className="text-sm text-foreground-secondary">{benefit.text}</span>
                  </li>
                ))}
              </ul>

              {/* Expandable Content */}
              {activeCard === feature.id && (
                <div className="mt-6 pt-6 border-t border-white/10 fade-in">
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-3">
                    Use Cases
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feature.useCases.map((useCase) => (
                      <span
                        key={useCase}
                        className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    <span className="opacity-50">Technology:</span>{' '}
                    <span className="font-mono">{feature.technical}</span>
                  </p>
                </div>
              )}

              {/* Expand Indicator */}
              <div className="mt-4 text-center">
                <span className="text-xs text-foreground-secondary">
                  {activeCard === feature.id ? 'Click to collapse' : 'Click for details'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Document Flow Visualization */}
        <div className="glass-card p-8 md:p-12">
          <h3 className="text-xl font-bold text-center mb-8">How It Works</h3>

          {/* Flow Steps */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
            {[
              { step: 1, icon: '📄', title: 'Upload', desc: 'Submit your document' },
              { step: 2, icon: '🤖', title: 'AI Analysis', desc: 'Gemini detects fraud' },
              { step: 3, icon: '✅', title: 'Verify', desc: 'Government approval' },
              { step: 4, icon: '⛓️', title: 'Mint', desc: 'NFT or Attestation' },
              { step: 5, icon: '🔒', title: 'Secured', desc: 'Forever on blockchain' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-2 md:gap-0 md:flex-col">
                {/* Step Circle */}
                <div className="relative">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl ${index % 2 === 0
                      ? 'bg-solana-teal/10 border-2 border-solana-teal/50'
                      : 'bg-violet-accent/10 border-2 border-violet-accent/50'
                    }`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background-secondary border border-white/20 flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                </div>

                {/* Arrow (hidden on last item) */}
                {index < 4 && (
                  <svg className="w-8 h-8 text-solana-teal/50 hidden md:block mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}

                {/* Labels */}
                <div className="md:text-center md:mt-4">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-foreground-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-center mb-8">Paper vs Blockchain</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Paper Column */}
            <div className="glass-card p-6 border-error/30">
              <h4 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                <span>📜</span> Traditional Paper
              </h4>
              <ul className="space-y-3">
                {[
                  'Can be lost in fire or flood',
                  'Easily forged or altered',
                  'Requires physical storage',
                  'Slow verification process',
                  'Single point of failure',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground-secondary">
                    <span className="text-error">✗</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blockchain Column */}
            <div className="holo-card p-6">
              <h4 className="text-lg font-bold text-solana-teal mb-4 flex items-center gap-2">
                <span>⛓️</span> NDDV Blockchain
              </h4>
              <ul className="space-y-3">
                {[
                  'Permanent, cannot be destroyed',
                  'Cryptographically tamper-proof',
                  'Accessible from anywhere',
                  'Instant verification',
                  'Decentralized redundancy',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground-secondary">
                    <span className="text-solana-teal">✓</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
