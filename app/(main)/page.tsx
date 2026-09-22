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
import FeaturedCollegeCard from '@/components/design-system/FeaturedCollegeCard'
import {
  Building2,
  School,
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
  title: { absolute: 'SikshyaNepal — Decide What to Study After +2, and Where' },
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
    schoolCountRes, collegeCountRes, programCountRes, universityCountRes,
    tuCountRes, kuCountRes, puCountRes, purUCountRes,
  ] = await Promise.all([
    supabase
      .from('admissions')
      .select('*, school:schools(id,name,slug,district,province), college:colleges(id,name,slug,location)')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('application_deadline', { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase.from('colleges').select('*').eq('is_featured', true).or('status.eq.active,status.is.null').order('name').limit(6),
    supabase.from('schools').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
    supabase.from('programs').select('id',  { count: 'exact', head: true }),
    supabase.from('universities').select('id', { count: 'exact', head: true }),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Tribhuvan%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Kathmandu%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Pokhara%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Purbanchal%'),
  ])

  const collegeCount = collegeCountRes.count ?? 0
  const schoolCount = schoolCountRes.count ?? 0
  const programCount = programCountRes.count ?? 0
  const universityCount = universityCountRes.count ?? 0

  const heroStats = [
    { label: 'Schools',      value: schoolCount },
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

// ── Hero sidebar card — 3 clean list items ─────────────────────────
function HeroCard({
  result, notice, college,
}: {
  result:  { title: string; slug: string } | null
  notice:  { title: string; slug: string } | null
  college: { name: string; slug: string; location?: string | null; cover_url?: string | null } | null
}) {
  if (!result && !notice && !college) return null

  return (
    <aside className="overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface shadow-sn-float">
      {college?.cover_url && (
        <Link href={`/colleges/${college.slug}`} className="group relative block h-44 overflow-hidden bg-sn-surface-alt" aria-label={`View ${college.name}`}>
          <Image
            src={college.cover_url}
            alt={`${college.name} campus`}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-sn-ink/85 px-4 py-2.5 text-xs font-bold font-nunito text-white">
            Featured college · {college.name}
          </div>
        </Link>
      )}
      <div className="p-5">
        {result && (
          <Link href={`/results/${result.slug}`} className="group block py-3.5 border-b border-sn-border">
            <p className="mb-1 text-xs font-bold font-nunito text-sn-ink-muted">Latest Result</p>
            <p className="text-sm font-bold font-nunito leading-snug line-clamp-2 text-sn-ink group-hover:text-sn-primary">{result.title}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold font-nunito text-sn-primary">View result <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
          </Link>
        )}
        {notice && (
          <Link href={`/notices/${notice.slug}`} className="group block py-3.5 border-b border-sn-border">
            <p className="mb-1 text-xs font-bold font-nunito text-sn-ink-muted">Latest Notice</p>
            <p className="text-sm font-bold font-nunito leading-snug line-clamp-2 text-sn-ink group-hover:text-sn-primary">{notice.title}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold font-nunito text-sn-primary">Read notice <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
          </Link>
        )}
        {college && (
          <Link href={`/colleges/${college.slug}`} className="block py-3.5 group">
            <p className="mb-1 text-xs font-bold font-nunito text-sn-ink-muted">Featured College</p>
            <p className="text-sm font-bold font-nunito leading-snug line-clamp-2 text-sn-ink group-hover:text-sn-primary transition-colors">{college.name}</p>
            {college.location && <p className="text-xs font-nunito text-sn-ink-muted mt-1">{college.location}</p>}
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
          1. HERO
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16 items-center">
            <div className="lg:col-span-3">
              <div className="mb-5 flex items-center gap-3">
                <Mascot pose="wave" size={52} />
                <p className="border-l-2 border-sn-primary pl-3 text-sm font-bold font-nunito text-sn-primary-hover">
                  An independent education guide for Nepal
                </p>
              </div>

              <h1 className="font-baloo font-extrabold text-sn-ink leading-[1.08] mb-5 text-balance" style={{ fontSize: 'clamp(2.4rem, 5.2vw, 3.6rem)', letterSpacing: '-0.02em' }}>
                Decide what to study after +2 — and where.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 font-nunito text-sn-ink-soft md:text-xl">
                Verified colleges, courses and career pathways for +2 and university in Nepal. Every fact sourced and dated. No fake reviews, no guesswork.
              </p>

              <HeroSearch />

              <div className="mt-8 flex flex-wrap gap-3">
                <Button.Link href="/tools/college-finder" variant="primary">Start your pathway<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button.Link>
                <Button.Link href="/colleges" variant="secondary">Browse colleges</Button.Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link href="/schools" className="group rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card transition hover:shadow-sn-float">
                  <div className="flex items-start gap-3">
                    <IconTile icon={School} tint="mint" />
                    <div>
                      <p className="font-bold font-nunito text-sn-ink">Looking for a school?</p>
                      <p className="mt-1 text-xs leading-5 font-nunito text-sn-ink-soft">ECD to Grade 10, for parents and guardians.</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold font-nunito text-sn-primary">Find a school <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    </div>
                  </div>
                </Link>
                <Link href="/colleges" className="group rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card transition hover:shadow-sn-float">
                  <div className="flex items-start gap-3">
                    <IconTile icon={GraduationCap} tint="peach" />
                    <div>
                      <p className="font-bold font-nunito text-sn-ink">Planning after SEE or +2?</p>
                      <p className="mt-1 text-xs leading-5 font-nunito text-sn-ink-soft">Explore +2, Bachelor, Master and diploma options.</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold font-nunito text-sn-primary">Find a college <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-2">
              <HeroCard result={latestResult ?? null} notice={latestNotice ?? null} college={featuredCollege} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. TRUST STRIP — a thin accent band, not a full section;
          the platform's own real counts, not a third-party claim.
      ════════════════════════════════════════════════════════ */}
      {heroStats.length > 0 && (
        <section className="bg-sn-ink py-10 lg:py-12">
          <div className={CONTAINER}>
            <div className="flex flex-wrap justify-center gap-0 divide-x divide-white/15 sm:justify-between">
              {heroStats.map((stat) => (
                <div key={stat.label} className="px-8 py-2 text-center">
                  <p className="font-baloo text-2xl leading-none text-white tabular-nums" style={{ letterSpacing: '-0.01em' }}>
                    <span className="font-extrabold">{stat.value.toLocaleString()}</span>{' '}
                    <span className="font-nunito font-normal text-white/60">{stat.label.toLowerCase()}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          3. WHAT DO YOU NEED TODAY — primary path-in
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-surface-alt ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader
            title="What do you need today?"
            action={<Link href="/search" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">Search everything →</Link>}
          />
          <div className="mt-8 lg:mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {[
              { href: '/results', label: 'Check results', text: 'TU, KU, NEB & more', Icon: FileText, tint: 'peach' as const },
              { href: '/admissions?deadline=open', label: 'Admissions', text: 'Open & upcoming', Icon: CalendarCheck2, tint: 'mint' as const },
              { href: '/schools', label: 'Find a school', text: 'ECD to Grade 10', Icon: School, tint: 'butter' as const },
              { href: '/colleges', label: 'Find a college', text: '+2 and higher', Icon: GraduationCap, tint: 'lilac' as const },
              { href: '/scholarships', label: 'Scholarships', text: 'Funding options', Icon: Award, tint: 'peach' as const },
              { href: '/entrance-exams', label: 'Entrance exams', text: 'Dates & eligibility', Icon: CalendarClock, tint: 'mint' as const },
              { href: '/study-resources', label: 'Study resources', text: 'Syllabus & questions', Icon: BookOpen, tint: 'butter' as const },
              { href: '/notices', label: 'Latest notices', text: 'Official updates', Icon: Bell, tint: 'lilac' as const },
            ].map(({ href, label, text, Icon, tint }) => (
              <Link key={href} href={href} className="group rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card transition hover:shadow-sn-float">
                <IconTile icon={Icon} tint={tint} size={36} />
                <p className="mt-3 text-sm font-bold font-nunito text-sn-ink">{label}</p>
                <p className="mt-1 text-xs font-nunito text-sn-ink-muted">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BROWSE — program and university entry points, merged
          into one section with two sub-groups (24-32px apart)
          instead of two full-rhythm sections.
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader title="Browse by program or university" />

          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By program</h3>
              <Link href="/programs" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All programs</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 lg:gap-6">
              {FACULTIES.map((faculty, index) => {
                const Icon = FACULTY_ICONS[faculty.slug] ?? Monitor
                const href = faculty.slug === 'plus-two' ? '/colleges?level=%2B2' : `/programs?faculty=${faculty.slug}`
                return (
                  <Link key={faculty.slug} href={href} className="group flex flex-col items-center gap-3 rounded-sn-card border border-sn-border bg-sn-surface p-5 text-center shadow-sn-card transition hover:shadow-sn-float">
                    <IconTile icon={Icon} tint={FACULTY_TINTS[index % FACULTY_TINTS.length]} />
                    <span className="text-sm font-bold font-nunito leading-tight text-sn-ink group-hover:text-sn-primary">{faculty.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By university</h3>
              <Link href="/colleges" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All colleges</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              {UNIVERSITY_SHOWCASE.map((u, index) => {
                const count = universityCounts[u.short] ?? 0
                return (
                  <Link key={u.short} href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`} className="group flex flex-col gap-3 rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card transition hover:shadow-sn-float">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-sn-control font-baloo text-lg font-bold text-sn-ink ${['bg-sn-tint-peach', 'bg-sn-tint-mint', 'bg-sn-tint-butter', 'bg-sn-tint-lilac'][index % 4]}`}>{u.short}</span>
                    <div>
                      <p className="text-sm font-bold font-nunito leading-tight text-sn-ink">{u.label}</p>
                      {count > 0 && <p className="text-xs font-nunito text-sn-ink-muted mt-1">{count} college{count !== 1 ? 's' : ''}</p>}
                    </div>
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
            <SectionHeader title="See it in action" description="A sample of what's live on the platform right now — sourced and dated, not a static list." />

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
          6. GET STARTED — final CTA + email capture, one section
      ════════════════════════════════════════════════════════ */}
      <section className={`bg-sn-ink text-center ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <p className="font-baloo font-extrabold text-white text-3xl sm:text-4xl mb-3" style={{ letterSpacing: '-0.02em' }}>Check the current notice before you pay.</p>
          <p className="mx-auto mb-8 max-w-2xl text-white/60 font-nunito text-sm">Fees, seats and deadlines can change. Each college profile shows its source and last-checked date when available.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button.Link href="/colleges" variant="primary">Browse colleges</Button.Link>
            <Link href="/results" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sn-control border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold font-nunito text-white transition-colors hover:bg-white/15">Check Results</Link>
          </div>

          <div className="mx-auto mt-12 max-w-md border-t border-white/10 pt-10 lg:mt-16 lg:pt-12">
            <p className="font-bold font-nunito text-sm text-white flex items-center gap-2 justify-center"><Bell className="w-4 h-4" aria-hidden="true" />Get result alerts in your inbox</p>
            <p className="text-white/60 text-xs font-nunito mt-1 mb-5">Email updates when a new result or notice is published</p>
            <EmailSubscribe />
          </div>
        </div>
      </section>
    </div>
  )
}
