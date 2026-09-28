'use client'

import Link from 'next/link'
import { Building2, CalendarDays, House, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Phase 1 design system version of components/layout/MobileQuickNav.tsx —
// same destinations, new tokens. Kept separate since the original is shared
// by every page not yet converted to this system.
const items = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/admissions', label: 'Admissions', Icon: CalendarDays },
  { href: '/colleges', label: 'Colleges', Icon: Building2 },
  { href: '/search', label: 'Search', Icon: Search },
]

export default function QuickNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-sn-border bg-sn-ground/95 pb-[env(safe-area-inset-bottom)] shadow-sn-float backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`motion-control focus-ring flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-bold font-nunito transition ${active ? 'text-sn-primary' : 'text-sn-ink-soft hover:text-sn-primary'}`}>
              <span className={`flex h-7 w-9 items-center justify-center rounded-sn-control ${active ? 'bg-sn-primary-bg' : ''}`}>
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
