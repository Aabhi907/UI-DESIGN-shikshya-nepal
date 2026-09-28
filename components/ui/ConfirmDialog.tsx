'use client'

import { useRef } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { useDialogFocus } from '@/components/motion'

export interface ConfirmState {
  isOpen:        boolean
  title:         string
  message:       string
  confirmLabel?: string
  variant?:      'danger' | 'warning' | 'info'
  onConfirm:     () => void
}

interface Props extends ConfirmState {
  onCancel: () => void
}

export const CONFIRM_CLOSED: ConfirmState = {
  isOpen: false, title: '', message: '', onConfirm: () => {},
}

export default function ConfirmDialog({
  isOpen, title, message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm, onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  useDialogFocus({ open: isOpen, dialogRef, initialFocusRef: cancelRef, onEscape: onCancel })

  if (!isOpen) return null

  const btnClass =
    variant === 'danger'  ? 'bg-red-600   hover:bg-red-700'   :
    variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                            'bg-blue-600  hover:bg-blue-700'

  const iconWrap =
    variant === 'danger'  ? 'text-red-400   bg-red-900/30'   :
    variant === 'warning' ? 'text-amber-400 bg-amber-900/30' :
                            'text-blue-400  bg-blue-900/30'

  const Icon = variant === 'info' ? Info : AlertTriangle

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="motion-scrim-enter absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Panel */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" className="motion-dialog-enter relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconWrap}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 id="confirm-dialog-title" className="text-white font-bold text-lg mb-2">{title}</h3>
        <p id="confirm-dialog-message" className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
