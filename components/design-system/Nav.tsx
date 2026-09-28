'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'
import AccountButton from '@/components/auth/AccountButton'
import Mascot from '@/components/design-system/Mascot'

// Site-wide nav (see the "Floating pill nav" Build Brief). Interaction logic
// (focus trap, outside-click, Escape, scroll lock) is carried over unchanged
// from the retired components/layout/Header.tsx — this now renders on every
// route, so Header.tsx was deleted rather than kept as unreachable dead code.
// Its two behaviours not already here (a ⌘K hint on Search, and a secondary
// "Check Results" action in the mobile drawer) were ported below; everything
// else in Header was already present in this component unchanged.

type NavigationItem = { label: string; href: string; group?: string }
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
    label: 'Guidance',
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
    label: 'Updates',
    href: '/news',
    sub: [
      { label: 'News & guides', href: '/news' },
      { label: 'Results', href: '/results' },
      { label: 'Notices', href: '/notices' },
    ],
  },
]

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
      <Mascot pose="wave" size={30} />
      <span className="font-baloo text-[19px] font-extrabold leading-none tracking-[-0.02em]">
        <span className="text-sn-ink">Sikshya</span>
        <span className="text-sn-primary">Nepal</span>
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
      <header className="sticky top-0 z-50 px-5 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <div className={`motion-header mx-auto flex h-16 max-w-[1500px] items-center justify-between rounded-full border border-sn-border bg-sn-surface/95 px-4 backdrop-blur sm:px-6 ${scrolled ? 'shadow-sn-float' : 'shadow-sn-card'}`}>
            <Wordmark />

            <nav className="hidden min-[1400px]:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div key={link.label} className="relative sn-nav-dropdown">
                  {link.sub ? (
                    <button
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      aria-expanded={openDrop === link.label}
                      aria-controls={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                      className={`flex min-h-11 items-center gap-0.5 rounded-sn-control px-3.5 py-2 text-sm font-bold font-nunito transition-colors duration-150 ${
                        isActive(link.href) ? 'text-sn-primary' : 'text-sn-ink-soft hover:text-sn-ink'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`flex items-center gap-0.5 rounded-sn-control px-3.5 py-2 text-sm font-bold font-nunito transition-colors duration-150 ${
                        isActive(link.href) ? 'text-sn-primary' : 'text-sn-ink-soft hover:text-sn-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.sub && openDrop === link.label && (
                    <div className={`absolute top-full z-50 ${link.label === 'Updates' ? 'right-0' : 'left-0'}`}>
                      <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                      <div id={`sn-desktop-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="motion-menu-enter mt-1.5 max-h-[70vh] w-72 overflow-y-auto overscroll-contain rounded-sn-card border border-sn-border bg-sn-surface py-2 shadow-sn-float">
                        {link.sub.map((s, index) => (
                          <div key={s.label}>
                            {s.group && (index === 0 || link.sub![index - 1].group !== s.group) && (
                              <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-sn-ink-muted">{s.group}</p>
                            )}
                            <Link href={s.href} onClick={() => setOpenDrop(null)} className="block rounded-sn-control px-4 py-2.5 text-sm font-nunito font-medium text-sn-ink-soft hover:bg-sn-primary-bg hover:text-sn-primary-hover transition-colors duration-150">
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

            <div className="hidden min-[1400px]:flex items-center gap-2">
              <button onClick={() => window.dispatchEvent(new Event('open-site-search'))} className="inline-flex items-center gap-2 rounded-sn-control border border-sn-border-strong px-3 py-2 text-sm font-bold font-nunito text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary" aria-label="Search SikshyaNepal">
                <Search className="h-4 w-4" /><span className="hidden xl:inline">Search</span><kbd className="hidden rounded border border-sn-border px-1.5 py-0.5 text-[10px] text-sn-ink-muted xl:inline">⌘K</kbd>
              </button>
              <SubscribeButton variant="header" />
              <AccountButton />
              <Link href="/colleges" className="inline-flex items-center gap-2 rounded-sn-control bg-sn-primary px-4 py-2 text-sm font-bold font-nunito text-white shadow-sn-button hover:bg-sn-primary-hover transition-colors duration-150">
                Start your pathway
              </Link>
            </div>

            <div className="flex items-center gap-1 min-[1400px]:hidden">
              <SubscribeButton variant="header" />
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => {
                  if (mobileOpen) closeMobileMenu(true)
                  else { restoreMobileFocusRef.current = true; setMobileOpen(true) }
                }}
                className="flex h-11 w-11 items-center justify-center rounded-sn-control text-sn-ink-soft hover:bg-sn-surface-alt"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="sn-mobile-site-navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
        </div>
      </header>

      {mobileOpen && (
        <div id="sn-mobile-site-navigation" className="fixed inset-0 z-[300] min-[1400px]:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="motion-scrim-enter absolute inset-0 bg-sn-ink/40" onClick={() => closeMobileMenu(true)} />
          <div ref={mobileDialogRef} className="motion-drawer-enter absolute inset-y-0 right-0 flex w-[min(100%,24rem)] flex-col bg-sn-ground shadow-sn-float">
            <div className="flex items-center justify-between px-5 h-16 border-b border-sn-border flex-shrink-0">
              <Wordmark />
              <button ref={mobileCloseRef} type="button" onClick={() => closeMobileMenu(true)} aria-label="Close navigation menu" className="flex h-11 w-11 items-center justify-center rounded-sn-control text-sn-ink-soft hover:bg-sn-surface-alt">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.sub ? (
                    <button
                      type="button"
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      aria-expanded={openDrop === link.label}
                      aria-controls={`sn-mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
                      className={`flex min-h-11 w-full items-center justify-between rounded-sn-control px-3 py-3 text-left text-sm font-bold font-nunito transition-colors ${isActive(link.href) ? 'bg-sn-primary-bg text-sn-primary-hover' : 'text-sn-ink hover:bg-sn-surface-alt'}`}
                    >
                      {link.label}<ChevronDown className={`h-4 w-4 transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link href={link.href} onClick={() => closeMobileMenu(false)} className={`flex min-h-11 items-center rounded-sn-control px-3 py-3 text-sm font-bold font-nunito ${isActive(link.href) ? 'bg-sn-primary-bg text-sn-primary-hover' : 'text-sn-ink hover:bg-sn-surface-alt'}`}>
                      {link.label}
                    </Link>
                  )}
                  {link.sub && openDrop === link.label && (
                    <div id={`sn-mobile-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="ml-3 mt-0.5 mb-1 space-y-0.5">
                      <Link href={link.href} onClick={() => closeMobileMenu(false)} className="flex min-h-11 items-center rounded-sn-control px-3 py-2 text-sm font-bold font-nunito text-sn-primary hover:bg-sn-primary-bg">View {link.label}</Link>
                      {link.sub.map((s, index) => (
                        <div key={s.label}>
                          {s.group && (index === 0 || link.sub![index - 1].group !== s.group) && (
                            <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-sn-ink-muted">{s.group}</p>
                          )}
                          <Link href={s.href} onClick={() => closeMobileMenu(false)} className="flex min-h-11 items-center rounded-sn-control px-3 py-2 text-sm font-nunito text-sn-ink-soft hover:bg-sn-surface-alt hover:text-sn-primary transition-colors">
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
              <Link href="/colleges" onClick={() => closeMobileMenu(false)} className="flex min-h-11 items-center justify-center gap-2 w-full py-3 rounded-sn-control bg-sn-primary text-sm font-bold font-nunito text-white shadow-sn-button hover:bg-sn-primary-hover transition-colors">
                Start your pathway
              </Link>
              <Link href="/results" onClick={() => closeMobileMenu(false)} className="flex min-h-11 items-center justify-center gap-2 w-full py-3 rounded-sn-control border border-sn-border-strong text-sm font-bold font-nunito text-sn-ink hover:border-sn-primary hover:text-sn-primary transition-colors">
                Check Results
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
