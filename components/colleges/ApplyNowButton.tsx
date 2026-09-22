'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle } from 'lucide-react'
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

const LS_KEY    = (id: string) => `applied_${id}`
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

export default function ApplyNowButton({
  collegeName, collegeId, isSponsored, programs, variant = 'profile',
}: Props) {
  const [open,    setOpen]    = useState(false)
  const [applied, setApplied] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Restore applied state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(collegeId))
      if (raw) {
        const ts = parseInt(raw, 10)
        if (Date.now() - ts < EXPIRY_MS) {
          setApplied(true)
        } else {
          localStorage.removeItem(LS_KEY(collegeId))
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, [collegeId])

  // Called by the modal after a successful submission
  const handleSuccess = () => {
    try {
      localStorage.setItem(LS_KEY(collegeId), Date.now().toString())
    } catch {
      // ignore
    }
    // Keep the confirmation visible in the modal. The completed state is
    // reflected on the card only after the student closes that confirmation.
    setSubmitted(true)
  }

  const closeModal = () => {
    if (submitted) setApplied(true)
    setOpen(false)
  }

  // ── Already applied state ────────────────────────────────────────────────
  if (applied) {
    return (
      <div className={variant === 'card' ? '' : 'mt-4'}>
        <div className={`flex items-center justify-center gap-2 border border-green-200 bg-green-50 text-sm font-semibold text-green-700 ${variant === 'card' ? 'min-h-11 rounded-lg px-3' : 'w-full rounded-xl px-4 py-3'}`}>
          <CheckCircle className="w-4 h-4" />
          Enquiry sent
        </div>
        {variant !== 'card' && <p className="mt-1.5 text-center text-xs text-gray-400">Saved in SikshyaNepal. Response time depends on the college.</p>}
      </div>
    )
  }

  // ── Apply Now button ─────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={variant === 'card'
          ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary px-3 text-sm font-semibold text-primary transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary/25'
          : 'mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1847c4] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1340b0]'}
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
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
