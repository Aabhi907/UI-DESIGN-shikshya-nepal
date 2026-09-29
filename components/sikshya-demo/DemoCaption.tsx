'use client'

import React from 'react'
import { RotateCcw } from 'lucide-react'

export default function DemoCaption({
  onNextQuestion,
  isTransitioning,
}: {
  onNextQuestion: () => void
  isTransitioning: boolean
}) {
  return (
    <footer className="demo-caption">
      <p>Explore answers about colleges, courses and admissions in Nepal</p>
      <button
        type="button"
        onClick={onNextQuestion}
        disabled={isTransitioning}
        className="try-another-button"
        aria-label="Load another question and answer demonstration"
      >
        <RotateCcw className={`h-3 w-3 ${isTransitioning ? 'animate-spin' : ''}`} />
        <span>Try another question</span>
      </button>
    </footer>
  )
}
