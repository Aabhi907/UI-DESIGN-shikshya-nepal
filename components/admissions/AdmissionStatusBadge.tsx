import { CalendarClock } from 'lucide-react'
import { admissionState, daysUntil } from '@/lib/admissions'
import type { Admission } from '@/types'

export default function AdmissionStatusBadge({ admission }: { admission: Pick<Admission, 'status' | 'application_open_at' | 'application_deadline'> }) {
  const state = admissionState(admission)
  const days = daysUntil(admission.application_deadline)
  const config = {
    open: { label: days === 0 ? 'Closes today' : 'Open now', classes: 'border-sn-verified/30 bg-sn-verified-bg text-sn-verified-ink' },
    closing_soon: { label: days === 0 ? 'Closes today' : `${days} day${days === 1 ? '' : 's'} left`, classes: 'border-sn-confirm/30 bg-sn-confirm-bg text-sn-confirm-ink' },
    upcoming: { label: admission.application_open_at ? `Opens ${new Date(admission.application_open_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}` : 'Opening soon', classes: 'border-sn-primary/30 bg-sn-primary-bg text-sn-primary-hover' },
    closed: { label: 'Applications closed', classes: 'border-sn-border bg-sn-surface-alt text-sn-ink-muted' },
    date_unavailable: { label: 'Deadline not announced', classes: 'border-sn-primary/30 bg-sn-primary-bg text-sn-primary-hover' },
  }[state]
  return <span className={`inline-flex items-center gap-1 rounded-sn-pill border px-2.5 py-1 text-[11px] font-bold font-nunito ${config.classes}`}><CalendarClock className="h-3.5 w-3.5" />{config.label}</span>
}
