'use client'

import React from 'react'
import type { DemoQuestion } from './demoQuestions'
import WindowControls from './WindowControls'
import QuestionHeader from './QuestionHeader'
import StreamingAnswer from './StreamingAnswer'

export default function DemoWindow({
  demo,
  displayedAnswer,
  isGenerating,
  isTransitioning = false,
}: {
  demo: DemoQuestion
  displayedAnswer: string
  isGenerating: boolean
  isTransitioning?: boolean
}) {
  return (
    <article className="ai-window" aria-label="Sikshya Nepal AI Guidance Window">
      {/* Top browser/window controls */}
      <WindowControls title="Ask Sikshya Nepal" />

      {/* Question & Answer Content: smoothly transitions without unmounting the window or shifting layout */}
      <div
        className={`flex-1 flex flex-col min-h-0 transition-opacity duration-150 ease-out ${
          isTransitioning ? 'opacity-20' : 'opacity-100'
        }`}
      >
        {/* Pill question container */}
        <QuestionHeader question={demo.question} stepLabel={demo.stepLabel} />

        {/* Scrollable document-like answer area */}
        <StreamingAnswer
          displayedAnswer={displayedAnswer}
          isGenerating={isGenerating}
        />
      </div>
    </article>
  )
}
