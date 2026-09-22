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

// Phase 1 design-system rollout: only the home page and college profile
// pages use the new shell so far. Every other route keeps the existing
// Header/Footer/MobileQuickNav untouched until its own phase converts it —
// see the "Public UI redesign" Build Brief. SiteAnnouncement and
// GlobalSearch are unrelated to that brief's nav/footer scope and are left
// exactly as they are on every route, converted or not.
function isConvertedRoute(pathname: string) {
  if (pathname === '/') return true
  const collegeProfile = /^\/colleges\/[^/]+$/.test(pathname)
  return collegeProfile && !['/colleges/nearby'].includes(pathname)
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
