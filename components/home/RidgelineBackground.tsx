'use client'

import { useEffect, useState, useRef } from 'react'

export default function RidgelineBackground() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion or mobile screens
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.innerWidth < 768
    ) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      // Normalize from -1 to 1
      const normalizedX = (e.clientX / innerWidth - 0.5) * 2
      const normalizedY = (e.clientY / innerHeight - 0.5) * 2
      setParallax({ x: normalizedX, y: normalizedY })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ── 1. Soft Aurora Glows (Slow 24-32s drift) ────────── */}
      <div
        className="hero-aurora-glow-1 absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[740px] rounded-full blur-[100px] opacity-40 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(191, 227, 240, 0.45) 0%, rgba(31, 78, 95, 0.15) 50%, transparent 70%)',
        }}
      />
      <div
        className="hero-aurora-glow-2 absolute top-10 left-1/3 -translate-x-1/2 h-[380px] w-[580px] rounded-full blur-[90px] opacity-30 dark:opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(245, 165, 36, 0.25) 0%, rgba(191, 227, 240, 0.1) 60%, transparent 80%)',
        }}
      />

      {/* ── 2. Three-Layer Himalayan Ridgeline Silhouettes ───── */}
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 pointer-events-none">
        {/* Layer 1: Distant Snowy Peaks (Back - max 4px parallax) */}
        <div
          className="absolute inset-x-0 bottom-0 h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate(${parallax.x * 4}px, ${parallax.y * 2}px)`,
          }}
        >
          <svg
            viewBox="0 0 1440 220"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full text-slate-300/[0.22] dark:text-[#1F4E5F]/[0.18]"
          >
            <path
              d="M0 160L80 130L160 145L250 80L330 115L420 50L510 110L610 35L710 95L820 40L930 100L1030 60L1140 110L1250 50L1350 120L1440 90V220H0V160Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Layer 2: Intermediate High Ridges (Mid - max 8px parallax) */}
        <div
          className="absolute inset-x-0 bottom-0 h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate(${parallax.x * 8}px, ${parallax.y * 4}px)`,
          }}
        >
          <svg
            viewBox="0 0 1440 200"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full text-slate-400/[0.25] dark:text-[#1F4E5F]/[0.25]"
          >
            <path
              d="M0 140L110 110L220 130L340 70L460 115L560 65L680 120L780 75L900 125L1010 85L1130 135L1260 80L1370 120L1440 95V200H0V140Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Layer 3: Rolling Foothills (Front - max 12px parallax, soft gradient fade) */}
        <div
          className="absolute inset-x-0 bottom-0 h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate(${parallax.x * 12}px, ${parallax.y * 6}px)`,
          }}
        >
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full text-slate-500/[0.18] dark:text-[#0C2229]/[0.6]"
          >
            <path
              d="M0 130C180 100 320 135 480 90C640 45 760 110 940 75C1120 40 1280 95 1440 80V180H0V130Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Bottom edge soft fade into page background */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--ground, #fcfeff))',
          }}
        />
      </div>
    </div>
  )
}
