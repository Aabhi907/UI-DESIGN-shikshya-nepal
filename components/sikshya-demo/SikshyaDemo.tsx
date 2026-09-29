'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { demoQuestions, DemoQuestion } from './demoQuestions'
import DemoWindow from './DemoWindow'
import DemoCaption from './DemoCaption'
import './demo.css'

const QUEUE_STORAGE_KEY = 'sikshya-question-queue'

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function getNextDemoQuestion(): DemoQuestion {
  try {
    let queue: number[] = JSON.parse(
      sessionStorage.getItem(QUEUE_STORAGE_KEY) || '[]'
    )
    if (!Array.isArray(queue) || queue.length === 0) {
      queue = shuffleArray(demoQuestions.map((q) => q.id))
    }
    const nextId = queue.shift() ?? demoQuestions[0].id
    sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    return demoQuestions.find((q) => q.id === nextId) || demoQuestions[0]
  } catch {
    const randomIndex = Math.floor(Math.random() * demoQuestions.length)
    return demoQuestions[randomIndex]
  }
}

export default function SikshyaDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 })
  const hasTriggeredRef = useRef(false)

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

  // Stream answer text progressively
  const startStreaming = useCallback((answerText: string) => {
    setDisplayedAnswer('')
    setIsGenerating(true)

    // ~350ms initial pause with blinking caret before words flow
    pauseTimerRef.current = setTimeout(() => {
      const words = answerText.trim().split(/\s+/)
      let currentWordIndex = 0

      streamTimerRef.current = setInterval(() => {
        currentWordIndex += 2
        const currentSlice = words.slice(0, currentWordIndex).join(' ')
        setDisplayedAnswer(currentSlice)

        if (currentWordIndex >= words.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current)
          setDisplayedAnswer(answerText.trim())
          setIsGenerating(false)
        }
      }, 40)
    }, 350)
  }, [])

  // Sequence triggers when section enters viewport below testimonials
  useEffect(() => {
    if (!isInView || hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const nextDemo = getNextDemoQuestion()
    setDemo(nextDemo)
    startStreaming(nextDemo.answer)

    return () => clearTimers()
  }, [isInView, clearTimers, startStreaming])

  // "Try another question" click sequence:
  // Card remains solid and stationary; only the inner question and answer smoothly change
  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    clearTimers()

    // 150ms inner fade -> swap question & stream new answer
    setTimeout(() => {
      const nextDemo = getNextDemoQuestion()
      setDemo(nextDemo)
      setDisplayedAnswer('')
      setIsTransitioning(false)
      startStreaming(nextDemo.answer)
    }, 150)
  }, [clearTimers, isTransitioning, startStreaming])

  return (
    <section
      ref={sectionRef}
      className="sikshya-demo-section sikshya-demo-bg"
      aria-label="Interactive Sikshya Nepal AI Guidance Demo"
    >
      {/* Section Header */}
      <div className="sikshya-demo-header">
        <span className="sikshya-demo-tag">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive AI Advisor
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text)]">
          Ask questions, get verified answers
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
          Instant guidance on colleges, TU/PU/KU programs, scholarships, and career paths in Nepal.
        </p>
      </div>

      {/* Main Sikshya Nepal AI Window - Always mounted, zero page shifts */}
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
