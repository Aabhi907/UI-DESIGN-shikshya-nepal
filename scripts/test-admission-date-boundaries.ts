import assert from 'node:assert/strict'
import { addDaysToDateOnly, deadlineState, nepalDateOnly } from '../lib/admissions'

const samples = [
  ['early UTC', '2026-09-24T19:00:00Z', '2026-09-25'],
  ['Nepal midnight', '2026-09-24T18:15:00Z', '2026-09-25'],
  ['after UTC midnight', '2026-09-25T08:00:00Z', '2026-09-25'],
  ['before Nepal midnight', '2026-09-25T18:14:59Z', '2026-09-25'],
  ['late UTC', '2026-09-25T23:30:00Z', '2026-09-26'],
] as const

for (const [label, instant, expectedDay] of samples) {
  const now = new Date(instant)
  const today = nepalDateOnly(now)
  assert.equal(today, expectedDay, `${label}: local day`)
  const midnightStoredDeadline = `${today}T00:00:00+00:00`
  assert.ok(midnightStoredDeadline >= today, `${label}: today's admission passes the lower query bound`)
  assert.ok(midnightStoredDeadline < addDaysToDateOnly(today, 1), `${label}: today's admission passes the inclusive upper day bound`)
  const eveningOpening = `${today}T17:00:00+00:00`
  assert.ok(eveningOpening < addDaysToDateOnly(today, 1), `${label}: evening opening passes the opening bound`)
  assert.ok(eveningOpening > today, `${label}: a same-day midnight upper bound would exclude it`)
  assert.notEqual(deadlineState(midnightStoredDeadline, now), 'closed', `${label}: card stays open`)
  assert.ok(`${addDaysToDateOnly(today, -1)}T00:00:00+00:00` < today, `${label}: yesterday is excluded`)
  if (now.toISOString() > midnightStoredDeadline) {
    assert.ok(midnightStoredDeadline < now.toISOString(), `${label}: old exact-instant comparison would hide today`)
  }
}

console.log('Admission date-boundary checks passed.')
