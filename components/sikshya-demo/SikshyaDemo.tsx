'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'framer-motion'
import { demoQuestions, DemoQuestion, DemoQuestionCategory } from './demoQuestions'
import DemoWindow from './DemoWindow'
import DemoCaption from './DemoCaption'
import './demo.css'

const CATEGORIES: DemoQuestionCategory[] = [
  'All',
  'Admissions',
  'BCA & IT',
  'Scholarships',
  'Results',
]

export default function SikshyaDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 })
  const hasTriggeredRef = useRef(false)

  const [selectedCategory, setSelectedCategory] = useState<DemoQuestionCategory>('All')
  const [demo, setDemo] = useState<DemoQuestion>(demoQuestions[0])
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const streamTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = useCallback(() => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
  }, [])

  // Stream answer text progressively with natural, steady pacing and preserved paragraph formatting
  const startStreaming = useCallback((answerText: string) => {
    setDisplayedAnswer('')
    setIsGenerating(true)

    // ~450ms initial pause with blinking caret before words flow
    pauseTimerRef.current = setTimeout(() => {
      // Split into words preserving original whitespace and linebreaks
      const tokens = answerText.match(/\S+\s*/g) || []
      let currentTokenIndex = 0

      streamTimerRef.current = setInterval(() => {
        currentTokenIndex += 1
        const currentSlice = tokens.slice(0, currentTokenIndex).join('')
        setDisplayedAnswer(currentSlice)

        if (currentTokenIndex >= tokens.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current)
          setDisplayedAnswer(answerText.trim())
          setIsGenerating(false)
        }
      }, 65)
    }, 450)
  }, [])

  // Sequence triggers when section enters viewport below testimonials
  useEffect(() => {
    if (!isInView || hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const initialDemo = demoQuestions[0]
    setDemo(initialDemo)
    startStreaming(initialDemo.answer)

    return () => clearTimers()
  }, [isInView, clearTimers, startStreaming])

  // Select category tab: smoothly switches question to that category
  const handleSelectCategory = useCallback(
    (category: DemoQuestionCategory) => {
      setSelectedCategory(category)
      if (isTransitioning) return
      setIsTransitioning(true)
      clearTimers()

      setTimeout(() => {
        const pool =
          category === 'All'
            ? demoQuestions
            : demoQuestions.filter((q) => q.category === category)
        const nextDemo = pool[0] || demoQuestions[0]
        setDemo(nextDemo)
        setDisplayedAnswer('')
        setIsTransitioning(false)
        startStreaming(nextDemo.answer)
      }, 150)
    },
    [clearTimers, isTransitioning, startStreaming]
  )

  // "Try another question" click sequence:
  // Card remains solid and stationary; only the inner question and answer smoothly change
  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    clearTimers()

    // 150ms inner fade -> pick next question from active category -> stream new answer
    setTimeout(() => {
      const pool =
        selectedCategory === 'All'
          ? demoQuestions
          : demoQuestions.filter((q) => q.category === selectedCategory)

      const otherCandidates = pool.filter((q) => q.id !== demo.id)
      const nextCandidates = otherCandidates.length > 0 ? otherCandidates : pool
      const nextDemo =
        nextCandidates[Math.floor(Math.random() * nextCandidates.length)] ||
        demoQuestions[0]

      setDemo(nextDemo)
      setDisplayedAnswer('')
      setIsTransitioning(false)
      startStreaming(nextDemo.answer)
    }, 150)
  }, [clearTimers, demo.id, isTransitioning, selectedCategory, startStreaming])

  return (
    <section
      ref={sectionRef}
      className="sikshya-demo-section sikshya-demo-bg"
      aria-label="Interactive Sikshya Nepal AI Guidance Demo"
    >
      {/* Section Header matching reference typography */}
      <div className="sikshya-demo-header">
        <h2 className="section-title">
          Your education partner
        </h2>
        <p className="section-subtitle">
          A strategic thinking partner that helps you figure out which college to choose, compares verified fees, and answers questions.
        </p>

        {/* Segmented Control Pill Tabs matching reference */}
        <div className="segmented-pill-container" role="tablist" aria-label="Topic filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`segmented-pill-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Window Card - Always mounted, zero page shifts */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <DemoWindow
          demo={demo}
          displayedAnswer={displayedAnswer}
          isGenerating={isGenerating}
          isTransitioning={isTransitioning}
        />

        {/* Caption / Action underneath */}
        <DemoCaption
          onNextQuestion={handleNextQuestion}
          isTransitioning={isTransitioning}
        />
      </div>
    </section>
  )
}
