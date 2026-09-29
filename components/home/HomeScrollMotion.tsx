'use client'

import { useEffect } from 'react'

/** Enhances server-rendered landing-page sections without delaying first paint. */
export default function HomeScrollMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-home-motion]'))
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-home-visible', 'true')
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 })

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.92) {
        requestAnimationFrame(() => section.setAttribute('data-home-visible', 'true'))
      } else {
        section.setAttribute('data-home-ready', 'true')
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  return null
}
