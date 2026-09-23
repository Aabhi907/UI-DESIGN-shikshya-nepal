'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import MobileQuickNav from '@/components/layout/MobileQuickNav'
import GlobalSearch from '@/components/layout/GlobalSearch'
import SiteAnnouncement from '@/components/layout/SiteAnnouncement'
import Nav from '@/components/design-system/Nav'
import DesignSystemFooter from '@/components/design-system/Footer'
import QuickNav from '@/components/design-system/QuickNav'

const AUTH_PAGES = ['/account/login', '/account/register', '/account/signup']

// Phased design-system rollout: the sn- Nav (see the "Floating pill nav"
// Build Brief) now renders site-wide — components/layout/Header.tsx was
// retired and deleted. The rest of the shell still rolls out page by page:
// converted routes get the new Footer/QuickNav, everything else keeps the
// original Footer/MobileQuickNav until its own phase converts it — see the
// "Public UI redesign" Build Briefs (Phase 1: home + college profile;
// Phase 2: colleges/programs listing families + program-finder). The K-10
// directory offering (and its routes) was removed entirely per its own
// Build Brief. /compare, /programs/[slug], /search and admin are
// deliberately not in this set yet. SiteAnnouncement and GlobalSearch are
// unrelated to this rollout and are left exactly as they are on every
// route, converted or not.
const CONVERTED_EXACT = new Set([
  '/', '/colleges', '/colleges/nearby', '/programs', '/tools/program-finder',
])
const CONVERTED_PREFIXES = [
  '/colleges/in/', '/colleges/program/', '/colleges/province/',
]

function isConvertedRoute(pathname: string) {
  if (CONVERTED_EXACT.has(pathname)) return true
  if (CONVERTED_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true
  // College profile pages: a single dynamic segment not already claimed above.
  return /^\/colleges\/[^/]+$/.test(pathname)
}

export default function MainChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PAGES.includes(pathname)) return <div id="main-content" className="site-shell min-h-screen bg-[#f8f7f3]">{children}</div>

  const converted = isConvertedRoute(pathname)
  return (
    <>
      <Nav />
      <SiteAnnouncement />
      <div id="main-content" className={converted ? 'min-h-screen bg-sn-ground pb-20 font-nunito text-sn-ink lg:pb-0' : 'site-shell min-h-screen bg-[#f8f7f3] pb-20 lg:pb-0'}>{children}</div>
      {converted ? <DesignSystemFooter /> : <Footer />}
      {converted ? <QuickNav /> : <MobileQuickNav />}
      <GlobalSearch />
    </>
  )
}
