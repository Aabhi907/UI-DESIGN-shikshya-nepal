'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search, Moon } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'
import AccountButton from '@/components/auth/AccountButton'
import Mascot from '@/components/design-system/Mascot'

type NavigationItem = { label: string; href: string; group?: string }
type NavigationLink = { label: string; href: string; sub?: NavigationItem[] }

const navLinks: NavigationLink[] = [
  {
    label: 'colleges',
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
    label: 'programs',
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
    label: 'admissions',
    href: '/admissions',
    sub: [
      { label: 'Open admissions', href: '/admissions?deadline=open' },
      { label: 'Deadlines', href: '/deadlines' },
      { label: 'Entrance exams', href: '/entrance-exams' },
      { label: 'Admission planner', href: '/admissions/planner' },
    ],
  },
  {
    label: 'scholarships',
    href: '/scholarships',
    sub: [
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'Opportunities', href: '/opportunities' },
    ],
  },
  {
    label: 'guidance',
    href: '/my-path',
    sub: [
      { label: 'My Path', href: '/my-path' },
      { label: 'Career Explorer', href: '/careers' },
      { label: 'GPA calculator', href: '/tools/gpa-calculator' },
      { label: 'Study resources', href: '/study-resources' },
      { label: 'Student wellbeing', href: '/wellbeing' },
    ],
  },
  {
    label: 'results',
    href: '/results',
    sub: [
      { label: 'Board results', href: '/results' },
      { label: 'University notices', href: '/notices' },
      { label: 'News & guides', href: '/news' },
    ],
  },
]

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="10" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M20.5 4.5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function LiveClock() {
  const [time, setTime] = useState<string>('6:51 PM')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="hidden xl:inline text-[11px] font-mono font-medium text-sn-ink-muted tabular-nums select-none">
      {time}
    </span>
  )
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
      <Mascot pose="wave" size={24} />
      <span className="text-[15px] font-extrabold tracking-tight font-sans text-sn-ink leading-none">
        sikshya<span className="text-sn-primary">nepal</span>
      </span>
    </Link>
  )
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
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
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
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
      <header className={`sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl transition-all duration-200 ${scrolled ? 'bg-white/95 shadow-sm' : ''}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Cluster: Wordmark + Minimal Quiet Nav Links */}
          <div className="flex items-center gap-7 lg:gap-9">
            <Wordmark />

            <nav className="hidden lg:flex items-center gap-5 xl:gap-6" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <div key={link.label} className="relative sn-nav-dropdown">
                  {link.sub ? (
                    <button
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      aria-expanded={openDrop === link.label}
                      aria-controls={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                      className={`motion-control flex items-center gap-1 text-[13px] font-medium font-sans lowercase transition-colors duration-150 py-1 ${
                        isActive(link.href) ? 'text-sn-ink font-semibold' : 'text-sn-ink-soft hover:text-sn-ink'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3 h-3 text-sn-ink-muted transition-transform duration-200 ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`motion-control text-[13px] font-medium font-sans lowercase transition-colors duration-150 py-1 ${
                        isActive(link.href) ? 'text-sn-ink font-semibold' : 'text-sn-ink-soft hover:text-sn-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.sub && openDrop === link.label && (
                    <div className={`absolute top-full z-50 pt-2 ${link.label === 'results' ? 'right-0' : 'left-0'}`}>
                      <div id={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="motion-menu-enter w-64 overflow-hidden rounded-2xl border border-black/[0.07] bg-white/95 p-1.5 backdrop-blur-2xl shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
                        {link.sub.map((s, index) => (
                          <div key={s.label}>
                            {s.group && (index === 0 || link.sub![index - 1].group !== s.group) && (
                              <p className="px-3.5 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-sn-ink-muted">{s.group}</p>
                            )}
                            <Link href={s.href} onClick={() => setOpenDrop(null)} className="motion-control block rounded-xl px-3.5 py-2 text-xs font-nunito font-semibold text-sn-ink-soft hover:bg-sn-surface-alt hover:text-sn-ink">
                              {s.label}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right Cluster: Search Capsule, Moon, Battery, Live Time, CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Pill matching [ Q    ⌘K ] */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-site-search'))}
              className="motion-control focus-ring inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.03] px-2.5 py-1 text-xs text-sn-ink-muted hover:bg-black/[0.06] hover:border-black/[0.12] transition-all"
              aria-label="Search SikshyaNepal"
            >
              <Search className="h-3 w-3 text-sn-ink-muted" />
              <span className="hidden xl:inline text-[11px] font-mono text-sn-ink-soft">search</span>
              <kbd className="hidden sm:inline rounded border border-black/10 bg-white/90 px-1 py-0.2 text-[9px] font-mono text-sn-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                ⌘K
              </kbd>
            </button>

            {/* Moon Icon */}
            <div className="hidden sm:flex items-center text-sn-ink-muted">
              <span className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer" title="System Theme">
                <Moon className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Battery Icon */}
            <div className="hidden md:flex items-center text-sn-ink-muted" title="Live System">
              <BatteryIcon className="text-sn-ink-muted" />
            </div>

            {/* Live Clock */}
            <LiveClock />

            {/* Subtle Subscribe Icon & Account */}
            <div className="hidden xl:flex items-center gap-1.5 pl-1">
              <SubscribeButton variant="header" />
              <AccountButton />
            </div>

            {/* Dark Pill CTA matching [ 🌙 book a demo ] */}
            <Link
              href="/colleges"
              className="motion-control focus-ring inline-flex items-center gap-1.5 rounded-full bg-[#142C35] px-3.5 py-1.5 text-xs font-bold font-nunito text-white shadow-sm hover:bg-[#204654] hover:shadow transition-all duration-200"
            >
              <Moon className="h-3 w-3 text-[#CAFFA6]" />
              <span>explore colleges</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => {
                if (mobileOpen) closeMobileMenu(true)
                else { restoreMobileFocusRef.current = true; setMobileOpen(true) }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sn-ink-soft hover:bg-sn-surface-alt lg:hidden"
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
          <div className="motion-scrim-enter absolute inset-0 bg-sn-ink/40" onClick={() => closeMobileMenu(true)} />
          <div ref={mobileDialogRef} className="motion-drawer-enter absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-sn-ground shadow-sn-float">
            <div className="flex items-center justify-between px-5 h-14 border-b border-sn-border flex-shrink-0">
              <Wordmark />
              <button ref={mobileCloseRef} type="button" onClick={() => closeMobileMenu(true)} aria-label="Close navigation menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-sn-ink-soft hover:bg-sn-surface-alt">
                <X className="w-4 h-4" />
              </button>
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
              <Link href="/colleges" onClick={() => closeMobileMenu(false)} className="flex min-h-10 items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-[#142C35] text-xs font-bold font-nunito text-white shadow-sm hover:bg-[#204654] transition-colors">
                <Moon className="h-3 w-3 text-[#CAFFA6]" />
                <span>explore colleges</span>
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
