'use client'

import React from 'react'
import type { DemoQuestion } from './demoQuestions'
import WindowControls from './WindowControls'
import QuestionHeader from './QuestionHeader'
import StreamingAnswer from './StreamingAnswer'
import AskBar from './AskBar'

export default function DemoWindow({
  demo,
  displayedAnswer,
  isGenerating,
}: {
  demo: DemoQuestion
  displayedAnswer: string
  isGenerating: boolean
}) {
  return (
    <article className="ai-window" aria-label="Sikshya Nepal AI Guidance Window">
      {/* Top browser/window controls */}
      <WindowControls title="Ask Sikshya Nepal" />

      {/* Pill question container */}
      <QuestionHeader question={demo.question} stepLabel={demo.stepLabel} />

      {/* Scrollable document-like answer area */}
      <StreamingAnswer
        displayedAnswer={displayedAnswer}
        isGenerating={isGenerating}
      />

      {/* Fixed bottom ask bar */}
      <AskBar />
    </article>
  )
}
