import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, Banknote, CheckCircle2 } from 'lucide-react'
import type { College } from '@/types'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import { collegeDisplayLocation, collegeDisplayPrograms, hasActiveCollegeSponsorship, safeExternalUrl } from '@/lib/college-display'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import Pill from '@/components/design-system/Pill'
import ApplyNowButton from './ApplyNowButton'

// Affiliation short name
function affiliationShort(full: string | null): string | null {
  if (!full) return null
  if (full.includes('Tribhuvan'))  return 'TU'
  if (full.includes('Kathmandu'))  return 'KU'
  if (full.includes('Pokhara'))    return 'PU'
  if (full.includes('Purbanchal')) return 'PurU'
  if (full.toLowerCase().includes('private')) return 'Private'
  return full.slice(0, 6)
}

function formatFee(n: number): string {
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}

function sourceLabel(url: string | null): string {
  if (!url) return 'Official source'
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Official source' }
}

interface CollegeCardProps {
  college: College & {
    avg_rating?:   number
    review_count?: number
    fee_min?:      number
    fee_max?:      number
    fee_period?:   string
    has_published_fees?: boolean
    fee_source_url?: string | null
    fee_last_verified_at?: string | null
  }
  matchReasons?: string[]
}

export default function CollegeCard({ college, matchReasons = [] }: CollegeCardProps) {
  const affiliShort   = affiliationShort(college.affiliation)

  const linkedPrograms = (college.programs ?? [])
    .slice(0, 4)
    .map((cp) => cp.program?.name)
    .filter(Boolean) as string[]
  const researchedPrograms = collegeDisplayPrograms(college.programs_offered).slice(0, 4)
  const displayLocation = collegeDisplayLocation(college)
  const topPrograms = linkedPrograms.length > 0 ? linkedPrograms : researchedPrograms
  const levelLabels: Record<string, string> = { plus_two: '+2', bachelor: 'Bachelor', master: 'Master', mphil: 'MPhil', phd: 'PhD', diploma: 'Diploma', certificate: 'Certificate' }
  const isSponsored = hasActiveCollegeSponsorship(college)

  const hasFees  = college.fee_min != null && college.fee_max != null
  const feeLabel = hasFees
    ? college.fee_min === college.fee_max
      ? `Rs. ${formatFee(college.fee_min!)}`
      : `Rs. ${formatFee(college.fee_min!)} - ${formatFee(college.fee_max!)}`
    : null
  const feePeriodLabels: Record<string, string> = { monthly: 'per month', semester: 'per semester', annual: 'per year', total_program: 'full programme', one_time: 'one-time' }
  // A single, unambiguous fee value with a documented source and check date
  // earns Verified; an aggregated range or missing provenance gets Confirm —
  // never presented as sourced when it isn't.
  const feeSource = safeExternalUrl(college.fee_source_url)
  const feeIsVerifiable = college.fee_min != null && college.fee_min === college.fee_max && Boolean(feeSource) && Boolean(college.fee_last_verified_at)

  return (
    <article className="group h-full">
      <div
        className={`apple-card motion-interactive-card flex h-full flex-col overflow-hidden
                    ${isSponsored ? '!border-sn-confirm/50' : college.is_featured ? '!border-sn-primary/40' : ''}`}
      >
        <Link href={`/colleges/${college.slug}`} aria-label={`View ${college.name} college profile`} className="block">
        {/* ── Cover ─────────────────────────────────────── */}
        <div className="relative h-32 flex-shrink-0 overflow-hidden bg-sn-surface-alt">
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={`${college.name} campus or college building`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-baloo text-2xl font-bold text-sn-primary/40">{college.name.charAt(0)}</span>
            </div>
          )}

          {affiliShort && (
            <div className="absolute left-3 top-3">
              <Pill tone="neutral">{affiliShort}</Pill>
            </div>
          )}

          {isSponsored && (
            <div className="absolute right-3 top-3">
              <Pill tone="confirm">{college.sponsor_label || 'Sponsored'}</Pill>
            </div>
          )}
          {college.is_featured && !isSponsored && (
            <div className="absolute right-3 top-3">
              <Pill tone="primary">Featured</Pill>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Logo + Name */}
          <div className="mb-2 flex items-start gap-3">
            <div className="relative z-10 -mt-8 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sn-control border border-sn-border bg-sn-surface shadow-sn-card">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={44}
                  height={44}
                  className="rounded-sn-control object-contain"
                />
              ) : (
                <span className="text-base font-bold text-sn-primary">{college.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 pt-1">
              <h3 className="line-clamp-2 font-baloo text-base font-bold leading-6 text-sn-ink transition-colors group-hover:text-sn-primary">
                {college.name}
              </h3>
            </div>
          </div>

          {/* Location */}
          {displayLocation && (
            <div className="mb-2 mt-0.5 flex items-center gap-1.5 text-xs text-sn-ink-muted">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}

          <div className="mb-2">
            <VerificationBadge status={college.verification_status} compact />
          </div>

          {/* Programs — plain text, no pills */}
          {topPrograms.length > 0 && (
            <p className="mb-2 mt-1 line-clamp-1 text-xs text-sn-ink-soft">
              {topPrograms.join(' · ')}
            </p>
          )}
          {college.education_levels && college.education_levels.length > 0 && (
            <p className="mb-2 text-xs font-bold text-sn-primary-hover">{college.education_levels.map(level => levelLabels[level]).filter(Boolean).join(' · ')}</p>
          )}

          {matchReasons.length > 0 && (
            <div className="mb-3 rounded-sn-control border-l-2 border-sn-verified bg-sn-verified-bg/60 py-2 pl-3" aria-label="Why this college matches">
              <p className="text-xs font-bold text-sn-verified-ink">Why it matches</p>
              <ul className="mt-1.5 space-y-1">{matchReasons.slice(0,3).map(reason=><li key={reason} className="flex items-start gap-1.5 text-xs leading-4 text-sn-verified-ink"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true"/>{reason}</li>)}</ul>
            </div>
          )}

          {isSponsored && (
            <p className="mb-2 rounded-sn-control bg-sn-confirm-bg px-2.5 py-2 text-[11px] leading-4 text-sn-confirm-ink">
              {college.sponsor_disclosure || 'Paid placement. Sponsorship does not change verification status or student reviews.'}
            </p>
          )}

          {/* Fee, with evidence chip */}
          {feeLabel && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-sn-ink">
                <Banknote className="h-3.5 w-3.5 flex-shrink-0 text-sn-ink-muted" aria-hidden="true" />
                <span>{feeLabel}</span>
                <span className="text-xs font-normal text-sn-ink-muted">{college.fee_period ? feePeriodLabels[college.fee_period] || college.fee_period : ''}</span>
              </div>
              <div className="mt-1.5">
                {feeIsVerifiable ? (
                  <EvidenceChip state="verified" source={sourceLabel(feeSource)} checkedDate={college.fee_last_verified_at!} />
                ) : (
                  <EvidenceChip state="confirm" label="Confirm current fee with the college" />
                )}
              </div>
            </div>
          )}

          {/* Rating is supporting evidence, not the first decision factor. */}
          {college.avg_rating != null && college.avg_rating > 0 && (
            <div className="mb-2 flex items-center gap-1.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-bold text-sn-ink-soft">{college.avg_rating.toFixed(1)}</span>
              <span className="text-sn-ink-muted">from {college.review_count} approved review{college.review_count === 1 ? '' : 's'}</span>
              {(college.review_count ?? 0) < 5 && <span className="text-sn-confirm-ink">· small sample</span>}
            </div>
          )}

          {/* Profile link */}
          <div className="mt-auto flex items-center justify-end border-t border-sn-border pt-3">
            <span className="flex items-center gap-1 text-xs font-bold text-sn-primary">
              View profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </span>
          </div>
        </div>
        </Link>
        <div className="border-t border-sn-border px-4 py-3">
          <ApplyNowButton
            collegeName={college.name}
            collegeId={college.id}
            isSponsored={isSponsored}
            programs={topPrograms.map((name) => ({ name }))}
            variant="card"
          />
        </div>
      </div>
    </article>
  )
}
