'use client'

import Link, { type LinkProps } from 'next/link'
import { type AnchorHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react'

type RevealState = { ref: RefObject<HTMLElement>; ready: boolean; revealed: boolean }
const callbacks = new Map<Element, () => void>()
let sharedObserver: IntersectionObserver | null = null

function observeOnce(element: Element, reveal: () => void) {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        callbacks.get(entry.target)?.()
        callbacks.delete(entry.target)
        sharedObserver?.unobserve(entry.target)
        if (!callbacks.size) { sharedObserver?.disconnect(); sharedObserver = null }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
  }
  callbacks.set(element, reveal)
  sharedObserver.observe(element)
  return () => {
    callbacks.delete(element)
    sharedObserver?.unobserve(element)
    if (!callbacks.size) { sharedObserver?.disconnect(); sharedObserver = null }
  }
}

function useRevealState(): RevealState {
  const ref = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)
  const [revealed, setRevealed] = useState(true)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setReady(true); setRevealed(true); return
    }
    setReady(true); setRevealed(false)
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight * .92 && rect.bottom > 0) {
      const frame = requestAnimationFrame(() => setRevealed(true))
      return () => cancelAnimationFrame(frame)
    }
    return observeOnce(element, () => setRevealed(true))
  }, [])
  return { ref, ready, revealed }
}

type RevealProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; delay?: number; distance?: number }
export function Reveal({ children, className = '', delay = 0, distance = 12, style, ...props }: RevealProps) {
  const state = useRevealState()
  const motionStyle = { ...style, '--reveal-delay': `${Math.min(Math.max(delay, 0), 300)}ms`, '--reveal-distance': `${Math.min(Math.max(distance, 0), 20)}px` } as CSSProperties
  return <div ref={state.ref as RefObject<HTMLDivElement>} className={`motion-reveal ${className}`.trim()} data-motion-ready={state.ready} data-revealed={state.revealed} style={motionStyle} {...props}>{children}</div>
}

export function RevealGroup({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const state = useRevealState()
  return <div ref={state.ref as RefObject<HTMLDivElement>} className={`motion-reveal-group ${className}`.trim()} data-motion-ready={state.ready} data-revealed={state.revealed} {...props}>{children}</div>
}

type AnimatedHeadingProps = HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3'; children: ReactNode }
export function AnimatedHeading({ as: Tag = 'h2', children, className = '', ...props }: AnimatedHeadingProps) {
  const state = useRevealState()
  return <Tag ref={state.ref as RefObject<HTMLHeadingElement>} className={`motion-reveal ${className}`.trim()} data-motion-ready={state.ready} data-revealed={state.revealed} {...props}>{children}</Tag>
}

export function InteractiveCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`motion-interactive-card ${className}`.trim()} {...props} /> }
type MotionLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
export function MotionLink({ className = '', ...props }: MotionLinkProps) { return <Link className={`group ${className}`.trim()} {...props} /> }
