import { Check, AlertCircle, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// The platform's identity: every factual value with provenance renders one of
// these three states — never a bare number. See design-system/sikshyanepal/MASTER.md
// for the rule this component enforces.
type EvidenceChipProps =
  | { state: 'verified'; source: string; checkedDate: string; className?: string }
  | { state: 'confirm'; label?: string; className?: string }
  | { state: 'limited'; label?: string; className?: string }

function formatCheckedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
}

const base = 'inline-flex items-center gap-1.5 rounded-sn-pill px-2.5 py-1 text-xs font-bold font-nunito'

export default function EvidenceChip(props: EvidenceChipProps) {
  if (props.state === 'verified') {
    return (
      <span className={cn(base, 'bg-sn-verified-bg text-sn-verified-ink', props.className)}>
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={3} />
        {props.source} · checked {formatCheckedDate(props.checkedDate)}
      </span>
    )
  }
  if (props.state === 'confirm') {
    return (
      <span className={cn(base, 'bg-sn-confirm-bg text-sn-confirm-ink', props.className)}>
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
        {props.label || 'Confirm with the college'}
      </span>
    )
  }
  return (
    <span className={cn(base, 'bg-sn-limited-bg text-sn-limited-ink', props.className)}>
      <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={3} />
      {props.label || 'Limited Nepal data'}
    </span>
  )
}
