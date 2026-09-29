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
    <div className="min-h-screen bg-[#0f1012] text-[#f5f5f6]">
      <section className="border-b border-white/[0.08] bg-[#151518]/70 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#CAFFA6] font-mono">Student tools</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-[#f5f5f6] sm:text-4xl">SEE &amp; NEB GPA calculator</h1>
          <p className="mt-3 max-w-2xl text-[#8e8e96] font-nunito leading-relaxed">
            Add your subjects and grades to calculate a weighted GPA. Your data stays in this browser—it is not saved or sent anywhere.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-white/[0.08] bg-[#151518] p-5 sm:p-7 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-[#f5f5f6]">Your subjects</h2>
            <button
              onClick={() => setSubjects(initial())}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#8e8e96] hover:bg-white/[0.06] hover:text-[#f5f5f6] motion-control transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {subjects.map((subject, index) => (
              <div key={subject.id} className="grid gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:grid-cols-[1fr_130px_80px_44px] sm:items-center">
                <input
                  aria-label={`Subject ${index + 1} name`}
                  value={subject.name}
                  onChange={event => update(subject.id, { name: event.target.value })}
                  placeholder={`Subject ${index + 1}`}
                  className="min-h-11 rounded-lg border border-white/[0.1] bg-[#1c1c22] px-3 py-2 text-sm text-[#f5f5f6] placeholder-[#8e8e96] outline-none focus:border-[#CAFFA6]/60 focus:ring-1 focus:ring-[#CAFFA6]/40 transition-all"
                />
                <select
                  aria-label={`Grade for ${subject.name || `subject ${index + 1}`}`}
                  value={subject.grade}
                  onChange={event => update(subject.id, { grade: event.target.value })}
                  className="min-h-11 rounded-lg border border-white/[0.1] bg-[#1c1c22] px-3 py-2 text-sm text-[#f5f5f6] outline-none focus:border-[#CAFFA6]/60 focus:ring-1 focus:ring-[#CAFFA6]/40 transition-all"
                >
                  <option value="" className="bg-[#1c1c22] text-[#8e8e96]">Select grade</option>
                  {grades.map(grade => (
                    <option key={grade.label} value={grade.label} className="bg-[#1c1c22] text-[#f5f5f6]">
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
                  className="min-h-11 rounded-lg border border-white/[0.1] bg-[#1c1c22] px-3 py-2 text-sm text-[#f5f5f6] outline-none focus:border-[#CAFFA6]/60 focus:ring-1 focus:ring-[#CAFFA6]/40 transition-all"
                />
                {subjects.length > 1 ? (
                  <button
                    onClick={() => setSubjects(all => all.filter(item => item.id !== subject.id))}
                    aria-label={`Remove ${subject.name || 'subject'}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-[#8e8e96] hover:bg-red-500/10 hover:text-red-400 motion-control transition-colors"
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
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-[#CAFFA6] hover:bg-white/[0.08] hover:border-white/[0.25] transition-all motion-control"
          >
            <Plus className="h-4 w-4" />
            Add subject
          </button>

          <p className="mt-5 text-xs leading-5 text-[#8e8e96]">
            Use credit 1 for equal-weight subjects. For a course with theory and practical components, add them separately or use the official credit weighting.
          </p>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl bg-gradient-to-br from-[#173743] to-[#0a0b0d] p-6 text-white border border-white/[0.08] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.7)]">
            <Calculator className="h-6 w-6 text-[#CAFFA6]" />
            <p className="mt-5 text-sm font-semibold text-[#8e8e96]">Calculated GPA</p>
            <p className="mt-1 font-mono text-5xl font-extrabold text-[#CAFFA6] tracking-tight">
              {result.gpa === null ? '—' : result.gpa.toFixed(2)}
            </p>
            <p className="mt-3 text-sm text-[#c4c4cc]">
              {result.completed} subject{result.completed === 1 ? '' : 's'} graded
            </p>
          </section>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-200/90">
            <h2 className="font-bold text-amber-300">Important</h2>
            <p className="mt-2 text-xs sm:text-sm text-amber-200/80 leading-relaxed">
              This is an estimate based on entered grades and credits. Colleges may use their own eligibility rules, subject requirements, or entrance examinations. Confirm with the official admission notice.
            </p>
          </section>

          <Link
            href="/colleges"
            className="block min-h-11 rounded-xl bg-sn-primary px-4 py-3 text-center text-sm font-bold text-white hover:bg-sn-primary-hover shadow-sm transition-all motion-control"
          >
            Explore colleges and programs
          </Link>
        </aside>
      </main>
    </div>
  )
}
