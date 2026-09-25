import type { Admission } from '@/types'

export type DeadlineState = 'open' | 'closing_soon' | 'closed' | 'date_unavailable'
export type AdmissionState = DeadlineState | 'upcoming'

// Admin date-only values are stored in TIMESTAMPTZ columns at midnight UTC.
// Compare by Nepal calendar day so they remain visible through the closing day.
export function nepalDateOnly(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function addDaysToDateOnly(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

export function deadlineState(deadline: string | null, now = new Date()): DeadlineState {
  if (!deadline) return 'date_unavailable'
  const end = new Date(deadline)
  if (Number.isNaN(end.getTime())) return 'date_unavailable'
  const remaining = new Date(`${addDaysToDateOnly(nepalDateOnly(end), 1)}T00:00:00+05:45`).getTime() - now.getTime()
  if (remaining < 0) return 'closed'
  if (remaining <= 7 * 86_400_000) return 'closing_soon'
  return 'open'
}

export function daysUntil(deadline: string | null, now = new Date()): number | null {
  if (!deadline) return null
  const remaining = new Date(deadline).getTime() - now.getTime()
  return Number.isNaN(remaining) ? null : Math.max(0, Math.ceil(remaining / 86_400_000))
}

export function admissionState(admission: Pick<Admission, 'status' | 'application_open_at' | 'application_deadline'>, now = new Date()): AdmissionState {
  if (admission.status === 'closed' || admission.status === 'archived') return 'closed'
  const opensAt = admission.application_open_at ? new Date(admission.application_open_at) : null
  if (opensAt && !Number.isNaN(opensAt.getTime()) && nepalDateOnly(opensAt) > nepalDateOnly(now)) return 'upcoming'
  return deadlineState(admission.application_deadline, now)
}

export function admissionLocation(admission: Admission): string | null {
  return admission.college?.location || null
}
