'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { demoQuestions, DemoQuestion } from './demoQuestions'
import FloatingPattern from './FloatingPattern'
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

  const [demo, setDemo] = useState<DemoQuestion | null>(null)
  const [sceneVisible, setSceneVisible] = useState(false)
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const streamTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mountTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = useCallback(() => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    if (mountTimerRef.current) clearTimeout(mountTimerRef.current)
  }, [])

  // Stream answer text progressively
  const startStreaming = useCallback((answerText: string) => {
    setDisplayedAnswer('')
    setIsGenerating(true)

    // ~600ms initial pause with blinking caret before words flow
    pauseTimerRef.current = setTimeout(() => {
      const words = answerText.trim().split(/\s+/)
      let currentWordIndex = 0

      streamTimerRef.current = setInterval(() => {
        currentWordIndex += 2
        const currentSlice = words.slice(0, currentWordIndex).join(' ')
        setDisplayedAnswer(currentSlice)

        if (currentWordIndex >= words.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current)
          // Ensure full final text formatting is cleanly assigned
          setDisplayedAnswer(answerText.trim())
          setIsGenerating(false)
        }
      }, 45)
    }, 600)
  }, [])

  // Sequence triggers when section enters viewport below testimonials
  useEffect(() => {
    if (!isInView || hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const nextDemo = getNextDemoQuestion()

    mountTimerRef.current = setTimeout(() => {
      setDemo(nextDemo)
      setSceneVisible(true)
      startStreaming(nextDemo.answer)
    }, 350)

    return () => clearTimers()
  }, [isInView, clearTimers, startStreaming])

  // "Try another question" click sequence: fade out -> 300ms -> pick next -> fade in -> stream
  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    clearTimers()

    // 1. Fade window + pattern out to reveal warm background
    setSceneVisible(false)

    // 2. Wait ~300ms, pick next question from queue, and fade back in
    setTimeout(() => {
      const nextDemo = getNextDemoQuestion()
      setDemo(nextDemo)
      setDisplayedAnswer('')
      setSceneVisible(true)
      setIsTransitioning(false)

      startStreaming(nextDemo.answer)
    }, 320)
  }, [clearTimers, isTransitioning, startStreaming])

  return (
    <section
      ref={sectionRef}
      className="sikshya-demo-section sikshya-demo-bg"
      aria-label="Interactive Sikshya Nepal AI Guidance Demo"
    >
      {/* Layer 1: Radial light is in the background CSS (.sikshya-demo-bg) */}

      {/* Layer 2: Scattered 3D physical keys */}
      <FloatingPattern visible={sceneVisible} />

      {/* Layer 3: Main Sikshya Nepal AI Window */}
      <div className="relative z-10 flex flex-col items-center justify-center -translate-y-2 sm:-translate-y-4">
        <AnimatePresence mode="wait">
          {sceneVisible && demo && (
            <motion.div
              key={demo.id}
              initial={{
                opacity: 0,
                scale: 0.985,
                filter: 'blur(5px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.99,
                filter: 'blur(4px)',
              }}
              transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <DemoWindow
                demo={demo}
                displayedAnswer={displayedAnswer}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer 4: Caption / Action underneath */}
        <DemoCaption
          onNextQuestion={handleNextQuestion}
          isTransitioning={isTransitioning}
        />
      </div>
    </section>
  )
}
