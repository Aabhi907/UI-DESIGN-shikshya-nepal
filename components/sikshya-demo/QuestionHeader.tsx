'use client'

import React from 'react'

export default function QuestionHeader({
  question,
  stepLabel = 'Sikshya answer',
}: {
  question: string
  stepLabel?: string
}) {
  return (
    <div>
      <div className="question-box" role="heading" aria-level={2}>
        <p className="line-clamp-2">{question}</p>
      </div>

      <div className="answer-label" aria-hidden="true">
        <span>◇</span>
        <span>{stepLabel}</span>
      </div>
    </div>
  )
}
