'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileQuickNav from '@/components/layout/MobileQuickNav'
import GlobalSearch from '@/components/layout/GlobalSearch'
import SiteAnnouncement from '@/components/layout/SiteAnnouncement'
import Nav from '@/components/design-system/Nav'
import DesignSystemFooter from '@/components/design-system/Footer'
import QuickNav from '@/components/design-system/QuickNav'

const AUTH_PAGES = ['/account/login', '/account/register', '/account/signup']

// Phased design-system rollout: converted routes use the new shell; every
// other route keeps the existing Header/Footer/MobileQuickNav untouched
// until its own phase converts it — see the "Public UI redesign" Build
// Briefs (Phase 1: home + college profile; Phase 2: colleges/schools/
// programs listing families + the program-finder flow). School profile
// pages (/schools/[slug]), /schools/compare, /compare, /programs/[slug],
// /search and admin are deliberately not in this set yet. SiteAnnouncement
// and GlobalSearch are unrelated to these briefs' nav/footer scope and are
// left exactly as they are on every route, converted or not.
const CONVERTED_EXACT = new Set([
  '/', '/colleges', '/colleges/nearby', '/schools', '/schools/nearby', '/programs', '/tools/program-finder',
])
const CONVERTED_PREFIXES = [
  '/colleges/in/', '/colleges/program/', '/colleges/province/',
  '/schools/in/', '/schools/municipality/', '/schools/province/',
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

  if (isConvertedRoute(pathname)) {
    return (
      <>
        <Nav />
        <SiteAnnouncement />
        <div id="main-content" className="min-h-screen bg-sn-ground pb-20 font-nunito text-sn-ink lg:pb-0">{children}</div>
        <DesignSystemFooter />
        <QuickNav />
        <GlobalSearch />
      </>
    )
  }

  return <><Header/><SiteAnnouncement/><div id="main-content" className="site-shell min-h-screen bg-[#f8f7f3] pb-20 lg:pb-0">{children}</div><Footer/><MobileQuickNav/><GlobalSearch/></>
}
