'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, RotateCcw } from 'lucide-react'
import Mascot from '@/components/design-system/Mascot'
import Button from '@/components/design-system/Button'
import Pill from '@/components/design-system/Pill'

type Area = 'IT' | 'Management' | 'Medical' | 'Engineering' | 'Nursing' | 'Humanities'

const questions = [
  { key: 'interest', title: 'What interests you most?', options: [['technology', 'Building apps and solving digital problems'], ['business', 'Business, money, and leading projects'], ['science', 'Science, health, and understanding how things work'], ['people', 'Helping people and improving communities'], ['creative', 'Writing, ideas, communication, and society']] },
  { key: 'style', title: 'What type of work sounds most enjoyable?', options: [['practical', 'Practical projects and hands-on work'], ['analysis', 'Analysis, research, and problem-solving'], ['people', 'Working directly with people'], ['creative', 'Creating, presenting, and communicating']] },
  { key: 'strength', title: 'Which school subject feels strongest?', options: [['math', 'Mathematics / computer studies'], ['science', 'Science / biology'], ['commerce', 'Account / economics'], ['language', 'Languages / social studies']] },
] as const

const areas: Record<Area, { title: string; description: string; caution: string }> = {
  IT: { title: 'IT & Computing', description: 'BCA, BIT, BSc CSIT, software and computing-focused programmes.', caution: 'Check mathematics requirements; they differ by programme and university.' },
  Management: { title: 'Management & Business', description: 'BBA, BBS, BBM, accounting, finance and entrepreneurship pathways.', caution: 'Compare curriculum, internships and professional pathways—not only the degree title.' },
  Medical: { title: 'Medical & Health Sciences', description: 'Health-science routes with strong science and practical-study demands.', caution: 'Subject eligibility and competitive entrance requirements are essential.' },
  Engineering: { title: 'Engineering & Technical Studies', description: 'Engineering and technical programmes based on mathematics, science and applied problem-solving.', caution: 'Confirm +2 subjects, entrance examination and council requirements.' },
  Nursing: { title: 'Nursing & People-focused Care', description: 'Nursing, care and people-centred professional study routes.', caution: 'Confirm science background, entrance rules and professional council recognition.' },
  Humanities: { title: 'Humanities, Law & Social Sciences', description: 'Law, media, humanities, education and social-science programmes.', caution: 'Review writing, fieldwork and professional progression for each programme.' },
}

const weights: Record<string, Partial<Record<Area, number>>> = {
  technology: { IT: 5, Engineering: 3 }, business: { Management: 5, IT: 1 }, science: { Medical: 4, Engineering: 4, Nursing: 2 }, people: { Nursing: 4, Humanities: 3, Management: 1 }, creative: { Humanities: 5, Management: 1, IT: 1 },
  practical: { Engineering: 3, Medical: 3, Nursing: 3, IT: 2 }, analysis: { IT: 3, Engineering: 3, Medical: 2, Management: 1 }, creative_style: { Humanities: 3, Management: 2, IT: 1 }, people_style: { Nursing: 3, Humanities: 2, Management: 1 },
  math: { IT: 4, Engineering: 4, Management: 1 }, science_subject: { Medical: 4, Engineering: 3, Nursing: 3 }, commerce: { Management: 5 }, language: { Humanities: 5, Management: 1 },
}
const answerLabels: Record<string, string> = { technology: 'digital problem-solving', business: 'business and leadership', science: 'science and health', people: 'people-focused work', creative: 'communication and ideas', practical: 'hands-on learning', analysis: 'analysis and research', math: 'strength in mathematics/computing', science_subject: 'strength in science/biology', commerce: 'strength in account/economics', language: 'strength in languages/social studies' }

function ranked(answers: Record<string, string>) {
  const normalized = [answers.interest, answers.style === 'people' ? 'people_style' : answers.style === 'creative' ? 'creative_style' : answers.style, answers.strength === 'science' ? 'science_subject' : answers.strength]
  const scores = (Object.keys(areas) as Area[]).map(area => ({ area, score: normalized.reduce((sum, key) => sum + (weights[key]?.[area] || 0), 0) })).sort((a, b) => b.score - a.score || a.area.localeCompare(b.area))
  return scores.slice(0, 3).map((item, index) => ({ ...item, ...areas[item.area], reason: normalized.filter(key => (weights[key]?.[item.area] || 0) > 0).map(key => answerLabels[key]).filter(Boolean).slice(0, 2), rank: index + 1 }))
}

export default function ProgramFinderPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0) // 0..2 = a question, 3 = results
  const answered = questions.filter(question => answers[question.key]).length
  const done = answered === questions.length && step === questions.length
  const results = useMemo(() => done ? ranked(answers) : [], [answers, done])
  const totalSteps = questions.length + 1

  function choose(key: string, value: string) {
    setAnswers(current => ({ ...current, [key]: value }))
    setStep(current => Math.min(current + 1, questions.length))
  }
  function startOver() {
    setAnswers({})
    setStep(0)
  }

  return (
    <div className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="flex items-start gap-4">
            <Mascot pose={done ? 'point' : 'wave'} size={64} className="hidden shrink-0 sm:block" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Student tools</p>
              <h1 className="mt-2 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">What should I study?</h1>
              <p className="mt-3 text-sm leading-6 text-sn-ink-soft">Answer three questions to compare study areas, then explore real colleges and official programme requirements.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-sn-surface-alt" aria-label={`Step ${Math.min(step + 1, totalSteps)} of ${totalSteps}`}>
              <div className="h-full rounded-full bg-sn-primary transition-all" style={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }} />
            </div>
            <span className="shrink-0 text-xs font-bold text-sn-ink-muted">{done ? 'Results' : `Step ${step + 1} of ${questions.length}`}</span>
          </div>
        </div>
      </section>

      <main id="main-content" className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        {!done && (
          <div className="rounded-sn-card border border-sn-border bg-sn-surface p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Question {step + 1} of {questions.length}</p>
            <h2 className="mt-2 font-baloo text-xl font-bold text-sn-ink">{questions[step].title}</h2>
            <div className="mt-5 grid gap-2.5">
              {questions[step].options.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => choose(questions[step].key, value)}
                  aria-pressed={answers[questions[step].key] === value}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-sn-control border border-sn-border-strong p-4 text-left text-sm font-bold text-sn-ink-soft transition-colors hover:border-sn-primary hover:bg-sn-primary-bg hover:text-sn-primary-hover"
                >
                  <span>{label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep(current => Math.max(0, current - 1))} className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-sn-ink-muted hover:text-sn-primary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
              </button>
            )}
          </div>
        )}

        {done && (
          <section aria-labelledby="finder-results">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Your starting points</p>
            <h2 id="finder-results" className="mt-2 font-baloo text-2xl font-bold text-sn-ink">Three study areas worth exploring</h2>
            <p className="mt-2 text-sm leading-6 text-sn-ink-soft">These are ranked from your answers. A close second or third result can be just as suitable after checking subjects, cost and career goals.</p>
            <div className="mt-5 space-y-4">
              {results.map(result => (
                <article key={result.area} className={`rounded-sn-card border p-5 sm:p-6 ${result.rank === 1 ? 'border-sn-primary/30 bg-sn-ink text-white' : 'border-sn-border bg-sn-surface text-sn-ink'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-[0.08em] ${result.rank === 1 ? 'text-white/70' : 'text-sn-primary-hover'}`}>{result.rank === 1 ? 'Strongest match' : `Alternative ${result.rank - 1}`}</p>
                      <h3 className="mt-1 font-baloo text-xl font-bold">{result.title}</h3>
                    </div>
                    <Pill tone={result.rank === 1 ? 'neutral' : 'primary'} className={result.rank === 1 ? '!bg-white/10 !text-white' : ''}>Score {result.score}</Pill>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${result.rank === 1 ? 'text-white/80' : 'text-sn-ink-soft'}`}>{result.description}</p>
                  <p className={`mt-3 text-xs leading-5 ${result.rank === 1 ? 'text-white/70' : 'text-sn-ink-muted'}`}><strong>Why:</strong> {result.reason.join(' and ')}.</p>
                  <p className={`mt-2 text-xs leading-5 ${result.rank === 1 ? 'text-amber-200' : 'text-sn-confirm-ink'}`}><strong>Check first:</strong> {result.caution}</p>
                  <Button.Link href={`/colleges?level=bachelor&faculty=${encodeURIComponent(result.area)}`} variant={result.rank === 1 ? 'secondary' : 'primary'} className={`mt-5 ${result.rank === 1 ? '!bg-white !text-sn-primary !border-white' : ''}`}>
                    <Compass className="h-4 w-4" aria-hidden="true" />Explore matching colleges
                  </Button.Link>
                </article>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-sn-ink-muted">This transparent preference matcher is not a career assessment or eligibility decision. Confirm subjects, GPA, entrance rules, fees and official notices before applying.</p>
            <button type="button" onClick={startOver} className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-sn-ink-muted hover:text-sn-primary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />Start again
            </button>
          </section>
        )}

        {!done && answered > 0 && (
          <p className="mt-5 flex items-center gap-1.5 text-xs text-sn-ink-muted">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sn-verified" aria-hidden="true" />
            {answered} of {questions.length} answered
          </p>
        )}

        <p className="mt-8 text-center text-xs text-sn-ink-muted">
          Prefer to browse directly? <Link href="/colleges" className="font-bold text-sn-primary hover:underline">Go to the college directory</Link>
        </p>
      </main>
    </div>
  )
}
