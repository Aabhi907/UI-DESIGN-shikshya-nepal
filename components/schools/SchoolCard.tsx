import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, MapPin, School as SchoolIcon, Users } from 'lucide-react'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import type { School } from '@/types'

function ownershipLabel(value: School['ownership_type']) {
  if (!value) return 'School'
  return value === 'institutional'
    ? 'Private / Institutional'
    : value.charAt(0).toUpperCase() + value.slice(1)
}

function gradeLabel(school: School) {
  if (school.grades_from != null && school.grades_to != null) {
    const from = school.grades_from === 0 ? 'ECD' : `Grade ${school.grades_from}`
    return `${from}–${school.grades_to}`
  }
  const labels: Record<string, string> = {
    pre_primary: 'Pre-primary',
    basic: 'Basic level',
    secondary: 'Secondary level',
    multiple: 'Multiple levels (up to Grade 10)',
  }
  return school.school_level ? labels[school.school_level] : null
}

export default function SchoolCard({ school }: { school: School }) {
  const grades = gradeLabel(school)
  const place = Array.from(new Set([school.local_level || school.location, school.district].filter(Boolean))).join(', ')
  return (
    <Link href={`/schools/${school.slug}`} aria-label={`View ${school.name} school profile`} className="group flex h-full flex-col overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface shadow-sn-card transition-shadow hover:shadow-sn-float">
      <div className="relative h-28 flex-shrink-0 overflow-hidden bg-sn-surface-alt">
        {school.cover_url ? (
          <Image src={school.cover_url} alt={`${school.name} campus or school building`} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center"><SchoolIcon className="h-8 w-8 text-sn-ink-muted" aria-hidden="true" /></div>
        )}
        <div className="absolute left-3 top-3">
          <VerificationBadge status={school.verification_status} compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="relative z-10 -mt-9 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sn-control border border-sn-border bg-sn-surface shadow-sn-card">
            {school.logo_url ? (
              <Image src={school.logo_url} alt={`${school.name} logo`} width={44} height={44} className="rounded-sn-control object-contain" />
            ) : (
              <SchoolIcon className="h-5 w-5 text-sn-primary" />
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="line-clamp-2 font-baloo text-base font-bold leading-6 text-sn-ink transition-colors group-hover:text-sn-primary">
              {school.name}
            </h2>
            {school.iemis_code && <p className="mt-1 font-mono text-[10px] text-sn-ink-muted">IEMIS {school.iemis_code}</p>}
          </div>
        </div>

        <div className="space-y-2 text-xs text-sn-ink-soft">
          <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sn-ink-muted" aria-hidden="true" /><span className="line-clamp-2">{place || school.province || 'Location not listed'}</span></p>
          {grades && <p className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-sn-ink-muted" aria-hidden="true" />{grades}</p>}
          {school.student_count != null && <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-sn-ink-muted" aria-hidden="true" />{school.student_count.toLocaleString()} students</p>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-sn-border pt-3">
          <span className="text-xs font-bold text-sn-ink-muted">{ownershipLabel(school.ownership_type)}</span>
          <span className="flex items-center gap-1 text-xs font-bold text-sn-primary">View profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  )
}
