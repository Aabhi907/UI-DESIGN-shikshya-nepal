'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calculator, RotateCcw, Plus, Trash2 } from 'lucide-react'

const grades = [
  { label: 'A+', point: 4.0 }, { label: 'A', point: 3.6 }, { label: 'B+', point: 3.2 },
  { label: 'B', point: 2.8 }, { label: 'C+', point: 2.4 }, { label: 'C', point: 2.0 },
  { label: 'D+', point: 1.6 }, { label: 'D', point: 1.2 }, { label: 'E', point: 0.8 },
  { label: 'Not graded / fail', point: 0 },
]
type Subject = { id: number; name: string; grade: string; credit: number }
const initial = (): Subject[] => ['Compulsory English', 'Compulsory Nepali', 'Mathematics', 'Science', 'Social Studies', 'Optional subject'].map((name, index) => ({ id: index + 1, name, grade: '', credit: 1 }))

export default function GpaCalculatorPage() {
  const [subjects, setSubjects] = useState<Subject[]>(initial)
  const result = useMemo(() => {
    const completed = subjects.filter(subject => subject.grade)
    const credits = completed.reduce((sum, subject) => sum + Math.max(0, Number(subject.credit) || 0), 0)
    const points = completed.reduce((sum, subject) => sum + (grades.find(grade => grade.label === subject.grade)?.point || 0) * Math.max(0, Number(subject.credit) || 0), 0)
    return { completed: completed.length, gpa: credits ? points / credits : null }
  }, [subjects])
  const update = (id: number, changes: Partial<Subject>) => setSubjects(all => all.map(subject => subject.id === id ? { ...subject, ...changes } : subject))
  const add = () => setSubjects(all => [...all, { id: Date.now(), name: '', grade: '', credit: 1 }])

  return (
    <div className="min-h-screen bg-sn-ground text-sn-ink">
      <section className="border-b border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-[#151518]/70 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary dark:text-[#CAFFA6] font-mono">Student tools</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">SEE &amp; NEB GPA calculator</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 font-nunito leading-relaxed">
            Add your subjects and grades to calculate a weighted GPA. Your data stays in this browser—it is not saved or sent anywhere.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section className="apple-card rounded-[24px] p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your subjects</h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-nunito">Enter your courses and grading marks</p>
            </div>
            <button
              onClick={() => setSubjects(initial())}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {subjects.map((subject, index) => (
              <div
                key={subject.id}
                className="group/row grid gap-2.5 rounded-[18px] bg-slate-50/90 dark:bg-white/[0.03] border border-black/[0.12] dark:border-white/[0.08] p-3 transition-all duration-200 hover:border-black/[0.12] dark:hover:border-white/[0.14] sm:grid-cols-[1fr_130px_80px_44px] sm:items-center"
              >
                <input
                  aria-label={`Subject ${index + 1} name`}
                  value={subject.name}
                  onChange={event => update(subject.id, { name: event.target.value })}
                  placeholder={`Subject ${index + 1}`}
                  className="min-h-11 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1c1c22] px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/20 transition-all"
                />
                <select
                  aria-label={`Grade for ${subject.name || `subject ${index + 1}`}`}
                  value={subject.grade}
                  onChange={event => update(subject.id, { grade: event.target.value })}
                  className="min-h-11 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1c1c22] px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/20 transition-all"
                >
                  <option value="" className="bg-white dark:bg-[#1c1c22] text-slate-600 dark:text-slate-300">Select grade</option>
                  {grades.map(grade => (
                    <option key={grade.label} value={grade.label} className="bg-white dark:bg-[#1c1c22] text-slate-900 dark:text-white">
                      {grade.label} — {grade.point.toFixed(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  aria-label={`Credit for ${subject.name || `subject ${index + 1}`}`}
                  value={subject.credit}
                  onChange={event => update(subject.id, { credit: Number(event.target.value) })}
                  className="min-h-11 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1c1c22] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/20 transition-all"
                />
                {subjects.length > 1 ? (
                  <button
                    onClick={() => setSubjects(all => all.filter(item => item.id !== subject.id))}
                    aria-label={`Remove ${subject.name || 'subject'}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 active:scale-[0.95] transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={add}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/[0.1] dark:border-white/[0.14] bg-black/[0.04] dark:bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-[#CAFFA6] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] hover:border-black/[0.18] dark:hover:border-white/[0.22] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add subject
          </button>

          <p className="mt-5 text-xs leading-5 text-slate-600 dark:text-slate-300">
            Use credit 1 for equal-weight subjects. For a course with theory and practical components, add them separately or use the official credit weighting.
          </p>
        </section>

        <aside className="space-y-5">
          <section className="apple-card apple-stat-card relative overflow-hidden rounded-[24px] p-6 text-white border border-white/[0.12] shadow-xl">
            <div className="flex items-center justify-between">
              <Calculator className="h-6 w-6 text-[#CAFFA6]" />
              <span className="rounded-full bg-white/[0.1] px-2.5 py-0.5 text-[11px] font-mono font-semibold text-white/80">
                Official scale
              </span>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/70">Calculated GPA</p>
            <p className="mt-1 font-mono text-5xl font-extrabold text-[#CAFFA6] tracking-tight transition-transform duration-200">
              {result.gpa === null ? '—' : result.gpa.toFixed(2)}
            </p>
            <p className="mt-3 text-xs text-white/80">
              {result.completed} of {subjects.length} subject{subjects.length === 1 ? '' : 's'} graded
            </p>
          </section>

          <section className="apple-card rounded-[22px] border border-amber-600/20 dark:border-amber-500/20 bg-amber-500/[0.06] dark:bg-amber-500/[0.08] p-5 text-sm leading-6 text-amber-900 dark:text-amber-200/90">
            <h2 className="font-bold text-amber-900 dark:text-amber-300">Important</h2>
            <p className="mt-2 text-xs sm:text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
              This is an estimate based on entered grades and credits. Colleges may use their own eligibility rules, subject requirements, or entrance examinations. Confirm with the official admission notice.
            </p>
          </section>

          <Link
            href="/colleges"
            className="apple-control block min-h-12 rounded-[18px] bg-sn-primary px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-sn-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all text-center flex items-center justify-center"
          >
            Explore colleges and programs
          </Link>
        </aside>
      </main>
    </div>
  )
}
