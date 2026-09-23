'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import ApplyNowModal from './ApplyNowModal'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isSponsored: boolean
  programs:    Program[]
  variant?:    'profile' | 'card'
}

export default function ApplyNowButton({
  collegeName, collegeId, isSponsored, programs, variant = 'profile',
}: Props) {
  const [open, setOpen] = useState(false)

  // ── Apply Now button ─────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={variant === 'card'
          ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-sn-control border border-sn-primary px-3 text-sm font-bold font-nunito text-sn-primary transition-colors hover:bg-sn-primary-bg focus:outline-none focus:ring-2 focus:ring-sn-primary/25'
          : 'mt-4 flex w-full items-center justify-center gap-2 rounded-sn-control bg-sn-primary px-4 py-3 text-sm font-bold font-nunito text-white shadow-sn-button transition-colors hover:bg-sn-primary-hover'}
      >
        <Send className="w-4 h-4" />
        {variant === 'card' ? 'Apply now' : 'Request admission information'}
      </button>

      {open && (
        <ApplyNowModal
          collegeName={collegeName}
          collegeId={collegeId}
          isSponsored={isSponsored}
          programs={programs}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
