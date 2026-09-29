'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search, ArrowRight } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'
import AccountButton from '@/components/auth/AccountButton'
import ThemeToggle from '@/components/theme/ThemeToggle'

type NavigationItem = { label: string; href: string; group?: string; description?: string }
type NavigationLink = { label: string; href: string; sub?: NavigationItem[] }

const navLinks: NavigationLink[] = [
  {
    label: 'Colleges',
    href: '/colleges',
    sub: [
      { label: 'All colleges', href: '/colleges' },
      { label: '+2 colleges', href: '/colleges?level=%2B2' },
      { label: 'Bachelor colleges', href: '/colleges?level=bachelor' },
      { label: 'Master colleges', href: '/colleges?level=master' },
      { label: 'Compare colleges', href: '/compare' },
      { label: 'Cost calculator', href: '/tools/college-cost-calculator' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    sub: [
      { label: 'All programs', href: '/programs' },
      { label: 'IT & Computing', href: '/programs?faculty=it' },
      { label: 'Engineering', href: '/programs?faculty=engineering' },
      { label: 'Management', href: '/programs?faculty=management' },
      { label: 'Medical', href: '/programs?faculty=medical' },
      { label: 'What should I study?', href: '/tools/program-finder' },
    ],
  },
  {
    label: 'Admissions',
    href: '/admissions',
    sub: [
      { label: 'Open admissions', href: '/admissions?deadline=open' },
      { label: 'Deadlines', href: '/deadlines' },
      { label: 'Entrance exams', href: '/entrance-exams' },
      { label: 'Admission planner', href: '/admissions/planner' },
    ],
  },
  {
    label: 'Scholarships',
    href: '/scholarships',
    sub: [
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'Opportunities', href: '/opportunities' },
    ],
  },
  {
    label: 'Results',
    href: '/results',
    sub: [
      { label: 'Board results', href: '/results' },
      { label: 'University notices', href: '/notices' },
      { label: 'News & guides', href: '/news' },
    ],
  },
  {
    label: 'More',
    href: '/my-path',
    sub: [
      { label: 'My Path', href: '/my-path', description: 'Student checklist & shortlists' },
      { label: 'Career Explorer', href: '/careers', description: 'Degree pathways & jobs' },
      { label: 'GPA Calculator', href: '/tools/gpa-calculator', description: 'NEB Grade 12 & SEE conversion' },
      { label: 'Study Resources', href: '/study-resources', description: 'Syllabus & past papers' },
      { label: 'Student Wellbeing', href: '/wellbeing', description: 'Mental health & guidance' },
    ],
  },
]



function Wordmark() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0 group">
      <span className="text-[15px] font-extrabold tracking-tight font-sans text-slate-900 dark:text-white leading-none transition-colors">
        ShikshyaX<span className="text-primary dark:text-[#CAFFA6]">Nepal</span>
      </span>
    </Link>
  )
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [navOffset, setNavOffset] = useState(0)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileDialogRef = useRef<HTMLDivElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const restoreMobileFocusRef = useRef(true)
  const pathname = usePathname()

  const closeMobileMenu = useCallback((restoreFocus = true) => {
    restoreMobileFocusRef.current = restoreFocus
    setMobileOpen(false)
  }, [])

  useEffect(() => {
    restoreMobileFocusRef.current = false
    setMobileOpen(false)
    setOpenDrop(null)
  }, [pathname])

  useEffect(() => {
    let lastY = window.scrollY
    let lastTime = performance.now()
    let settleTimer: ReturnType<typeof window.setTimeout>

    const fn = () => {
      const now = performance.now()
      const nextY = window.scrollY
      const velocity = (nextY - lastY) / Math.max(now - lastTime, 1)
      setScrolled(nextY > 4)
      setShowCta(nextY > 80)
      // A small, bounded nudge makes the pill feel responsive to a fast scroll
      // without shifting content or making navigation hard to target.
      setNavOffset(Math.max(-12, Math.min(12, velocity * 8)))
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => setNavOffset(0), 120)
      lastY = nextY
      lastTime = now
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => {
      window.removeEventListener('scroll', fn)
      window.clearTimeout(settleTimer)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const trigger = mobileTriggerRef.current
    mobileCloseRef.current?.focus()

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !mobileDialogRef.current) return
      const controls = Array.from(mobileDialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(control => control.getClientRects().length > 0)
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      if (restoreMobileFocusRef.current) (previouslyFocused || trigger)?.focus()
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!openDrop) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.sn-nav-dropdown')) setOpenDrop(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDrop])

  useEffect(() => {
    if (!openDrop && !mobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDrop(null)
        closeMobileMenu(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeMobileMenu, openDrop, mobileOpen])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <header
        className="sticky top-3 z-50 mx-auto w-[calc(100%-1rem)] max-w-7xl transition-transform duration-200 ease-out motion-reduce:transform-none sm:w-[calc(100%-2rem)]"
        style={{ transform: `translateY(${navOffset}px)` }}
      >
        <div className={`mx-auto flex h-14 items-center justify-between rounded-full border px-4 backdrop-blur-xl transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#061519]/95 border-black/[0.1] dark:border-white/[0.14] shadow-[0_12px_36px_rgba(11,43,51,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
            : 'bg-white/80 dark:bg-[#061519]/80 border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl'
        }`}>
          {/* Left Cluster: Wordmark + Minimal Quiet Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Wordmark />

            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <div
                    key={link.label}
                    className="relative sn-nav-dropdown"
                    onMouseEnter={() => setOpenDrop(link.label)}
                    onMouseLeave={() => setOpenDrop(null)}
                  >
                    {link.sub ? (
                      <button
                        onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                        aria-expanded={openDrop === link.label}
                        aria-controls={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                        className={`motion-control flex items-center gap-1 text-[13px] font-nunito tracking-tight transition-all duration-150 px-3 py-1.5 rounded-full ${
                          active
                            ? 'text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-bold shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openDrop === link.label ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`motion-control inline-block text-[13px] font-nunito tracking-tight transition-all duration-150 px-3 py-1.5 rounded-full ${
                          active
                            ? 'text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-bold shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}

                  {link.sub && openDrop === link.label && (
                    <div className={`absolute top-full z-50 pt-2 ${link.label === 'results' ? 'right-0' : 'left-0'}`}>
                      <div id={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="motion-menu-enter w-64 overflow-hidden rounded-2xl border border-black/[0.1] dark:border-white/[0.08] bg-white dark:bg-[#171920]/95 p-1.5 backdrop-blur-2xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
                        {link.sub.map((s, index) => (
                          <div key={s.label}>
                            {s.group && (index === 0 || link.sub![index - 1].group !== s.group) && (
                              <p className="px-3.5 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-sn-ink-muted">{s.group}</p>
                            )}
                            <Link href={s.href} onClick={() => setOpenDrop(null)} className="motion-control block rounded-xl px-3.5 py-2 text-xs font-nunito font-bold text-slate-800 dark:text-sn-ink-soft hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-slate-950 dark:hover:text-white">
                              {s.label}
                              {s.description && <span className="mt-0.5 block font-normal text-slate-500 dark:text-sn-ink-muted">{s.description}</span>}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            </nav>
          </div>

          {/* Right Cluster: Search Capsule, Theme Toggle, Subscribe, Account, CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Pill matching [ Q    ⌘K ] */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-site-search'))}
              className="motion-control focus-ring inline-flex items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.04] px-2.5 py-1 text-xs text-slate-700 dark:text-sn-ink-muted hover:bg-black/[0.07] dark:hover:bg-white/[0.08] hover:border-black/[0.18] dark:hover:border-white/[0.14] transition-all"
              aria-label="Search ShikshyaXNepal"
            >
              <Search className="h-3 w-3 text-slate-600 dark:text-sn-ink-muted" />
              <span className="hidden xl:inline text-[11px] font-mono text-slate-700 dark:text-sn-ink-soft font-semibold">search</span>
              <kbd className="hidden sm:inline rounded border border-black/15 dark:border-white/10 bg-black/5 dark:bg-white/10 px-1 py-0.2 text-[9px] font-mono text-slate-700 dark:text-sn-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Subtle Subscribe Icon & Account */}
            <div className="hidden sm:flex items-center gap-1.5">
              <SubscribeButton variant="header" />
              <AccountButton />
            </div>

            {/* Pill CTA */}
            <Link
              href="/colleges"
              className={`motion-control focus-ring hidden items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-[#204654] text-xs font-bold font-nunito text-white shadow-sm transition-all duration-300 hover:bg-[#295b6e] hover:shadow sm:inline-flex ${showCta ? 'max-w-48 px-4 py-1.5 opacity-100' : 'max-w-0 px-0 py-1.5 opacity-0 pointer-events-none'}`}
              aria-hidden={!showCta}
              tabIndex={showCta ? 0 : -1}
            >
              <span>explore colleges</span>
              <ArrowRight className="h-3 w-3 text-[#CAFFA6]" />
            </Link>

            {/* Mobile hamburger */}
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => {
                if (mobileOpen) closeMobileMenu(true)
                else { restoreMobileFocusRef.current = true; setMobileOpen(true) }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 dark:text-sn-ink-soft hover:bg-black/5 dark:hover:bg-sn-surface-alt lg:hidden"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="sn-mobile-site-navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div id="sn-mobile-site-navigation" className="fixed inset-0 z-[300] lg:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="motion-scrim-enter absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => closeMobileMenu(true)} />
          <div ref={mobileDialogRef} className="motion-drawer-enter absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-white dark:bg-sn-ground shadow-2xl border-l border-black/[0.08] dark:border-sn-border">
            <div className="flex items-center justify-between px-5 h-14 border-b border-black/[0.08] dark:border-sn-border flex-shrink-0">
              <Wordmark />
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <button ref={mobileCloseRef} type="button" onClick={() => closeMobileMenu(true)} aria-label="Close navigation menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 dark:text-sn-ink-soft hover:bg-black/5 dark:hover:bg-sn-surface-alt">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.sub ? (
                    <button
                      type="button"
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      aria-expanded={openDrop === link.label}
                      aria-controls={`sn-mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                      className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium font-sans capitalize transition-colors ${isActive(link.href) ? 'bg-sn-primary-bg text-sn-primary font-bold' : 'text-sn-ink hover:bg-sn-surface-alt'}`}
                    >
                      {link.label}<ChevronDown className={`h-4 w-4 transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link href={link.href} onClick={() => closeMobileMenu(false)} className={`flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium font-sans capitalize ${isActive(link.href) ? 'bg-sn-primary-bg text-sn-primary font-bold' : 'text-sn-ink hover:bg-sn-surface-alt'}`}>
                      {link.label}
                    </Link>
                  )}
                  {link.sub && openDrop === link.label && (
                    <div id={`sn-mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="ml-3 mt-1 mb-2 space-y-0.5 border-l-2 border-sn-border pl-2">
                      <Link href={link.href} onClick={() => closeMobileMenu(false)} className="flex min-h-8 items-center rounded px-2.5 py-1.5 text-xs font-bold font-nunito text-sn-primary hover:bg-sn-primary-bg">View all {link.label}</Link>
                      {link.sub.map((s, index) => (
                        <div key={s.label}>
                          {s.group && (index === 0 || link.sub![index - 1].group !== s.group) && (
                            <p className="px-2.5 pb-0.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-sn-ink-muted">{s.group}</p>
                          )}
                          <Link href={s.href} onClick={() => closeMobileMenu(false)} className="flex min-h-8 items-center rounded px-2.5 py-1.5 text-xs font-nunito text-sn-ink-soft hover:bg-sn-surface-alt hover:text-sn-primary transition-colors">
                            {s.label}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-sn-border space-y-2 flex-shrink-0">
              <AccountButton mobile onNavigate={() => closeMobileMenu(false)} />
              <Link href="/colleges" onClick={() => closeMobileMenu(false)} className="flex min-h-10 items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-[#204654] text-xs font-bold font-nunito text-white shadow-sm hover:bg-[#295b6e] transition-colors">
                <span>explore colleges</span>
                <ArrowRight className="h-3 w-3 text-[#CAFFA6]" />
              </Link>
              <Link href="/results" onClick={() => closeMobileMenu(false)} className="flex min-h-10 items-center justify-center gap-2 w-full py-2.5 rounded-full border border-sn-border-strong text-xs font-bold font-nunito text-sn-ink hover:border-sn-primary hover:text-sn-primary transition-colors">
                Check Results
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
