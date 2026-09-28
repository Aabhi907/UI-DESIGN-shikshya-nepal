import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import HeroSearch from '@/components/ui/HeroSearch'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import EmailSubscribe from '@/components/notifications/EmailSubscribe'
import type { Result, Notice, College } from '@/types'
import type { Admission } from '@/types'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import Mascot from '@/components/design-system/Mascot'
import Card from '@/components/design-system/Card'
import IconTile from '@/components/design-system/IconTile'
import SectionHeader from '@/components/design-system/SectionHeader'
import Button from '@/components/design-system/Button'
import FeaturedCollegeCard, { CAMPUS_FALLBACK_IMAGES } from '@/components/design-system/FeaturedCollegeCard'
import {
  Building2,
  FileText,
  Bell,
  CalendarCheck2,
  CalendarClock,
  Award,
  ArrowRight,
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
  Calculator,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'plus-two':    BookOpen,
  'it':          Monitor,
  'management':  BarChart3,
  'engineering': Wrench,
  'medical':     HeartPulse,
  'humanities':  BookOpen,
  'science':     FlaskConical,
  'education':   GraduationCap,
  'law':         Scale,
  'nursing':     Stethoscope,
  'agriculture': Sprout,
  'forestry':    TreePine,
  'architecture':Building2,
}
const FACULTY_TINTS: Array<'mint' | 'peach' | 'butter' | 'lilac'> = ['peach', 'mint', 'butter', 'lilac']

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: { absolute: 'SikshyaNepal: Decide What to Study After +2, and Where' },
  description:
    'Verified colleges, courses and career pathways for +2 and university in Nepal. Every fact sourced and dated. No fake reviews, no guesswork.',
  alternates: { canonical: '/' },
}

const UNIVERSITY_SHOWCASE = [
  { short: 'TU',   label: 'Tribhuvan University',  affiliation: 'Tribhuvan University' },
  { short: 'KU',   label: 'Kathmandu University',  affiliation: 'Kathmandu University' },
  { short: 'PU',   label: 'Pokhara University',    affiliation: 'Pokhara University' },
  { short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University' },
]

// Consistent container + gutter + section rhythm, used on every major section
// on this page: 20/32/48px side gutters, ~1200px content width, 64px→96px
// vertical beat. See design-system/sikshyanepal/MASTER.md.
const CONTAINER = 'mx-auto max-w-sn px-5 sm:px-8 lg:px-12'
const SECTION_PAD = 'py-16 lg:py-24'

async function getHomeData() {
  const supabase = createServerSupabaseClient()

  const [
    admissionsRes, resultsRes, noticesRes, collegesRes,
    collegeCountRes, programCountRes, universityCountRes,
    tuCountRes, kuCountRes, puCountRes, purUCountRes,
  ] = await Promise.all([
    supabase
      .from('admissions')
      .select('*, college:colleges(id,name,slug,location)')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('application_deadline', { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false, nullsFirst: false })
      .limit(6),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false, nullsFirst: false })
      .limit(6),
    supabase.from('colleges').select('id,name,slug,location,district,province,local_level,affiliation,logo_url,cover_url,is_featured,verification_status,programs_offered,education_levels,is_sponsored,sponsor_label,sponsor_starts_at,sponsor_ends_at,sponsor_disclosure').eq('is_featured', true).or('status.eq.active,status.is.null').order('name').limit(6),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
    supabase.from('programs').select('id',  { count: 'exact', head: true }),
    supabase.from('universities').select('id', { count: 'exact', head: true }),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Tribhuvan%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Kathmandu%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Pokhara%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Purbanchal%'),
  ])

  const collegeCount = collegeCountRes.count ?? 0
  const programCount = programCountRes.count ?? 0
  const universityCount = universityCountRes.count ?? 0

  const heroStats = [
    { label: 'Colleges',     value: collegeCount },
    { label: 'Programs',     value: programCount },
    { label: 'Universities', value: universityCount },
  ].filter(stat => stat.value > 0)

  const universityCounts: Record<string, number> = {
    TU:   tuCountRes.count   ?? 0,
    KU:   kuCountRes.count   ?? 0,
    PU:   puCountRes.count   ?? 0,
    PurU: purUCountRes.count ?? 0,
  }

  return {
    admissions:       (admissionsRes.data || []) as Admission[],
    results:          (resultsRes.data  || []) as Result[],
    notices:          (noticesRes.data  || []) as Notice[],
    featuredColleges: (collegesRes.data || []) as College[],
    heroStats,
    universityCounts,
  }
}

// ── Hero sidebar card — Apple hardware framed live updates ──────────
function HeroCard({
  result, notice, college,
}: {
  result:  { title: string; slug: string } | null
  notice:  { title: string; slug: string } | null
  college: { name: string; slug: string; location?: string | null; cover_url?: string | null } | null
}) {
  if (!result && !notice && !college) return null

  const collegeCover = college?.cover_url || (college ? CAMPUS_FALLBACK_IMAGES[0] : null)

  return (
    <aside className="apple-card overflow-hidden !rounded-[18px]">
      {college && collegeCover && (
        <Link href={`/colleges/${college.slug}`} className="group relative block h-48 overflow-hidden bg-sn-surface-alt" aria-label={`View ${college.name}`}>
          <Image
            src={collegeCover}
            alt={`${college.name} campus`}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
            <span className="apple-glass rounded-full px-2.5 py-1 text-[11px] font-bold font-nunito text-sn-ink shadow-sm">
              Featured campus
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="font-baloo text-base sm:text-lg font-bold leading-tight drop-shadow-sm line-clamp-1 group-hover:text-amber-200 transition-colors">
              {college.name}
            </p>
            {college.location && (
              <p className="text-xs font-nunito text-white/80 mt-0.5 line-clamp-1">{college.location}</p>
            )}
          </div>
        </Link>
      )}
      <div className="p-4 sm:p-5 space-y-1">
        {result && (
          <Link href={`/results/${result.slug}`} className="group flex items-start justify-between gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-sn-surface-alt/70">
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-bold font-nunito text-sn-primary-hover mb-0.5">Latest result</span>
              <p className="text-sm font-bold font-nunito leading-snug line-clamp-1 text-sn-ink group-hover:text-sn-primary transition-colors">{result.title}</p>
            </div>
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sn-surface-alt text-sn-ink group-hover:bg-sn-primary group-hover:text-white transition-all duration-200">
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </Link>
        )}
        {notice && (
          <Link href={`/notices/${notice.slug}`} className="group flex items-start justify-between gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-sn-surface-alt/70">
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-bold font-nunito text-sn-primary-hover mb-0.5">Latest notice</span>
              <p className="text-sm font-bold font-nunito leading-snug line-clamp-1 text-sn-ink group-hover:text-sn-primary transition-colors">{notice.title}</p>
            </div>
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sn-surface-alt text-sn-ink group-hover:bg-sn-primary group-hover:text-white transition-all duration-200">
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>
    </aside>
  )
}

export default async function HomePage() {
  const { admissions, results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  const latestResult  = results[0]
  const latestNotice  = notices[0]
  const featuredCollege = featuredColleges[0] ?? null
  const hasProofContent = admissions.length > 0 || results.length > 0 || notices.length > 0 || featuredColleges.length > 0

  return (
    <div>
      {/* ════════════════════════════════════════════════════════
          1. HERO — Apple Clean Minimal Architecture
      ════════════════════════════════════════════════════════ */}
      <section className={`relative border-b border-sn-border bg-sn-ground overflow-hidden ${SECTION_PAD}`}>
        {/* Apple radial ambient glow */}
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[580px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-200/35 via-amber-100/20 to-transparent blur-3xl" aria-hidden="true" />

        <div className={`${CONTAINER} relative`}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Left Column: Value Prop, Typography & Search */}
            <div className="lg:col-span-7">
              <div className="apple-pill mb-6 shadow-sm">
                <Mascot pose="wave" size={24} />
                <span className="text-xs font-bold font-nunito text-sn-ink">An independent education guide for Nepal</span>
              </div>

              <h1 className="font-baloo font-extrabold text-sn-ink leading-[1.04] mb-5 text-balance tracking-[-0.038em]" style={{ fontSize: 'clamp(2.6rem, 5.8vw, 4.1rem)' }}>
                Decide what to study after +2, and where.
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-relaxed font-nunito text-sn-ink-soft md:text-xl">
                Verified colleges, courses and career pathways for +2 and university in Nepal. Sourced, dated and unbiased.
              </p>

              <HeroSearch />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button.Link
                  href="/colleges"
                  variant="primary"
                  className="group rounded-full px-6 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(224,102,58,0.28)] transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_28px_rgba(224,102,58,0.36)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Find your college</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Button.Link>
                <Button.Link
                  href="/programs"
                  variant="secondary"
                  className="rounded-full px-6 py-3 border-black/[0.08] bg-white/80 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] hover:border-black/[0.15] hover:bg-white transition-all duration-200"
                >
                  Explore programs
                </Button.Link>
              </div>
            </div>

            {/* Right Column: Hardware-Framed Live Showcase Card */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="apple-shell">
                <HeroCard result={latestResult ?? null} notice={latestNotice ?? null} college={featuredCollege} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. STATS STRIP — Apple clean minimal luminous ribbon
      ════════════════════════════════════════════════════════ */}
      {heroStats.length > 0 && (
        <section className="border-y border-black/[0.06] bg-white/75 backdrop-blur-md py-8 lg:py-10">
          <div className={CONTAINER}>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-black/[0.06]">
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center sm:px-6">
                  <p className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink tabular-nums tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 font-nunito text-xs sm:text-sm font-bold text-sn-ink-muted">
                    {stat.label} cataloged &amp; dated
                  </p>
                </div>
              ))}
              <div className="text-center sm:px-6">
                <p className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-primary tabular-nums tracking-tight">
                  100%
                </p>
                <p className="mt-1 font-nunito text-xs sm:text-sm font-bold text-sn-ink-muted">
                  Independent student guidance
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          3. WHAT DO YOU NEED TODAY — asymmetric bento path-in
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-surface-alt ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader
            title="What do you need today?"
            action={<Link href="/search" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">Search everything →</Link>}
          />
          <div className="mt-8 lg:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
            {/* Focal Point 1: Results (wide bento) */}
            <Link
              href="/results"
              className="apple-card group relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 col-span-1 sm:col-span-1 lg:col-span-3 bg-gradient-to-br from-sn-tint-peach/35 via-sn-surface to-sn-surface border-sn-tint-peach/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <IconTile icon={FileText} tint="peach" size={40} />
                <span className="rounded-full bg-sn-tint-peach/60 border border-sn-tint-peach px-2.5 py-1 text-xs font-bold font-nunito text-sn-ink">
                  TU · KU · NEB
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                    Check results
                  </h3>
                  <ArrowRight className="h-4 w-4 motion-arrow text-sn-primary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Search published board results, roll number lookups, and mark sheet archives.
                </p>
              </div>
            </Link>

            {/* Focal Point 2: Admissions (wide bento) */}
            <Link
              href="/admissions?deadline=open"
              className="apple-card group relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 col-span-1 sm:col-span-1 lg:col-span-3 bg-gradient-to-br from-sn-tint-mint/35 via-sn-surface to-sn-surface border-sn-tint-mint/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <IconTile icon={CalendarCheck2} tint="mint" size={40} />
                <span className="rounded-full bg-sn-tint-mint/60 border border-sn-tint-mint px-2.5 py-1 text-xs font-bold font-nunito text-sn-ink">
                  Live &amp; open
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                    Admissions
                  </h3>
                  <ArrowRight className="h-4 w-4 motion-arrow text-sn-primary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Active college intake deadlines, entrance eligibility, and application guidelines.
                </p>
              </div>
            </Link>

            {/* 6 Supporting Bento Cards */}
            {[
              { href: '/colleges', label: 'Find a college', text: '+2 and university level', Icon: GraduationCap, tint: 'lilac' as const },
              { href: '/scholarships', label: 'Scholarships', text: 'Government & merit funding', Icon: Award, tint: 'peach' as const },
              { href: '/entrance-exams', label: 'Entrance exams', text: 'Eligibility & syllabus', Icon: CalendarClock, tint: 'mint' as const },
              { href: '/tools/gpa-calculator', label: 'GPA calculator', text: 'SEE, +2 & university scales', Icon: Calculator, tint: 'butter' as const },
              { href: '/study-resources', label: 'Study resources', text: 'Past papers & notes', Icon: BookOpen, tint: 'butter' as const },
              { href: '/notices', label: 'Latest notices', text: 'Direct official updates', Icon: Bell, tint: 'lilac' as const },
            ].map(({ href, label, text, Icon, tint }) => (
              <Link
                key={href}
                href={href}
                className="apple-card group p-5 col-span-1 sm:col-span-1 lg:col-span-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <IconTile icon={Icon} tint={tint} size={32} />
                <p className="mt-3.5 text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary transition-colors">{label}</p>
                <p className="mt-1 text-xs font-nunito text-sn-ink-muted">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BROWSE — capsule pill-strip & elevated metrics
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader title="Browse by program or university" />

          {/* 4A. Faculties: Sleek horizontal pill-strip */}
          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By program</h3>
              <Link href="/programs" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All programs</Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {FACULTIES.map((faculty, index) => {
                const Icon = FACULTY_ICONS[faculty.slug] ?? Monitor
                const href = faculty.slug === 'plus-two' ? '/colleges?level=%2B2' : `/programs?faculty=${faculty.slug}`
                const tint = FACULTY_TINTS[index % FACULTY_TINTS.length]
                const tintBg = tint === 'peach'
                  ? 'bg-sn-tint-peach'
                  : tint === 'mint'
                  ? 'bg-sn-tint-mint'
                  : tint === 'butter'
                  ? 'bg-sn-tint-butter'
                  : 'bg-sn-tint-lilac'

                return (
                  <Link
                    key={faculty.slug}
                    href={href}
                    className="apple-pill group flex items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:border-sn-ink/20 hover:bg-sn-surface hover:shadow-sm"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] ${tintBg}`}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary transition-colors">
                      {faculty.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 4B. Universities: Elevated metric rows with prominent tabular counts */}
          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By university</h3>
              <Link href="/colleges" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All affiliated colleges</Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {UNIVERSITY_SHOWCASE.map((u, index) => {
                const count = universityCounts[u.short] ?? 0
                const tint = ['bg-sn-tint-peach', 'bg-sn-tint-mint', 'bg-sn-tint-butter', 'bg-sn-tint-lilac'][index % 4]
                return (
                  <Link
                    key={u.short}
                    href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                    className="apple-card group flex items-center justify-between gap-3.5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-baloo text-base font-bold text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-black/[0.04] ${tint}`}>
                        {u.short}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-nunito leading-snug text-sn-ink group-hover:text-sn-primary transition-colors truncate">
                          {u.label}
                        </p>
                        <p className="text-xs font-nunito text-sn-ink-muted truncate">
                          {u.affiliation}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full border border-black/[0.08] bg-sn-surface-alt px-2.5 py-1 text-xs font-bold font-nunito tabular-nums text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] group-hover:border-sn-primary/30 group-hover:text-sn-primary transition-colors">
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. SEE IT IN ACTION — proof: open admissions, live results
          and notices, featured colleges. Sub-groups only render when
          they have real content.
      ════════════════════════════════════════════════════════ */}
      {hasProofContent && (
        <section className={`border-b border-sn-border bg-sn-surface ${SECTION_PAD}`}>
          <div className={CONTAINER}>
            <SectionHeader title="See it in action" description="A sample of what's live on the platform right now. Sourced and dated, not a static list." />

            {admissions.length > 0 && (
              <div className="mt-8 lg:mt-10">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="font-baloo text-lg font-bold text-sn-ink">Admissions open now</h3>
                  <Link href="/admissions" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All admissions</Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">{admissions.map((admission) => <AdmissionCard key={admission.id} admission={admission} />)}</div>
              </div>
            )}

            {(results.length > 0 || notices.length > 0) && (
              <div className="mt-8 lg:mt-10">
                <h3 className="font-baloo text-lg font-bold text-sn-ink">Latest results &amp; notices</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <Card className="!p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconTile icon={FileText} tint="peach" size={28} />
                        <span className="text-sm font-bold font-nunito text-sn-ink">Latest Results</span>
                      </div>
                      <Link href="/results" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                    </div>
                    {results.length > 0 ? (
                      <div>{results.slice(0, 4).map((r) => <ResultCard key={r.id} result={r} compact />)}</div>
                    ) : (
                      <p className="text-sm font-nunito text-sn-ink-muted py-6 text-center">No results yet</p>
                    )}
                  </Card>

                  <Card className="!p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconTile icon={Bell} tint="butter" size={28} />
                        <span className="text-sm font-bold font-nunito text-sn-ink">University Notices</span>
                      </div>
                      <Link href="/notices" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                    </div>
                    {notices.length > 0 ? (
                      <div>{notices.slice(0, 4).map((n) => <NoticeCard key={n.id} notice={n} compact />)}</div>
                    ) : (
                      <p className="text-sm font-nunito text-sn-ink-muted py-6 text-center">No notices yet</p>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {featuredColleges.length > 0 && (
              <div className="mt-8 lg:mt-10">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="font-baloo text-lg font-bold text-sn-ink">Featured colleges</h3>
                  <Link href="/colleges" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {featuredColleges.slice(0, 6).map((college) => <FeaturedCollegeCard key={college.id} college={college} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          6. GET STARTED — Apple Verification & Alert Center
      ════════════════════════════════════════════════════════ */}
      <section className={`border-t border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="apple-shell">
            <div className="apple-card relative overflow-hidden !rounded-[20px] bg-white p-8 sm:p-12 lg:p-16 text-center shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9),0_8px_32px_rgba(15,23,42,0.06)]">
              {/* Subtle warm accent radial background */}
              <div className="pointer-events-none absolute -top-24 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent blur-2xl" aria-hidden="true" />

              <div className="relative">
                <h2 className="font-baloo font-extrabold text-sn-ink text-3xl sm:text-4xl mb-3 tracking-[-0.02em]">
                  Check the current notice before you pay.
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-sn-ink-soft font-nunito text-sm sm:text-base leading-relaxed">
                  Fees, seats and deadlines can change. Each college profile shows its source and last-checked date when available.
                </p>
                <div className="flex flex-wrap justify-center gap-3.5">
                  <Button.Link
                    href="/colleges"
                    variant="primary"
                    className="group rounded-full px-6 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(224,102,58,0.28)] transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_28px_rgba(224,102,58,0.36)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Search all institutions</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </Button.Link>
                  <Link
                    href="/results"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white/80 px-6 py-3 text-sm font-bold font-nunito text-sn-ink transition-all hover:bg-white hover:border-black/[0.15] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] motion-control"
                  >
                    Check results
                  </Link>
                </div>

                <div className="mx-auto mt-10 max-w-md border-t border-black/[0.06] pt-8 lg:mt-12 lg:pt-10">
                  <p className="font-bold font-nunito text-sm text-sn-ink flex items-center gap-2 justify-center">
                    <Bell className="w-4 h-4 text-sn-primary" aria-hidden="true" />
                    Get result alerts in your inbox
                  </p>
                  <p className="text-sn-ink-muted text-xs font-nunito mt-1 mb-5">
                    Email updates when a new result or notice is published
                  </p>
                  <EmailSubscribe />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
