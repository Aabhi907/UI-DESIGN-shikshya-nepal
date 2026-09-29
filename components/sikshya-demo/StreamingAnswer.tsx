'use client'

import React, { useEffect, useRef } from 'react'

export default function StreamingAnswer({
  displayedAnswer,
  isGenerating,
}: {
  displayedAnswer: string
  isGenerating: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Gently auto-scroll if the answer extends past the viewport while streaming
  useEffect(() => {
    if (isGenerating && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedAnswer, isGenerating])

  return (
    <div
      ref={containerRef}
      className="answer-container"
      role="region"
      aria-live="polite"
      aria-label="AI response"
    >
      <span>{displayedAnswer}</span>
      {isGenerating && <span className="ai-caret" aria-hidden="true" />}
    </div>
  )
}
