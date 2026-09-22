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

const BAR_COLORS = ['bg-[#244ca4]', 'bg-[#a5473d]', 'bg-[#16736c]']
const CHECK_PROMPTS: Record<string, string> = {
  Profile: 'Confirm the campus location, affiliation, level and facilities from the college.',
  'Study options': 'Confirm that your exact programme and degree level are currently offered.',
  'Cost & seats': 'Request the current written fee breakdown, payment period and available seats.',
  'Student evidence': 'Ask about scholarships and review the latest official information before deciding.',
}

function count(values: boolean[]) {
  return values.filter(Boolean).length
}

function groupsFor(college: CollegeEvidence, detail: Detail): EvidenceGroup[] {
  const programmes = detail.programs || []
  return [
    { label: 'Profile', total: 5, found: count([Boolean(college.location?.trim()), Boolean(college.affiliation?.trim()), Boolean(college.established_year), Boolean(college.education_levels?.length), Boolean(college.facilities?.length)]) },
    { label: 'Study options', total: 3, found: count([programmes.length > 0, programmes.some((item) => Boolean(item.program?.name)), programmes.some((item) => Boolean(item.program?.degree_level))]) },
    { label: 'Cost & seats', total: 4, found: count([programmes.some((item) => item.fee != null), programmes.some((item) => item.fee_period && item.fee_period !== 'unknown'), programmes.some((item) => Boolean(item.fee_academic_year)), programmes.some((item) => item.seats != null)]) },
    { label: 'Student evidence', total: 4, found: count([['source_verified', 'institution_verified'].includes(college.verification_status || ''), detail.reviews.length > 0, detail.scholarships > 0, programmes.some((item) => item.scholarship_available)]) },
  ]
}

export default function ComparisonEvidenceGraph({ colleges, details }: { colleges: CollegeEvidence[]; details: Record<string, Detail> }) {
  const evidence = colleges.map((college) => ({ college, groups: groupsFor(college, details[college.id]) }))
  const groups = evidence[0]?.groups || []
  const nextChecks = groups.map((group, groupIndex) => ({
    group,
    colleges: evidence.filter(({ groups: collegeGroups }) => collegeGroups[groupIndex].found < group.total).map(({ college }) => college.name),
  })).filter(({ colleges: incomplete }) => incomplete.length > 0)

  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="decision-evidence-heading">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a302c]">Decision evidence</p>
        <h2 id="decision-evidence-heading" className="mt-1 font-display text-2xl font-bold text-ink">Documented information by category</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">This chart compares evidence coverage, not teaching quality, value, outcomes or a college ranking. Use it to identify what you should verify before deciding.</p>
      </div>
      <ul aria-label="College chart legend" className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-700">
        {evidence.map(({ college, groups: collegeGroups }, index) => {
          const found = collegeGroups.reduce((sum, group) => sum + group.found, 0)
          const total = collegeGroups.reduce((sum, group) => sum + group.total, 0)
          return <li key={college.id} className="flex items-center gap-2"><span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${BAR_COLORS[index]}`} /><span>{college.name} <span className="text-slate-500">{found}/{total}</span></span></li>
        })}
      </ul>
    </div>

    <figure className="mt-5" aria-describedby="decision-evidence-note">
      <figcaption className="sr-only">Grouped horizontal bar chart comparing documented decision evidence for the selected colleges.</figcaption>
      <div className="space-y-5">
        {groups.map((group, groupIndex) => <div key={group.label} className="grid gap-3 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5">
          <div><p className="text-sm font-bold text-ink">{group.label}</p><p className="mt-0.5 text-xs text-slate-500">{group.total} checks</p></div>
          <div className="space-y-2.5">
            {evidence.map(({ college, groups: collegeGroups }, collegeIndex) => {
              const value = collegeGroups[groupIndex]
              const percent = Math.round((value.found / value.total) * 100)
              return <div key={college.id} className="grid grid-cols-[minmax(86px,0.72fr)_minmax(0,1fr)_42px] items-center gap-2.5 sm:grid-cols-[minmax(110px,0.72fr)_minmax(0,1fr)_42px] sm:gap-3">
                <span className="line-clamp-2 text-xs font-semibold leading-4 text-slate-700" title={college.name}>{college.name}</span>
                <div className="h-7 overflow-hidden rounded-md border border-slate-200 bg-slate-100" aria-label={`${college.name}, ${group.label}: ${value.found} of ${value.total} checks documented`}>
                  <div aria-hidden="true" className={`h-full rounded-sm ${BAR_COLORS[collegeIndex]} transition-[width] duration-200 motion-reduce:transition-none`} style={{ width: `${percent}%` }} />
                </div>
                <span className="text-right text-xs font-bold tabular-nums text-slate-700">{value.found}/{value.total}</span>
              </div>
            })}
          </div>
        </div>)}
      </div>
      <p id="decision-evidence-note" className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">A shorter bar means fewer documented checks, not a weaker college. “Not documented” means the information is absent from the current SikshyaNepal record and should be confirmed from an official source.</p>
    </figure>

    {nextChecks.length > 0 && <aside className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="comparison-next-steps-heading">
      <h3 id="comparison-next-steps-heading" className="text-sm font-bold text-ink">Before you decide</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">Use these prompts where the current record is incomplete. Missing data is not a negative judgement about a college.</p>
      <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate-700">
        {nextChecks.map(({ group, colleges: incomplete }) => <li key={group.label} className="border-l-2 border-[#244ca4] pl-3"><span className="font-bold text-ink">{group.label}: </span>{CHECK_PROMPTS[group.label]} <span className="font-semibold">Applies to {incomplete.join(', ')}.</span></li>)}
      </ul>
    </aside>}

    <table className="sr-only"><caption>Decision evidence counts by college and category</caption><thead><tr><th>Category</th>{colleges.map((college) => <th key={college.id}>{college.name}</th>)}</tr></thead><tbody>{groups.map((group, index) => <tr key={group.label}><th>{group.label}</th>{evidence.map(({ college, groups: collegeGroups }) => <td key={college.id}>{collegeGroups[index].found} of {collegeGroups[index].total}</td>)}</tr>)}</tbody></table>
  </section>
}
