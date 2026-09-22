import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import type { Program } from '@/types'
import {
  BookOpen,
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
  Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Pill from '@/components/design-system/Pill'
import SearchField from '@/components/design-system/SearchField'
import ProgramFinderBanner from '@/components/design-system/ProgramFinderBanner'
import Mascot from '@/components/design-system/Mascot'
import { AlertCircle } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'plus-two':     BookOpen,       // +2 / Intermediate
  'it':           Monitor,
  'management':   BarChart3,
  'engineering':  Wrench,
  'medical':      HeartPulse,
  'humanities':   BookOpen,
  'science':      FlaskConical,
  'education':    GraduationCap,
  'law':          Scale,
  'nursing':      Stethoscope,
  'agriculture':  Sprout,
  'forestry':     TreePine,
  'architecture': Building2,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Programs in Nepal | Bachelor, Master, PhD',
  description: 'Explore university programs in Nepal across IT, Engineering, Management, Medical and other study areas.',
}

// Label shown in the chip, value sent in the URL / compared to DB
const DEGREE_LEVELS = [
  { label: '+2 / Intermediate', value: '+2'         },
  { label: 'Bachelor',          value: 'bachelor'   },
  { label: 'Master',            value: 'master'     },
  { label: 'PhD',               value: 'phd'        },
  { label: 'Diploma',           value: 'diploma'    },
  { label: 'Certificate',       value: 'certificate'},
]

async function getPrograms(searchParams: { faculty?: string; degree?: string; q?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('programs').select('*').order('faculty').order('name')

  if (searchParams.faculty) {
    if (searchParams.faculty === 'plus-two') {
      // +2 programs are stored with degree_level='+2', not a distinct faculty value
      query = query.eq('degree_level', '+2')
    } else {
      const faculty = FACULTIES.find((f) => f.slug === searchParams.faculty)
      if (faculty) query = query.ilike('faculty', `%${faculty.name.split(' ')[0]}%`)
    }
  }
  if (searchParams.degree) {
    // Values are always lowercase (or '+2') — compare directly, no transform needed
    query = query.eq('degree_level', searchParams.degree)
  }
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q.trim().slice(0, 80)}%`)
  const { data, error } = await query.limit(500)
  return { programs: (data || []) as Program[], loadError: Boolean(error) }
}

function filterUrl(searchParams: { faculty?: string; degree?: string; q?: string }, key: 'faculty' | 'degree', value: string) {
  const params = new URLSearchParams()
  if (searchParams.q) params.set('q', searchParams.q)
  if (searchParams.faculty) params.set('faculty', searchParams.faculty)
  if (searchParams.degree) params.set('degree', searchParams.degree)
  if (params.get(key) === value) params.delete(key)
  else params.set(key, value)
  return `/programs${params.size ? `?${params}` : ''}`
}

export default async function ProgramsPage({ searchParams }: { searchParams: { faculty?: string; degree?: string; q?: string } }) {
  const { programs, loadError } = await getPrograms(searchParams)

  const grouped = programs.reduce((acc, prog) => {
    if (!acc[prog.faculty]) acc[prog.faculty] = []
    acc[prog.faculty].push(prog)
    return acc
  }, {} as Record<string, Program[]>)

  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Choose a study route</p>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sn-control bg-sn-primary-bg">
            <BookOpen className="h-5 w-5 text-sn-primary" />
          </span>
          <h1 className="font-baloo text-3xl font-extrabold leading-tight text-sn-ink sm:text-4xl">University programs</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Understand study routes, eligibility, fees and colleges from +2 through postgraduate level.</p>
      </div>

      <SearchField placeholder="Search programs by name…" redirectTo="/programs" initialValue={searchParams.q} className="mb-5" />

      <ProgramFinderBanner className="mb-6" />

      {/* Faculty Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={searchParams.q ? `/programs?q=${encodeURIComponent(searchParams.q)}` : '/programs'} className={`rounded-sn-pill border px-4 py-1.5 text-sm font-bold font-nunito transition-colors ${!searchParams.faculty ? 'border-sn-primary bg-sn-primary text-white' : 'border-sn-border bg-sn-surface text-sn-ink-soft hover:border-sn-primary/50'}`}>
          All Faculties
        </Link>
        {FACULTIES.map((f) => {
          const Icon = FACULTY_ICONS[f.slug] ?? BookOpen
          const active = searchParams.faculty === f.slug
          return (
            <Link
              key={f.slug}
              href={filterUrl(searchParams, 'faculty', f.slug)}
              className={`inline-flex items-center gap-1.5 rounded-sn-pill border px-4 py-1.5 text-sm font-bold font-nunito transition-colors ${
                active
                  ? 'border-sn-primary bg-sn-primary text-white'
                  : 'border-sn-border bg-sn-surface text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.name}
            </Link>
          )
        })}
      </div>

      {/* Degree Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {DEGREE_LEVELS.map(({ label, value }) => (
          <Link
            key={value}
            href={filterUrl(searchParams, 'degree', value)}
            className={`rounded-sn-pill border px-3 py-1 text-xs font-bold font-nunito transition-colors ${
              searchParams.degree === value
                ? 'border-sn-ink bg-sn-ink text-white'
                : 'border-sn-border bg-sn-surface text-sn-ink-soft hover:border-sn-ink-muted'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {(searchParams.faculty || searchParams.degree) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-sn-ink-muted">Active filters:</span>
          {searchParams.faculty && <Link href={filterUrl(searchParams, 'faculty', searchParams.faculty)} className="rounded-sn-pill bg-sn-primary-bg px-3 py-1 font-bold text-sn-primary-hover">Faculty: {FACULTIES.find(item => item.slug === searchParams.faculty)?.name || searchParams.faculty} ×</Link>}
          {searchParams.degree && <Link href={filterUrl(searchParams, 'degree', searchParams.degree)} className="rounded-sn-pill bg-sn-surface-alt px-3 py-1 font-bold text-sn-ink-soft">Level: {searchParams.degree === '+2' ? '+2' : searchParams.degree} ×</Link>}
        </div>
      )}

      {loadError ? (
        <div className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg py-14 text-center text-sn-confirm-ink">
          <AlertCircle className="mx-auto h-10 w-10" />
          <h2 className="mt-3 font-baloo text-xl font-bold">Programs could not load</h2>
          <p className="mt-2 text-sm">This is a temporary connection problem. Please try again.</p>
          <Link href="/programs" className="mt-4 inline-flex rounded-sn-control bg-sn-ink px-4 py-2 text-sm font-bold text-white">Reload programs</Link>
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([faculty, progs]) => (
            <div key={faculty}>
              {(() => {
                const matched = FACULTIES.find((f) => f.name.toLowerCase().includes(faculty.toLowerCase().split(' ')[0]))
                const Icon = matched ? (FACULTY_ICONS[matched.slug] ?? BookOpen) : BookOpen
                return (
                  <h2 className="mb-4 flex items-center gap-2 font-baloo text-xl font-bold text-sn-ink">
                    <Icon className="h-5 w-5 flex-shrink-0 text-sn-primary" />
                    {faculty}
                    <Pill tone="neutral">{progs.length}</Pill>
                  </h2>
                )
              })()}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {progs.map((prog) => (
                  <div key={prog.id} className="group rounded-sn-control border border-sn-border bg-sn-surface p-4 transition-colors duration-150 hover:border-sn-primary/40">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/programs/${prog.slug}`} className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-sn-ink transition-colors group-hover:text-sn-primary">{prog.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <Pill tone="primary" className="capitalize">{prog.degree_level}</Pill>
                          <span className="text-xs text-sn-ink-muted">{prog.duration}</span>
                        </div>
                      </Link>
                      <Link
                        href={`/colleges/program/${prog.slug}`}
                        className="flex-shrink-0 whitespace-nowrap text-xs font-bold text-sn-primary hover:underline"
                      >
                        Find Colleges
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-sn-card border border-sn-border bg-sn-surface py-16 text-center">
          <Mascot pose="point" size={72} className="mx-auto mb-3" />
          <h3 className="mb-1 font-baloo font-bold text-sn-ink">No programs found</h3>
          <p className="mt-2 text-sm text-sn-ink-soft">Try a shorter name or remove one filter.</p>
          <Link href="/programs" className="mt-4 inline-flex rounded-sn-control bg-sn-primary px-4 py-2 text-sm font-bold text-white hover:bg-sn-primary-hover">Clear search and filters</Link>
        </div>
      )}
    </div>
  )
}
