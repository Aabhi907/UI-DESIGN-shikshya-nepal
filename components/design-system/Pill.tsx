import { cn } from '@/lib/utils'

type Tone = 'primary' | 'verified' | 'confirm' | 'limited' | 'neutral'

const tones: Record<Tone, string> = {
  primary: 'bg-sn-primary-bg text-sn-primary-hover',
  verified: 'bg-sn-verified-bg text-sn-verified-ink',
  confirm: 'bg-sn-confirm-bg text-sn-confirm-ink',
  limited: 'bg-sn-limited-bg text-sn-limited-ink',
  neutral: 'bg-sn-surface-alt text-sn-ink-soft',
}

// A plain label pill — for status words that are not evidence claims.
// Use EvidenceChip instead for anything with a source or checked-date.
export default function Pill({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-sn-pill px-2.5 py-1 text-xs font-bold font-nunito', tones[tone], className)}>{children}</span>
}
