'use client'

import React from 'react'
import { Check, User } from 'lucide-react'
import type { DemoQuestion } from './demoQuestions'
import WindowControls from './WindowControls'
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
      {/* 1. Window header bar with 3 dots & centered title */}
      <WindowControls title="Sikshya Nepal" />

      {/* 2. Sub-header: topic channel name + meta */}
      <div className="channel-bar">
        <span className="channel-name">#{demo.channel || 'college-guidance'}</span>
        <span className="channel-meta">Verified AI Guidance • Nepal Higher Education</span>
      </div>

      {/* 3. Messages conversation area */}
      <div
        className={`messages-area transition-opacity duration-150 ease-out ${
          isTransitioning ? 'opacity-20' : 'opacity-100'
        }`}
      >
        {/* Student question message */}
        <div className="message-row">
          <div className="avatar user-avatar" aria-hidden="true">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="sender-name">Student</span>
              <span className="timestamp">2m</span>
            </div>
            <p className="question-text">{demo.question}</p>
          </div>
        </div>

        {/* Sikshya AI verified answer */}
        <div className="message-row ai-row">
          <div className="avatar ai-avatar" aria-hidden="true">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="sender-name">ShikshyaXNepal</span>
              <span className="timestamp">just now</span>
            </div>
            <StreamingAnswer
              displayedAnswer={displayedAnswer}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
