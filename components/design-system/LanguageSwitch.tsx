'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Lightweight EN / नेपाली switch — no i18n machinery, just a link to the
// existing / and /ne routes. Moved out of the main nav into the footer
// (Build Brief 36 / D8): only one page is translated today, so every link
// from /ne dropped back to English — this keeps the toggle available without
// implying a fully translated site is one tap away in primary navigation.
// Styled for the dark footer backgrounds it now lives on (both footers use a
// dark surface), not the light nav pill it was originally written for.
export default function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname()
  const isNepali = pathname === '/ne' || pathname.startsWith('/ne/')
  return (
    <div className={`inline-flex items-center overflow-hidden rounded-sn-control border border-white/15 text-xs font-bold font-nunito ${className || ''}`} role="group" aria-label="Language">
      <Link href="/" aria-current={!isNepali ? 'page' : undefined} className={`min-h-11 px-2.5 py-2 flex items-center transition-colors ${!isNepali ? 'bg-sn-primary text-white' : 'text-white/60 hover:text-white'}`}>EN</Link>
      <Link href="/ne" aria-current={isNepali ? 'page' : undefined} className={`min-h-11 px-2.5 py-2 flex items-center transition-colors ${isNepali ? 'bg-sn-primary text-white' : 'text-white/60 hover:text-white'}`}>ने</Link>
    </div>
  )
}
