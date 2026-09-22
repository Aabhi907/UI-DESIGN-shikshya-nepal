export type EntranceExamStatus = 'draft' | 'published' | 'closed'

export interface EntranceExamInput {
  title: string
  exam_body: string | null
  program: string | null
  education_level: string | null
  application_deadline: string | null
  exam_date: string | null
  fee: number | null
  eligibility: string | null
  source_name: string
  source_url: string
  exam_url: string
  syllabus_url: string | null
  status: EntranceExamStatus
}

type ParseResult = { value: EntranceExamInput } | { error: string }

const STATUSES: EntranceExamStatus[] = ['draft', 'published', 'closed']

function text(value: unknown, label: string, max: number, required = false): string | null | { error: string } {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) return { error: `${label} is required.` }
  if (result.length > max) return { error: `${label} must be ${max} characters or fewer.` }
  return result || null
}

function url(value: unknown, label: string, required = false): string | null | { error: string } {
  const result = text(value, label, 2_000, required)
  if (typeof result === 'object' || !result) return result
  try {
    const parsed = new URL(result)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol')
    return parsed.toString()
  } catch {
    return { error: `${label} must be a valid http(s) URL.` }
  }
}

function date(value: unknown, label: string): string | null | { error: string } {
  const result = text(value, label, 80)
  if (typeof result === 'object' || !result) return result
  const parsed = new Date(result)
  return Number.isNaN(parsed.getTime()) ? { error: `${label} is not a valid date.` } : parsed.toISOString()
}

function valueOrError<T>(value: T | { error: string }): T | { error: string } {
  return value
}

export function parseEntranceExamInput(body: unknown): ParseResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid request body.' }
  const raw = body as Record<string, unknown>

  const title = valueOrError(text(raw.title, 'Title', 220, true))
  const sourceName = valueOrError(text(raw.source_name, 'Official source name', 160, true))
  const sourceUrl = valueOrError(url(raw.source_url, 'Official source URL', true))
  const examUrl = valueOrError(url(raw.exam_url, 'Application form URL'))
  const syllabusUrl = valueOrError(url(raw.syllabus_url, 'Syllabus URL'))
  const examBody = valueOrError(text(raw.exam_body, 'Exam authority', 160))
  const program = valueOrError(text(raw.program, 'Programme', 500))
  const level = valueOrError(text(raw.education_level, 'Education level', 80))
  const eligibility = valueOrError(text(raw.eligibility, 'Eligibility', 2_000))
  const deadline = valueOrError(date(raw.application_deadline, 'Application deadline'))
  const examDate = valueOrError(date(raw.exam_date, 'Exam date'))

  for (const item of [title, sourceName, sourceUrl, examUrl, syllabusUrl, examBody, program, level, eligibility, deadline, examDate]) {
    if (typeof item === 'object' && item !== null && 'error' in item) return item
  }

  const rawFee = raw.fee === '' || raw.fee === null || raw.fee === undefined ? null : Number(raw.fee)
  if (rawFee !== null && (!Number.isFinite(rawFee) || rawFee < 0 || rawFee > 10_000_000)) {
    return { error: 'Application fee must be a valid amount.' }
  }

  const status = raw.status
  if (!STATUSES.includes(status as EntranceExamStatus)) return { error: 'Choose a valid publication status.' }

  return {
    value: {
      title: title as string,
      source_name: sourceName as string,
      source_url: sourceUrl as string,
      exam_url: (examUrl as string | null) || (sourceUrl as string),
      syllabus_url: syllabusUrl as string | null,
      exam_body: examBody as string | null,
      program: program as string | null,
      education_level: level as string | null,
      eligibility: eligibility as string | null,
      application_deadline: deadline as string | null,
      exam_date: examDate as string | null,
      fee: rawFee,
      status: status as EntranceExamStatus,
    },
  }
}

export function isEntranceExamStatus(value: unknown): value is EntranceExamStatus {
  return STATUSES.includes(value as EntranceExamStatus)
}
