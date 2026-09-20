type ProgrammeEvidence = {
  fee: number | null
  fee_period: string | null
  fee_academic_year: string | null
  seats: number | null
  scholarship_available: boolean
  program: { name: string; degree_level: string } | null
}

type CollegeEvidence = {
  id: string
  name: string
  location: string
  affiliation: string | null
  established_year: number | null
  education_levels?: string[]
  facilities?: string[]
  verification_status?: string
}

type Detail = { programs: ProgrammeEvidence[]; reviews: { rating: number }[]; scholarships: number }

type EvidenceGroup = { label: string; found: number; total: number }

function count(values: boolean[]) {
  return values.filter(Boolean).length
}

function groupsFor(college: CollegeEvidence, detail: Detail): EvidenceGroup[] {
  const programmes = detail.programs || []
  return [
    {
      label: 'Profile', total: 5,
      found: count([Boolean(college.location?.trim()), Boolean(college.affiliation?.trim()), Boolean(college.established_year), Boolean(college.education_levels?.length), Boolean(college.facilities?.length)]),
    },
    {
      label: 'Study options', total: 3,
      found: count([programmes.length > 0, programmes.some((item) => Boolean(item.program?.name)), programmes.some((item) => Boolean(item.program?.degree_level))]),
    },
    {
      label: 'Cost & seats', total: 4,
      found: count([programmes.some((item) => item.fee != null), programmes.some((item) => item.fee_period && item.fee_period !== 'unknown'), programmes.some((item) => Boolean(item.fee_academic_year)), programmes.some((item) => item.seats != null)]),
    },
    {
      label: 'Student evidence', total: 4,
      found: count([['source_verified', 'institution_verified'].includes(college.verification_status || ''), detail.reviews.length > 0, detail.scholarships > 0, programmes.some((item) => item.scholarship_available)]),
    },
  ]
}

export default function ComparisonEvidenceGraph({ colleges, details }: { colleges: CollegeEvidence[]; details: Record<string, Detail> }) {
  return <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="decision-evidence-heading">
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a302c]">Decision evidence</p>
      <h2 id="decision-evidence-heading" className="mt-1 font-display text-2xl font-bold text-ink">What is documented for each college</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">This is an evidence-coverage graph, not a college quality score or ranking. Use it to see where you may need to ask the college for more information.</p>
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {colleges.map((college) => {
        const groups = groupsFor(college, details[college.id])
        const found = groups.reduce((total, group) => total + group.found, 0)
        const total = groups.reduce((total, group) => total + group.total, 0)
        const percent = Math.round((found / total) * 100)
        return <article key={college.id} className="rounded-xl border border-slate-200 bg-[#fcfbf8] p-4">
          <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold leading-5 text-ink">{college.name}</h3><span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">{found}/{total}</span></div>
          <div role="img" aria-label={`${college.name}: ${found} of ${total} decision evidence checks documented`} className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${percent}%` }} /></div>
          <p className="mt-2 text-xs font-semibold text-slate-600">{percent}% of decision checks documented</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-200 pt-3 text-xs">
            {groups.map((group) => <div key={group.label} className="flex items-baseline justify-between gap-2"><dt className="text-slate-500">{group.label}</dt><dd className="font-bold text-slate-700">{group.found}/{group.total}</dd></div>)}
          </dl>
        </article>
      })}
    </div>
  </section>
}
