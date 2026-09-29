import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import type { College } from '@/types'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import { collegeDisplayLocation, collegeDisplayPrograms, hasActiveCollegeSponsorship } from '@/lib/college-display'
import Pill from '@/components/design-system/Pill'

export const CAMPUS_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
]

// Landing-only card: home page's featured-colleges query is the plain
// colleges.* row (no fee/rating joins), so this deliberately shows less than
// the shared CollegeCard used on listing pages — one primary action (View
// profile), per the "one job per card" spacing brief. Kept separate from
// components/colleges/CollegeCard.tsx, which is reused on 5 other pages not
// yet converted to this design system.
function affiliationShort(full: string | null): string | null {
  if (!full) return null
  if (full.includes('Tribhuvan')) return 'TU'
  if (full.includes('Kathmandu')) return 'KU'
  if (full.includes('Pokhara')) return 'PU'
  if (full.includes('Purbanchal')) return 'PurU'
  if (full.toLowerCase().includes('private')) return 'Private'
  return full.slice(0, 6)
}

export default function FeaturedCollegeCard({ college }: { college: College }) {
  const affiliShort = affiliationShort(college.affiliation)
  const displayLocation = collegeDisplayLocation(college)
  const topPrograms = collegeDisplayPrograms(college.programs_offered).slice(0, 3)
  const isSponsored = hasActiveCollegeSponsorship(college)

  // Deterministic fallback campus photo for each college based on its name
  const charSum = college.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const fallbackImage = CAMPUS_FALLBACK_IMAGES[Math.abs(charSum) % CAMPUS_FALLBACK_IMAGES.length]
  const coverSrc = college.cover_url || fallbackImage

  return (
    <Link
      href={`/colleges/${college.slug}`}
      aria-label={`View ${college.name} college profile`}
      className="apple-card group flex h-full flex-col overflow-hidden motion-interactive-card"
    >
      <div className="relative h-36 flex-shrink-0 overflow-hidden bg-sn-surface-alt">
        <Image
          src={coverSrc}
          alt={`${college.name} campus`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 60%)' }} />
        {isSponsored && (
          <span className="absolute right-3 top-3 z-10"><Pill tone="confirm">{college.sponsor_label || 'Sponsored'}</Pill></span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-nunito text-base font-bold leading-snug text-sn-ink line-clamp-2 group-hover:text-sn-primary">{college.name}</h3>
        {displayLocation && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-nunito text-sn-ink-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{displayLocation}</span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <VerificationBadge status={college.verification_status} compact />
          {affiliShort && <Pill tone="neutral">{affiliShort}</Pill>}
        </div>
        {topPrograms.length > 0 && (
          <p className="mt-3 text-xs font-nunito text-sn-ink-soft line-clamp-1">{topPrograms.join(' · ')}</p>
        )}
        <span className="mt-4 flex items-center gap-1 pt-3 border-t border-sn-border text-xs font-bold font-nunito text-sn-primary">
          View profile <ArrowRight className="motion-arrow h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
