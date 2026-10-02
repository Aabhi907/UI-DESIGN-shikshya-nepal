import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import Hero from '@/components/home/Hero'
import StudentCompanionShowcase from '@/components/home/StudentCompanionShowcase'
import ShikshyaWhatMakesUsDifferent from '@/components/home/ShikshyaWhatMakesUsDifferent'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import UpdatesAndAlerts from '@/components/home/UpdatesAndAlerts'
import type { Result, Notice, College } from '@/types'
import type { Admission } from '@/types'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import Card from '@/components/design-system/Card'
import IconTile from '@/components/design-system/IconTile'
import SectionHeader from '@/components/design-system/SectionHeader'
import FeaturedCollegeCard from '@/components/design-system/FeaturedCollegeCard'
import TestimonialsColumns from '@/components/home/TestimonialsColumns'
import HomeScrollMotion from '@/components/home/HomeScrollMotion'
import StudentToolsDock from '@/components/home/StudentToolsDock'
import {
  Building2,
  FileText,
  Bell,
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
  title: { absolute: 'ShikshyaXNepal: Decide What to Study After +2, and Where' },
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

export default async function HomePage() {
  const { admissions, results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  const hasProofContent = admissions.length > 0 || results.length > 0 || notices.length > 0 || featuredColleges.length > 0

  return (
    <div>
      <HomeScrollMotion />
      {/* ════════════════════════════════════════════════════════
          1. HERO — Himalayan Calm, Single Focused Action
      ════════════════════════════════════════════════════════ */}
      <Hero heroStats={heroStats} admissions={admissions} />

      {/* ════════════════════════════════════════════════════════
          2. MOBILE STUDENT COMPANION — Interactive Phone & Flanking Badges
      ════════════════════════════════════════════════════════ */}
      <StudentCompanionShowcase />

      {/* ════════════════════════════════════════════════════════
          3. WHAT MAKES US DIFFERENT FROM OTHERS — Floating Points in Air
      ════════════════════════════════════════════════════════ */}
      <ShikshyaWhatMakesUsDifferent />

      {/* ════════════════════════════════════════════════════════
          4. STUDENT TOOLS DOCK — Interactive Toolkit
      ════════════════════════════════════════════════════════ */}
      <StudentToolsDock />

      {/* ════════════════════════════════════════════════════════
          5. BROWSE — capsule pill-strip & elevated metrics
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
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
                    className="apple-pill group flex items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06] hover:shadow-sm"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${tintBg}`}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors">
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
                const tint = ['bg-sn-tint-peach text-primary dark:text-[#A9E0F1]', 'bg-sn-tint-mint text-emerald-800 dark:text-[#CAFFA6]', 'bg-sn-tint-butter text-amber-800 dark:text-[#F7F9E1]', 'bg-sn-tint-lilac text-indigo-800 dark:text-[#D9EEF7]'][index % 4]
                return (
                  <Link
                    key={u.short}
                    href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                    className="apple-card group flex items-center justify-between gap-3.5 p-4 rounded-[20px] backdrop-blur-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-baloo text-base font-bold shadow-sm border border-black/[0.06] dark:border-white/[0.08] ${tint} transition-transform duration-300 group-hover:scale-[1.05]`}>
                        {u.short}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-nunito leading-snug text-slate-900 dark:text-sn-ink group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors truncate">
                          {u.label}
                        </p>
                        <p className="text-xs font-nunito text-slate-500 dark:text-sn-ink-muted truncate">
                          {u.affiliation}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 text-xs font-bold font-nunito tabular-nums text-slate-700 dark:text-sn-ink shadow-sm group-hover:border-sn-primary/30 dark:group-hover:border-[#CAFFA6]/30 group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors">
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
        <section data-home-motion className={`border-b border-sn-border bg-sn-surface ${SECTION_PAD}`}>
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
          WHAT STUDENTS SAY — Clean 5-Star Testimonials (Matching Image 2)
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-sn-ink-muted font-nunito mb-2">Student perspectives</p>
            <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink tracking-tight">
              What students and counselors say
            </h2>
            <p className="mt-2 text-sm sm:text-base font-nunito text-sn-ink-soft">
              Feedback from students and counselors who use ShikshyaXNepal to plan their next step.
            </p>
          </div>

          <TestimonialsColumns />
        </div>
      </section>


      <UpdatesAndAlerts />
    </div>
  )
}
