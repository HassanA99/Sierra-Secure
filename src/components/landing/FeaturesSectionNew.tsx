'use client'

import { useState } from 'react'

export function FeaturesSectionNew() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const features = [
    {
      icon: '🆔',
      title: 'Identity Documents',
      description: 'Store your birth certificate, national ID, passport, and other identity documents safely.',
      benefits: [
        'Government verified',
        'Cannot be lost or damaged',
        'Access from anywhere',
        'Share securely when needed',
      ],
      color: 'green',
    },
    {
      icon: '🏠',
      title: 'Property Documents',
      description: 'Keep your land titles, property deeds, and ownership documents protected forever.',
      benefits: [
        'Permanent ownership record',
        'Transfer to family easily',
        'Government sealed',
        'Protected from fraud',
      ],
      color: 'blue',
    },
    {
      icon: '🎓',
      title: 'Certificates & Licenses',
      description: 'Store academic certificates, professional licenses, and qualifications securely.',
      benefits: [
        'Always accessible',
        'Verified by authorities',
        'Share with employers',
        'Never expires digitally',
      ],
      color: 'white',
    },
  ]

  return (
    <section id="features" className="py-12 sm:py-16 md:py-24 relative overflow-hidden bg-background-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Everything You Need to</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--sl-green)] to-[var(--sl-blue)] bg-clip-text text-transparent">
              Protect Your Documents
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Simple, secure, and free for all Sierra Leone citizens.
          </p>
        </div>

        {/* Features Grid - Mobile First */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 sm:p-8 rounded-2xl border-2 transition-all cursor-pointer ${
                activeFeature === index
                  ? feature.color === 'green'
                    ? 'border-[var(--sl-green)] bg-[var(--sl-green)]/10 shadow-lg shadow-[var(--sl-green)]/20'
                    : feature.color === 'blue'
                    ? 'border-[var(--sl-blue)] bg-[var(--sl-blue)]/10 shadow-lg shadow-[var(--sl-blue)]/20'
                    : 'border-white bg-white/10 shadow-lg shadow-white/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
              onClick={() => setActiveFeature(activeFeature === index ? null : index)}
            >
              {/* Icon */}
              <div className="text-5xl sm:text-6xl mb-4">{feature.icon}</div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 mb-6">
                {feature.description}
              </p>

              {/* Benefits - Show when active */}
              {activeFeature === index && (
                <div className="space-y-3 fade-in">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`text-lg ${
                        feature.color === 'green'
                          ? 'text-[var(--sl-green)]'
                          : feature.color === 'blue'
                          ? 'text-[var(--sl-blue)]'
                          : 'text-white'
                      }`}>
                        ✓
                      </span>
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Click Indicator */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                {activeFeature === index ? 'Tap to close' : 'Tap for details'}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works - Simple Steps */}
        <div className="mt-16 sm:mt-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-white">
            How It Works
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-4">
            {[
              { step: 1, icon: '📤', title: 'Upload', desc: 'Add your document' },
              { step: 2, icon: '🔍', title: 'Verify', desc: 'We check it\'s real' },
              { step: 3, icon: '✅', title: 'Approve', desc: 'Government confirms' },
              { step: 4, icon: '🔒', title: 'Secure', desc: 'Stored safely' },
              { step: 5, icon: '📱', title: 'Access', desc: 'Use anytime' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${
                    index % 2 === 0
                      ? 'bg-[var(--sl-green)]/20 border-2 border-[var(--sl-green)]'
                      : 'bg-[var(--sl-blue)]/20 border-2 border-[var(--sl-blue)]'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center text-xs sm:text-sm font-bold">
                    {item.step}
                  </div>
                </div>

                {/* Labels */}
                <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-400">{item.desc}</p>

                {/* Connector Arrow - Hidden on mobile, shown on desktop */}
                {index < 4 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full">
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

