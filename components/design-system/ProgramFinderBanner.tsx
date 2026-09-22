import { Compass } from 'lucide-react'
import IconTile from './IconTile'
import Button from './Button'

// The results→decision "front door", surfaced prominently on the listing
// pages that feed it (colleges, programs) rather than left as a link only
// reachable from /careers. See Build Brief "Public UI redesign, Phase 2".
export default function ProgramFinderBanner({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-4 rounded-sn-card border border-sn-border bg-sn-surface-alt p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${className || ''}`}>
      <div className="flex items-start gap-3.5">
        <IconTile icon={Compass} tint="lilac" />
        <div>
          <p className="font-baloo text-base font-bold text-sn-ink">Not sure what to study?</p>
          <p className="mt-1 text-sm leading-6 text-sn-ink-soft">Answer three quick questions and get study areas matched to you, with colleges to explore next.</p>
        </div>
      </div>
      <Button.Link href="/tools/program-finder" variant="primary" className="w-full shrink-0 sm:w-auto">Take the 2-minute quiz</Button.Link>
    </div>
  )
}
