type EvidenceChipProps =
  | { state: 'verified'; source: string; checkedDate: string; className?: string }
  | { state: 'confirm'; label?: string; className?: string }
  | { state: 'limited'; label?: string; className?: string }

export default function EvidenceChip(props: EvidenceChipProps) {
  void props
  return null
}
