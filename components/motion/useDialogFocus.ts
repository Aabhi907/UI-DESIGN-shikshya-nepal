'use client'

import { type RefObject, useEffect, useRef } from 'react'

type Options = { open: boolean; dialogRef: RefObject<HTMLElement>; initialFocusRef?: RefObject<HTMLElement>; onEscape: () => void; lockScroll?: boolean }
export function useDialogFocus({ open, dialogRef, initialFocusRef, onEscape, lockScroll = true }: Options) {
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    if (lockScroll) document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => (initialFocusRef?.current || dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'))?.focus())
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); escapeRef.current(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(control => control.getClientRects().length > 0)
      if (!controls.length) return
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', handleKey); if (lockScroll) document.body.style.overflow = originalOverflow; previous?.focus() }
  }, [dialogRef, initialFocusRef, lockScroll, open])
}
