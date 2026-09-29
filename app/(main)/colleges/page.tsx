import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import CollegeFilters from '@/components/colleges/CollegeFilters'
import CollegeSort from '@/components/colleges/CollegeSort'
import SearchField from '@/components/design-system/SearchField'
import ProgramFinderBanner from '@/components/design-system/ProgramFinderBanner'
import type { College, CollegeProgram, Review } from '@/types'
import { AlertCircle, Building2 } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '+2, Bachelor and Master Colleges in Nepal',
  description: 'Browse Nepal colleges for +2, Bachelor, Master, diploma and higher education. Filter by location, affiliation, faculty and level.',
  alternates: { canonical: '/colleges' },
}

// Extended type with server-computed fields the card needs
type RichCollege = College & {
  avg_rating?:   number
  review_count?: number
  fee_min?:      number
  fee_max?:      number
  fee_period?:   string
  has_published_fees?: boolean
  fee_source_url?: string | null
  fee_last_verified_at?: string | null
}

const directoryAnswers = [
  {
    question: 'What study levels are included in the Nepal college directory?',
    answer: 'The directory covers post-SEE education: +2, Bachelor, Master, diploma, certificate and other higher-education programmes. Use the level filter to narrow the listings.',
  },
  {
    question: 'How should I compare colleges in Nepal?',
    answer: 'Start with programme availability and affiliation, then compare location, published fees, scholarships, admission requirements and student reviews. Confirm changing details with the college before applying.',
  },
  {
    question: 'Does SikshyaNepal verify every college listing?',
    answer: 'Verification status is shown on individual college profiles. A source-verified profile links to documented source information; an unverified profile should be treated as a starting point and checked directly with the institution.',
  },
  {
    question: 'Can I compare college fees using this directory?',
    answer: 'Use published programme fees as an initial estimate, then check the stated fee period and what is included. Colleges may charge separate admission, examination, transport, hostel or laboratory fees, so confirm a complete written breakdown before paying.',
  },
  {
    question: 'How do I know whether a college is currently accepting applications?',
    answer: 'Open a college profile and check its admission section, or use the Admissions page. Admission dates can change, so confirm the deadline and application method on the linked official notice before submitting documents or payment.',
  },
]

const PAGE_SIZE = 18
const COLLEGE_BATCH_SIZE = 500
const MAX_DIRECTORY_COLLEGES = 5000
const SEARCH_CHARACTER = new RegExp('[\\p{L}\\p{M}\\p{N}+]', 'u')

function buildCollegePageUrl(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== 'page') params.set(key, value)
  })
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/colleges${query ? `?${query}` : ''}`
}

function normaliseSearch(value: string | null | undefined) {
  // Keep letters and combining marks from every script. The previous ASCII-only
  // cleanup turned searches such as “काठमाडौं” into an empty string.
  return (value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .split('')
    .map(character => SEARCH_CHARACTER.test(character) ? character : ' ')
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function normaliseLevel(value: string | null | undefined) {
  const level = normaliseSearch(value).replace(/\s+/g, '_')
  if (['+2', 'plus_2', 'plus_two', 'intermediate'].includes(level)) return 'plus_two'
  return level
}

function levelMatches(value: string | null | undefined, requested: string | null | undefined) {
  return normaliseLevel(value) === normaliseLevel(requested)
}

function affiliationAliases(value: string | null | undefined) {
  const affiliation = normaliseSearch(value)
  const aliases: string[] = []
  if (affiliation.includes('tribhuvan university')) aliases.push('tu')
  if (affiliation.includes('kathmandu university')) aliases.push('ku')
  if (affiliation.includes('pokhara university')) aliases.push('pu')
  if (affiliation.includes('purbanchal university')) aliases.push('puru')
  if (affiliation.includes('mid western university') || affiliation.includes('midwestern university')) aliases.push('mwu')
  if (affiliation.includes('far western university') || affiliation.includes('farwestern university')) aliases.push('fwu')
  return aliases
}

function collegeSearchScore(college: RichCollege, term: string) {
  const name = normaliseSearch(college.name)
  const programNames = (college.programs || []).map(item => normaliseSearch(item.program?.name))
  if (name === term) return 0
  if (name.startsWith(term)) return 1
  if (name.includes(term)) return 2
  if (programNames.some(program => program.startsWith(term))) return 3
  if (programNames.some(program => program.includes(term))) return 4
  if ([college.location, college.district, college.local_level].some(value => normaliseSearch(value).includes(term))) return 5
  if (normaliseSearch(college.affiliation).includes(term)) return 6
  if (normaliseSearch(college.programs_offered).includes(term)) return 7
  // Students often combine intent and place, for example “BCA Kathmandu”. Match
  // every word across the complete profile rather than requiring one field to
  // contain the exact full phrase.
  const searchable = [
    name,
    ...programNames,
    normaliseSearch(college.programs_offered),
    normaliseSearch(college.location),
    normaliseSearch(college.local_level),
    normaliseSearch(college.district),
    normaliseSearch(college.province),
    normaliseSearch(college.affiliation),
    ...affiliationAliases(college.affiliation),
  ].filter(Boolean).join(' ')
  const tokens = term.split(' ').filter(Boolean)
  if (tokens.length > 0 && tokens.every(token => searchable.includes(token))) return 8
  return 99
}

function profileCompleteness(college: RichCollege) {
  const checks = [
    college.location || college.district,
    college.affiliation,
    college.education_levels?.length,
    college.programs?.length,
    college.programs?.some(program => program.fee != null),
    college.last_verified_at,
    college.source_url,
  ]
  return checks.filter(Boolean).length
}

function sampleAwareRating(college: RichCollege) {
  if (college.avg_rating == null || !college.review_count) return -1
  // Five prior reviews at 3.5 prevent one unusually high or low review from
  // dominating colleges with a larger student-review sample.
  const priorRating = 3.5
  const priorWeight = 5
  return ((college.avg_rating * college.review_count) + (priorRating * priorWeight)) / (college.review_count + priorWeight)
}

function facultyMatches(value: string | null | undefined, requested: string) {
  const faculty = normaliseSearch(value)
  const target = normaliseSearch(requested)
  if (target === 'it') return /\b(it|computing|computer science|information technology)\b/.test(faculty)
  return faculty.includes(target)
}

function matchReasons(college: RichCollege, sp: { faculty?:string;level?:string;province?:string;district?:string;affiliation?:string;maxFee?:string;feePeriod?:string;scholarship?:string;verified?:string;program?:string }) {
  const reasons:string[]=[]
  if(sp.level)reasons.push(`Offers ${sp.level === '+2' ? '+2 / Intermediate' : sp.level.charAt(0).toUpperCase()+sp.level.slice(1)} study`)
  if(sp.faculty)reasons.push(`Has a ${sp.faculty} programme`)
  if(sp.program)reasons.push('Offers your selected programme')
  if(sp.district)reasons.push(`Located in ${sp.district}`);else if(sp.province)reasons.push(`Located in ${sp.province}`)
  if(sp.affiliation)reasons.push(`Matches ${sp.affiliation} affiliation`)
  if(sp.scholarship==='true')reasons.push('Lists scholarship availability')
  if(sp.maxFee&&sp.feePeriod&&college.fee_min!=null)reasons.push(`Has a published ${sp.feePeriod.replace('_', ' ')} fee within NPR ${Number(sp.maxFee).toLocaleString('en-NP')}`)
  if(sp.verified==='true')reasons.push('Has documented source verification')
  return reasons
}

// One program's fee backs the displayed min/max unambiguously only when it's
// the sole comparable value; that's the only case an evidence chip can point
// to a single source and check date without overstating what's known.
function feeProvenance(programs: CollegeProgram[] | undefined, feePeriod: string | undefined, feeMin: number | undefined) {
  if (feeMin == null) return { fee_source_url: null, fee_last_verified_at: null }
  const comparable = (programs ?? []).filter(cp => cp.fee != null && (!feePeriod || cp.fee_period === feePeriod))
  const matching = comparable.filter(cp => cp.fee === feeMin)
  if (matching.length !== 1) return { fee_source_url: null, fee_last_verified_at: null }
  return { fee_source_url: matching[0].fee_source_url ?? null, fee_last_verified_at: matching[0].fee_last_verified_at ?? null }
}

async function getColleges(sp: {
  q?:           string
  location?:    string
  affiliation?: string
  faculty?:     string
  level?:       string
  province?: string
  district?: string
  maxFee?: string
  feePeriod?: string
  scholarship?: string
  verified?: string
  program?: string
  sort?: string
  page?: string
}): Promise<{ filtered: RichCollege[]; loadError: boolean }> {
  const supabase = createServerSupabaseClient()

  // Supabase projects commonly cap one response at 1,000 rows. Fetch stable,
  // ordered batches so colleges added later are not silently excluded from
  // search and filters after the directory grows beyond its original size.
  const raw: (College & { programs?: CollegeProgram[]; reviews?: Review[] })[] = []
  for (let offset = 0; offset < MAX_DIRECTORY_COLLEGES; offset += COLLEGE_BATCH_SIZE) {
    let query = supabase
      .from('colleges')
      .select(`
        id,name,slug,location,district,province,local_level,affiliation,logo_url,cover_url,is_featured,verification_status,programs_offered,education_levels,is_sponsored,sponsor_label,sponsor_starts_at,sponsor_ends_at,sponsor_disclosure,last_verified_at,source_url,
        programs:college_programs(
          fee,
          fee_period,
          fee_source_url,
          fee_last_verified_at,
          scholarship_available,
          program:programs(id, name, slug, faculty, degree_level)
        ),
        reviews(rating, is_approved)
      `)
      // The ID tie-breaker prevents records moving between equal-name pages.
      .or('status.eq.active,status.is.null')
      .order('is_featured', { ascending: false })
      .order('name')
      .order('id')

    if (sp.location)    query = query.ilike('location', `%${sp.location}%`)
    if (sp.province)    query = query.eq('province', sp.province)
    if (sp.district)    query = query.ilike('district', `%${sp.district}%`)
    if (sp.affiliation) query = query.ilike('affiliation', `%${sp.affiliation}%`)
    if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])

    const { data, error } = await query.range(offset, offset + COLLEGE_BATCH_SIZE - 1)
    if (error) {
      console.error('Unable to load college directory:', error.message)
      return { filtered: [], loadError: true }
    }

    const batch = (data ?? []) as unknown as (College & { programs?: CollegeProgram[]; reviews?: Review[] })[]
    raw.push(...batch)
    if (batch.length < COLLEGE_BATCH_SIZE) break
  }

  // Compute avg_rating, review_count, fee range on the server
  const enriched: RichCollege[] = raw.map((c) => {
    const approved = (c.reviews ?? []).filter((r) => r.is_approved)
    const avg_rating =
      approved.length > 0
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
        : undefined
    const publishedFees = (c.programs ?? []).filter(cp => cp.fee != null)
    const comparableFees = sp.feePeriod
      ? publishedFees.filter(cp => cp.fee_period === sp.feePeriod)
      : publishedFees
    const periods = new Set(comparableFees.map(cp => cp.fee_period).filter(period => period && period !== 'unknown'))
    const hasUnknownPeriod = comparableFees.some(cp => !cp.fee_period || cp.fee_period === 'unknown')
    const canCompare = Boolean(sp.feePeriod) || (periods.size === 1 && !hasUnknownPeriod)
    const fees = canCompare ? comparableFees.map(cp => cp.fee).filter((fee): fee is number => fee != null) : []
    const fee_min = fees.length > 0 ? Math.min(...fees) : undefined
    const fee_period = canCompare ? (sp.feePeriod || Array.from(periods)[0]) : undefined
    const provenance = feeProvenance(c.programs, fee_period, fee_min)
    return {
      ...c,
      avg_rating,
      review_count: approved.length > 0 ? approved.length : undefined,
      fee_min,
      fee_max: fees.length > 0 ? Math.max(...fees) : undefined,
      fee_period,
      has_published_fees: publishedFees.length > 0,
      fee_source_url: provenance.fee_source_url,
      fee_last_verified_at: provenance.fee_last_verified_at,
    }
  })

  // Program-related constraints must match the same program row. Applying each
  // constraint separately can produce a false match across unrelated programs.
  let filtered = enriched
  const searchTerm = normaliseSearch(sp.q?.slice(0, 80))
  if (searchTerm) filtered = filtered.filter(college => collegeSearchScore(college, searchTerm) < 99)
  const maxFee = Number(sp.maxFee)
  const hasMaxFee = Number.isFinite(maxFee) && maxFee > 0
  const hasProgramConstraint = Boolean(sp.faculty || sp.program || sp.scholarship === 'true' || sp.feePeriod || (hasMaxFee && sp.feePeriod))
  if (hasProgramConstraint) {
    const faculty = sp.faculty?.toLowerCase()
    filtered = filtered.filter(college => (college.programs ?? []).some(link => {
      const program = link.program
      if (!program) return false
      if (faculty && !facultyMatches(program.faculty, faculty)) return false
      if (sp.level && !levelMatches(program.degree_level, sp.level)) return false
      if (sp.program && program.slug !== sp.program) return false
      if (sp.scholarship === 'true' && !link.scholarship_available) return false
      if (sp.feePeriod && link.fee_period !== sp.feePeriod) return false
      if (hasMaxFee && sp.feePeriod && (link.fee == null || link.fee > maxFee)) return false
      return true
    }))
  } else if (sp.level) {
    const storedLevel = normaliseLevel(sp.level)
    filtered = filtered.filter(college =>
      college.education_levels?.includes(storedLevel as NonNullable<College['education_levels']>[number]) ||
      (college.programs ?? []).some(link => levelMatches(link.program?.degree_level, sp.level))
    )
  }

  const effectiveSort = sp.sort === 'fee-low' && !sp.feePeriod ? 'recommended' : sp.sort || 'recommended'
  if (effectiveSort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
  if (effectiveSort === 'rating') filtered.sort((a, b) => sampleAwareRating(b) - sampleAwareRating(a) || (b.review_count ?? 0) - (a.review_count ?? 0) || a.name.localeCompare(b.name))
  if (effectiveSort === 'fee-low') filtered.sort((a, b) => (a.fee_min ?? Number.MAX_SAFE_INTEGER) - (b.fee_min ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
  if (effectiveSort === 'recommended') filtered.sort((a, b) => searchTerm ? collegeSearchScore(a, searchTerm) - collegeSearchScore(b, searchTerm) || profileCompleteness(b) - profileCompleteness(a) || a.name.localeCompare(b.name) : profileCompleteness(b) - profileCompleteness(a) || a.name.localeCompare(b.name))

  return { filtered, loadError: false }
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string; faculty?: string; level?: string; province?: string; district?: string; maxFee?: string; feePeriod?: string; scholarship?: string; verified?: string; program?: string; sort?: string; page?: string }
}) {
  const { filtered, loadError } = await getColleges(searchParams)
  const requestedPage = Number.parseInt(searchParams.page || '1', 10)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const visibleColleges = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasDirectoryFilters = Boolean(searchParams.location || searchParams.province || searchParams.district || searchParams.affiliation || searchParams.faculty || searchParams.level || searchParams.maxFee || searchParams.feePeriod || searchParams.scholarship || searchParams.verified || searchParams.program)
  const hasSearch = Boolean(normaliseSearch(searchParams.q))
  const pageUrl = absoluteUrl('/colleges')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: '+2, Bachelor and Master Colleges in Nepal',
        description: metadata.description,
        mainEntity: { '@id': `${pageUrl}#college-list` },
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      },
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }]),
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#college-list`,
        name: 'College profiles in Nepal',
        numberOfItems: filtered.length,
        itemListElement: visibleColleges.map((college, index) => ({
          '@type': 'ListItem',
          position: (currentPage - 1) * PAGE_SIZE + index + 1,
          url: absoluteUrl(`/colleges/${college.slug}`),
          name: college.name,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#questions`,
        mainEntity: directoryAnswers.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      {!loadError && <JsonLd data={jsonLd} />}
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Post-SEE study in Nepal</p>
        <div className="mt-2 flex items-start gap-3">
          <Building2 aria-hidden="true" className="mt-1.5 h-6 w-6 shrink-0 text-sn-primary" />
          <h1 className="font-baloo text-3xl font-extrabold leading-tight text-sn-ink sm:text-4xl">Colleges in Nepal</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">
          Search by programme, location, affiliation and study level. Verification badges show which profiles have documented source checks; always confirm current fees, seats and deadlines before applying.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchField placeholder="Search by college, program, place or affiliation…" redirectTo="/colleges" initialValue={searchParams.q} />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="font-bold text-sn-ink-muted">Popular:</span>{['Kathmandu','Pokhara','Chitwan','Lalitpur','Bhaktapur'].map(place=><Link key={place} href={`/colleges/in/${place.toLowerCase()}`} className="font-bold text-sn-primary hover:underline">Colleges in {place}</Link>)}</div>

      <ProgramFinderBanner className="mb-6" />

      {/* Filters — handles mobile drawer + desktop inline panel + result counts */}
      <CollegeFilters
        searchParams={searchParams}
        filteredCount={filtered.length}
      />

      {!loadError && filtered.length > 0 && <CollegeSort searchParams={searchParams} count={filtered.length} />}

      {/* Grid */}
      {loadError ? (
        <div className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg px-6 py-12 text-center text-sn-confirm-ink">
          <AlertCircle className="mx-auto h-10 w-10" />
          <h2 className="mt-4 font-baloo text-xl font-bold">College listings could not load</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6">This is a temporary connection problem—not an empty result. Please reload the page in a moment.</p>
          <Link href="/colleges" className="mt-5 inline-flex rounded-sn-control bg-sn-ink px-5 py-2.5 text-sm font-bold text-white">Try again</Link>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleColleges.slice(0, 6).map((college) => (
              <CollegeCard key={college.id} college={college} matchReasons={matchReasons(college,searchParams)} />
            ))}
          </div>
          {visibleColleges.length > 6 && (
            <AdUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COLLEGES ?? ''}
              format="horizontal"
              className="my-5 min-h-[90px] rounded-sn-card border border-sn-border bg-sn-surface"
            />
          )}
          {visibleColleges.length > 6 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleColleges.slice(6).map((college) => (
                <CollegeCard key={college.id} college={college} matchReasons={matchReasons(college,searchParams)} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav aria-label="College directory pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {currentPage > 1 && <Link href={buildCollegePageUrl(searchParams, currentPage - 1)} className="rounded-sn-control border border-sn-border-strong bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary motion-control">Previous</Link>}
              <span className="px-3 py-2 text-sm text-sn-ink-soft">Page <strong className="text-sn-ink">{currentPage}</strong> of {totalPages}</span>
              {currentPage < totalPages && <Link href={buildCollegePageUrl(searchParams, currentPage + 1)} className="rounded-sn-control border border-sn-primary bg-sn-primary px-4 py-2 text-sm font-bold text-white hover:bg-sn-primary-hover motion-control">Next</Link>}
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-sn-card border border-sn-border bg-sn-surface px-6 py-16 text-center">
          <h3 className="mb-2 font-baloo text-lg font-bold text-sn-ink">{hasSearch ? 'No college matches that search' : 'No colleges match these filters'}</h3>
          <p className="mx-auto mb-5 max-w-xs text-sm leading-6 text-sn-ink-soft">
            {hasSearch ? 'Try a shorter name, programme, district or affiliation. You can also browse the full directory.' : 'No listing matches every selected option. Remove one filter or browse the full directory.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hasDirectoryFilters ? (hasSearch ? `/colleges?q=${encodeURIComponent(searchParams.q || '')}` : '/colleges') : '/colleges'}
              className="inline-flex min-h-11 items-center gap-2 rounded-sn-control bg-sn-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sn-primary-hover motion-control"
            >
              {hasDirectoryFilters ? 'Remove filters' : 'Browse all colleges'}
            </Link>
            <Link href="/tools/program-finder" className="inline-flex min-h-11 items-center gap-2 rounded-sn-control border border-sn-border-strong bg-sn-surface px-5 py-2.5 text-sm font-bold text-sn-ink hover:border-sn-primary hover:text-sn-primary motion-control">
              Not sure what to study? Take the quiz
            </Link>
          </div>
        </div>
      )}

      <section className="mt-10 rounded-sn-card border border-sn-border bg-sn-surface p-6 sm:p-8" aria-labelledby="college-directory-questions">
        <h2 id="college-directory-questions" className="font-baloo text-2xl font-bold text-sn-ink">How to use the college directory</h2>
        <div className="mt-5 divide-y divide-sn-border">
          {directoryAnswers.map(item => (
            <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none pr-8 text-sm font-bold text-sn-ink marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sn-primary/40 rounded-sm">
                {item.question}<span className="float-right inline-block text-sn-primary transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-sn-border pt-5 text-sm font-bold">
          <Link href="/compare" className="text-sn-primary hover:underline">Compare shortlisted colleges</Link>
          <Link href="/colleges" className="text-sn-primary hover:underline">Use the college finder</Link>
          <Link href="/about/editorial-policy" className="text-sn-primary hover:underline">Read our verification policy</Link>
        </div>
      </section>
    </div>
  )
}
