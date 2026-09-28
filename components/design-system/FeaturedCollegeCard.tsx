import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import type { College } from '@/types'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import { collegeDisplayLocation, collegeDisplayPrograms, hasActiveCollegeSponsorship } from '@/lib/college-display'
import Pill from '@/components/design-system/Pill'

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

  return (
    <Link
      href={`/colleges/${college.slug}`}
      aria-label={`View ${college.name} college profile`}
      className="motion-interactive-card group flex h-full flex-col overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface shadow-sn-card hover:shadow-sn-float"
    >
      <div className="relative h-32 flex-shrink-0 overflow-hidden bg-sn-surface-alt">
        {college.cover_url ? (
          <Image src={college.cover_url} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-baloo text-2xl font-bold text-sn-primary/40">{college.name.charAt(0)}</span>
          </div>
        )}
        {isSponsored && (
          <span className="absolute right-3 top-3"><Pill tone="confirm">{college.sponsor_label || 'Sponsored'}</Pill></span>
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
