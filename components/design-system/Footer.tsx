import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import CookieSettingsButton from '@/components/privacy/CookieSettingsButton'
import LanguageSwitch from '@/components/design-system/LanguageSwitch'

// Phase 1 design system footer. Same links as components/layout/Footer.tsx —
// only the visual treatment is new. Kept separate since the original Footer
// is shared by every page not yet converted to this system.

const exploreLinks = [
  { label: 'All Colleges', href: '/colleges' },
  { label: 'Admissions Open', href: '/admissions' },
  { label: 'Compare Colleges', href: '/compare' },
  { label: 'Programs', href: '/programs' },
  { label: 'Study & Career Explorer', href: '/careers' },
  { label: 'My Path', href: '/my-path' },
  { label: 'News & Guides', href: '/news' },
  { label: 'Scholarships', href: '/scholarships' },
]

const institutionLinks = [
  { label: 'Institution dashboard', href: '/account/institutions' },
  { label: 'Claim an institution', href: '/account/claim' },
  { label: 'Submit a college', href: '/submit-college' },
]

const universityLinks = [
  { label: 'TU Results', href: '/results?university=TU' },
  { label: 'KU Results', href: '/results?university=KU' },
  { label: 'NEB Results', href: '/results?university=NEB' },
  { label: 'TU Notices', href: '/notices?university=TU' },
  { label: 'KU Notices', href: '/notices?university=KU' },
  { label: 'CTEVT Notices', href: '/notices?university=CTEVT' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0b0d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <span className="font-baloo font-extrabold text-[17px] leading-none tracking-tight">
                <span className="text-white">Sikshya</span>
                <span className="text-[#CAFFA6]">Nepal</span>
              </span>
            </Link>
            <p className="text-sm font-nunito text-white/60 leading-relaxed mb-6 max-w-xs">
              An independent guide to colleges, programs and education in Nepal. Verification status and original sources are shown where available.
            </p>
            <div className="space-y-2.5">
              <Link href="/contact" className="flex items-center gap-2.5 text-sm font-nunito text-white/60 hover:text-white transition-colors duration-150">
                <Mail className="w-4 h-4 text-[#CAFFA6] flex-shrink-0" />
                Contact us
              </Link>
              <div className="flex items-center gap-2.5 text-sm font-nunito text-white/60">
                <MapPin className="w-4 h-4 text-[#CAFFA6] flex-shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold font-nunito text-white/50 uppercase tracking-widest mb-5">Explore</h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-sm font-nunito text-white/60 hover:text-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold font-nunito text-white/50 uppercase tracking-widest mb-5">Results &amp; notices</h3>
            <ul className="space-y-3">
              {universityLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-sm font-nunito text-white/60 hover:text-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold font-nunito text-white/50 uppercase tracking-widest mb-5">For institutions</h3>
            <ul className="space-y-3">
              {institutionLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-sm font-nunito text-white/60 hover:text-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-nunito text-white/40">© {new Date().getFullYear()} ShikshyaXNepal. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-nunito text-white/40 sm:justify-end">
            <Link href="/about/editorial-policy" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Editorial policy</Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Privacy</Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Terms</Link>
            <Link href="/community/guidelines" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Community rules</Link>
            <Link href="/safety" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Safety</Link>
            <Link href="/copyright" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Copyright</Link>
            <Link href="/cookies" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Cookies</Link>
            <Link href="/refunds" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Refunds</Link>
            <CookieSettingsButton />
            <Link href="/contact" className="inline-flex min-h-11 items-center hover:text-white transition-colors duration-150">Contact</Link>
            <LanguageSwitch />
          </div>
        </div>

        {/* Giant Cropped Voxt-Style Wordmark */}
        <div className="overflow-hidden select-none pointer-events-none mt-16 -mb-8 text-center" aria-hidden="true">
          <p className="font-baloo font-extrabold tracking-[0.045em] text-white/[0.05] text-[clamp(3.5rem,13vw,12rem)] leading-[0.74] uppercase">
            SIKSHYA NEPAL
          </p>
        </div>
      </div>
    </footer>
  )
}
