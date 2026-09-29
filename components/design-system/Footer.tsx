'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import CookieSettingsButton from '@/components/privacy/CookieSettingsButton'
import LanguageSwitch from '@/components/design-system/LanguageSwitch'
import './footer.css'

const footerGroups = [
  {
    title: 'Explore',
    links: [
      { label: 'All Colleges', href: '/colleges' },
      { label: 'Admissions Open', href: '/admissions' },
      { label: 'Compare Colleges', href: '/compare' },
      { label: 'Academic Programs', href: '/programs' },
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'News & Guides', href: '/news' },
    ],
  },
  {
    title: 'Results & Notices',
    links: [
      { label: 'TU Results', href: '/results?university=TU' },
      { label: 'KU Results', href: '/results?university=KU' },
      { label: 'NEB Results', href: '/results?university=NEB' },
      { label: 'University Notices', href: '/notices' },
      { label: 'CTEVT Notices', href: '/notices?university=CTEVT' },
      { label: 'Entrance Exams', href: '/entrance-exams' },
    ],
  },
  {
    title: 'Student Tools',
    links: [
      { label: 'GPA Calculator', href: '/tools/gpa-calculator' },
      { label: 'Cost Calculator', href: '/tools/college-cost-calculator' },
      { label: 'Career Explorer', href: '/careers' },
      { label: 'Admission Planner', href: '/admissions/planner' },
      { label: 'Study Resources', href: '/study-resources' },
      { label: 'Student Wellbeing', href: '/wellbeing' },
    ],
  },
  {
    title: 'Institutions',
    links: [
      { label: 'Institution Dashboard', href: '/account/institutions' },
      { label: 'Claim an Institution', href: '/account/claim' },
      { label: 'Submit a College', href: '/submit-college' },
      { label: 'Editorial Policy', href: '/about/editorial-policy' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
]

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <path
        fill="currentColor"
        d="M6.8 10.3h2.4v7H6.8v-7Zm4 0h2.3v1c.7-.9 1.6-1.3 2.8-1.3 2.1 0 3.3 1.3 3.3 4v3.3h-2.4v-3.1c0-1.5-.5-2.2-1.6-2.2-1.3 0-2 1-2 2.7v2.6h-2.4v-7Z"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.95a9.3 9.3 0 0 1 2.5.34c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92v2.78c0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  )
}

function BrandSymbol() {
  return (
    <span className="brand-symbol" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="#ffffff" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="#ffffff" opacity="0.8" />
      </svg>
    </span>
  )
}

export default function Footer() {
  const footerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      footer.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add('is-visible')
          observer.disconnect()
        }
      },
      {
        threshold: 0.08,
      }
    )

    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()

    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    element.style.setProperty('--mouse-x', `${x}%`)
    element.style.setProperty('--mouse-y', `${y}%`)
  }

  const resetPointerGlow = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--mouse-x', '50%')
    event.currentTarget.style.setProperty('--mouse-y', '0%')
  }

  return (
    <footer className="kexsio-footer-page" aria-label="Site footer">
      {/* ── Top CTA Spotlight Section ──────────────────────────── */}
      <section
        className="cta-section"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointerGlow}
      >
        <div className="cta-noise" />
        <div className="ambient-glow" />
        <div className="moving-light moving-light-one" />
        <div className="moving-light moving-light-two" />

        <div className="cta-content">
          <h1>Ready to plan your education in Nepal?</h1>

          <p>
            Explore 1,200+ accredited institutions, 450+ academic programs,
            official university notices and verified gazette fee structures.
          </p>

          <Link href="/colleges" className="primary-button group">
            <span>
              Explore for free
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <span className="button-shine" />
          </Link>
        </div>
      </section>

      {/* ── Section Divider Bar ───────────────────────────────── */}
      <div className="section-divider" />

      {/* ── Main Footer Area ─────────────────────────────────── */}
      <section className="footer-area" id="kexsio-footer">
        <div className="footer-glow footer-glow-left" />
        <div className="footer-glow footer-glow-right" />

        <div className="footer-card" ref={footerRef}>
          <div className="footer-top">
            {/* Left Brand Column */}
            <div className="brand-column">
              <Link href="/" className="brand">
                <BrandSymbol />
                <span className="font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ShikshyaX<span className="text-primary dark:text-[#CAFFA6]">Nepal</span>
                </span>
              </Link>

              <p className="brand-description">
                An independent, public directory of colleges, programs, entrance examinations and
                official board notices across Nepal. Always 100% free for students and educators.
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary dark:text-[#CAFFA6]" />
                  <span>Kathmandu, Nepal · 7 Provinces Covered</span>
                </div>
                <Link href="/contact" className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-primary dark:text-[#CAFFA6]" />
                  <span>Editorial &amp; Verification Desk</span>
                </Link>
              </div>

              <div className="social-links">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className="social-link">
                  <XIcon />
                </a>

                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                  <InstagramIcon />
                </a>

                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link">
                  <LinkedinIcon />
                </a>

                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-link">
                  <GithubIcon />
                </a>
              </div>
            </div>

            {/* Right Navigation Columns */}
            <div className="navigation-columns">
              {footerGroups.map((group) => (
                <div className="link-column" key={group.title}>
                  <h2>{group.title}</h2>

                  <nav>
                    {group.links.map((link) => (
                      <Link href={link.href} key={link.label}>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-line" />

          {/* Footer Bottom Bar */}
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} ShikshyaXNepal. Made for Nepal&apos;s students &amp; educators.</p>

            <div className="legal-links">
              <Link href="/about/editorial-policy">Editorial policy</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/community/guidelines">Community rules</Link>
              <Link href="/safety">Safety</Link>
              <Link href="/cookies">Cookies</Link>
              <CookieSettingsButton />
              <LanguageSwitch />
            </div>
          </div>
        </div>

        {/* Giant Subtle Background Watermark */}
        <div className="giant-word" aria-hidden="true">
          SHIKSHYAXNEPAL
        </div>
      </section>
    </footer>
  )
}
