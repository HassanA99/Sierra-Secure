'use client'

export function SecuritySectionNew() {
  const securityFeatures = [
    {
      icon: '🛡️',
      title: 'Government Protected',
      description: 'Your documents are verified and protected by the Government of Sierra Leone.',
      color: 'green',
    },
    {
      icon: '🔐',
      title: 'Always Secure',
      description: 'Advanced protection ensures your documents cannot be lost, stolen, or tampered with.',
      color: 'blue',
    },
    {
      icon: '👁️',
      title: 'Smart Verification',
      description: 'Automatic checks ensure your documents are authentic and valid.',
      color: 'white',
    },
    {
      icon: '📱',
      title: 'Access Anywhere',
      description: 'View and share your documents from your phone or computer, anytime.',
      color: 'green',
    },
  ]

  return (
    <section id="security" className="py-12 sm:py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Your Documents Are</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--sl-green)] to-[var(--sl-blue)] bg-clip-text text-transparent">
              Safe With Us
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Built with the highest security standards to protect what matters most to you.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-6 sm:p-8 rounded-2xl border-2 ${
                feature.color === 'green'
                  ? 'border-[var(--sl-green)]/30 bg-[var(--sl-green)]/5'
                  : feature.color === 'blue'
                  ? 'border-[var(--sl-blue)]/30 bg-[var(--sl-blue)]/5'
                  : 'border-white/20 bg-white/5'
              } hover:scale-105 transition-transform`}
            >
              <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison - Simple Language */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Old Way */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-red-500/30 bg-red-500/5">
            <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <span>📜</span> Paper Documents
            </h3>
            <ul className="space-y-3">
              {[
                'Can be lost or damaged',
                'Easy to fake or alter',
                'Need physical storage',
                'Slow to verify',
                'One copy only',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* New Way */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-[var(--sl-green)]/50 bg-[var(--sl-green)]/10">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--sl-green)] mb-6 flex items-center gap-2">
              <span>🛡️</span> Digital Vault
            </h3>
            <ul className="space-y-3">
              {[
                'Cannot be lost or destroyed',
                'Protected from tampering',
                'Access from anywhere',
                'Instant verification',
                'Multiple secure backups',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <span className="text-[var(--sl-green)] mt-1">✓</span>
                  <span className="text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

