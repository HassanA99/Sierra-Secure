'use client'

import { useEffect, useState, useRef } from 'react'

interface CounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}

function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(end * easeOut))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return (
    <div ref={countRef} className="text-4xl md:text-5xl font-bold gradient-text-animated">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

export function SocialProofSection() {
  const testimonials = [
    {
      quote: "This system changed everything. We can verify documents in seconds instead of weeks.",
      author: "Dr. Sarah Kamara",
      role: "Deputy Minister of Lands",
      avatar: "👩‍💼",
    },
    {
      quote: "The automatic checks help us catch fake documents we might miss. It's very helpful.",
      author: "Mohamed Conteh",
      role: "NCRA Director",
      avatar: "👨‍💼",
    },
    {
      quote: "My family's land documents are safe now. I don't worry about losing them anymore.",
      author: "Fatmata Bangura",
      role: "Citizen, Freetown",
      avatar: "👩",
    },
  ]

  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-secondary/30 via-background to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { value: 10000, suffix: '+', label: 'Documents Secured', icon: '📄' },
            { value: 5000, suffix: '+', label: 'Active Citizens', icon: '👥' },
            { value: 99, suffix: '.9%', label: 'Uptime', icon: '⚡' },
            { value: 0, suffix: '', label: 'Security Breaches', icon: '🛡️' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-6 text-center fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-3xl mb-4 block">{stat.icon}</span>
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
              />
              <p className="text-sm text-foreground-secondary mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
            What People Say
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
            Government officials and citizens trust us with their important documents.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="glass-card p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-4xl opacity-20">❝</div>

            {/* Testimonial Content */}
            <div className="relative z-10">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className={`transition-all duration-500 ${index === activeTestimonial
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                    }`}
                >
                  <p className="text-xl md:text-2xl leading-relaxed mb-8 text-center">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[var(--sl-green)]/30 to-[var(--sl-blue)]/30 flex items-center justify-center text-xl sm:text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-foreground-secondary">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === activeTestimonial
                    ? 'bg-[var(--sl-green)] w-8'
                    : 'bg-white/20 hover:bg-white/40'
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 sm:p-8 md:p-12 rounded-2xl border-2 border-[var(--sl-green)]/30 bg-[var(--sl-green)]/5 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
            Ready to Protect Your Documents?
          </h3>
          <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of citizens who trust us with their important documents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="w-full sm:w-auto px-8 py-4 bg-[var(--sl-green)] hover:bg-[var(--sl-green-dark)] text-white font-semibold rounded-xl transition-all text-center">
              Get Started Free
            </a>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[var(--sl-blue)] text-[var(--sl-blue)] hover:bg-[var(--sl-blue)]/10 font-semibold rounded-xl transition-all text-center">
              Learn More
            </a>
          </div>
          <p className="mt-6 text-xs sm:text-sm text-gray-400">
            Free for all citizens • Government protected • No hidden fees
          </p>
        </div>
      </div>
    </section>
  )
}
