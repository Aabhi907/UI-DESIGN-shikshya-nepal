import type { CollegeSearchParams } from './CollegeFilters'

const labels: Record<string, string> = {
  recommended: 'Most complete profiles',
  name: 'Name A-Z',
  rating: 'Student rating (sample-aware)',
  'fee-low': 'Lowest comparable fee',
}

export default function CollegeSort({ searchParams, count }: { searchParams: CollegeSearchParams; count: number }) {
  const sort = searchParams.sort === 'fee-low' && !searchParams.feePeriod ? 'recommended' : searchParams.sort || 'recommended'
  const explanation = sort === 'rating'
    ? 'Balances the average rating with the number of approved reviews, so one review cannot dominate the list.'
    : sort === 'fee-low'
      ? searchParams.feePeriod ? `Compares ${searchParams.feePeriod.replace('_', ' ')} amounts only. Check included charges on the college profile.` : 'Choose a fee period in Filters before sorting by fee.'
      : sort === 'name'
        ? 'Alphabetical by the college name stored in the directory.'
        : 'Uses documented programmes, fees, affiliation, location, source and check date. Paid placement does not change this order.'
  return (
    <div className="mb-5 border-y border-sn-border bg-sn-surface py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm text-sn-ink-soft">
          <strong className="font-bold text-sn-ink">{count}</strong> matching college{count === 1 ? '' : 's'}{searchParams.q ? <> for <strong className="font-bold text-sn-ink">“{searchParams.q}”</strong></> : null}
        </p>
        <form action="/colleges" className="flex items-center gap-2">
        {Object.entries(searchParams).filter(([key, value]) => value && !['sort', 'page'].includes(key)).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <label htmlFor="college-sort" className="shrink-0 text-sm font-bold text-sn-ink-soft">Sort by</label>
        <select id="college-sort" name="sort" defaultValue={sort} className="min-w-0 flex-1 rounded-sn-control border border-sn-border-strong bg-sn-surface px-3 py-2 text-sm text-sn-ink sm:w-60">
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value} disabled={value === 'fee-low' && !searchParams.feePeriod}>{label}</option>)}
        </select>
        <button className="rounded-sn-control bg-sn-primary px-4 py-2 text-sm font-bold font-nunito text-white hover:bg-sn-primary-hover">Apply</button>
        </form>
      </div>
      <p className="mt-2 text-xs leading-5 text-sn-ink-muted">{explanation}</p>
    </div>
  )
}
