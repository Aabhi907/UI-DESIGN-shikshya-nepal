import { slugify } from '@/lib/utils'

const institutionTypes = ['school', 'college', 'university', 'training_provider', 'other'] as const
const admissionTypes = ['general', 'entrance', 'scholarship', 'quota', 'transfer', 'other'] as const
const statuses = ['draft', 'published', 'closed', 'archived'] as const
const verificationStatuses = ['unverified', 'source_verified', 'institution_verified'] as const
const schoolLevels = ['ECD / Grade 1-10', 'SEE']
const collegeLevels = ['+2', 'Diploma', 'Certificate', 'Bachelor', 'Master', 'MPhil', 'PhD']
type Parsed<T> = { value: T } | { error: string }

function text(value: unknown, max: number) { return typeof value === 'string' ? value.trim().slice(0, max) : '' }
function optionalText(value: unknown, max: number) { return text(value, max) || null }
function list(value: unknown, maxItems: number, itemLength: number) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map(item => text(item, itemLength)).filter(Boolean).slice(0, maxItems) : [] }
function allowed<T extends readonly string[]>(value: unknown, values: T) { const candidate = text(value, 80); return values.includes(candidate) ? candidate as T[number] : null }
function httpsUrl(value: unknown, optional = false): Parsed<string | null> { const raw = text(value, 1200); if (!raw && optional) return { value: null }; try { const parsed = new URL(raw); return parsed.protocol === 'https:' ? { value: parsed.toString() } : { error: 'URLs must use HTTPS.' } } catch { return { error: 'Enter a valid HTTPS URL.' } } }
function nonNegative(value: unknown, label: string): Parsed<number | null> { if (value === null || value === undefined || value === '') return { value: null }; const number = typeof value === 'number' ? value : Number(value); return Number.isFinite(number) && number >= 0 ? { value: number } : { error: `${label} must be a valid non-negative number.` } }
function dateTime(value: unknown, label: string): Parsed<string | null> { const raw = text(value, 80); if (!raw) return { value: null }; return Number.isNaN(Date.parse(raw)) ? { error: `${label} is not a valid date and time.` } : { value: raw } }

export function parseAdmissionInput(body: unknown, fallbackSlug = ''): { value: Record<string, unknown> } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid admission data.' }
  const input = body as Record<string, unknown>
  const title = text(input.title, 240), institutionName = text(input.institution_name, 200), sourceName = text(input.source_name, 200)
  const institutionType = allowed(input.institution_type, institutionTypes), admissionType = allowed(input.admission_type, admissionTypes)
  const status = allowed(input.status, statuses), verificationStatus = allowed(input.verification_status, verificationStatuses)
  const sourceUrl = httpsUrl(input.source_url), applicationUrl = httpsUrl(input.application_url, true)
  const openAt = dateTime(input.application_open_at, 'Opening date'), deadline = dateTime(input.application_deadline, 'Deadline'), examAt = dateTime(input.entrance_exam_at, 'Entrance exam date')
  const fee = nonNegative(input.application_fee, 'Application fee'), seats = nonNegative(input.available_seats, 'Available seats')
  if (!title || !institutionName || !sourceName || !institutionType || !admissionType || !status || !verificationStatus) return { error: 'Title, institution, type, admission type, status, verification and source name are required.' }
  if (!('value' in sourceUrl)) return { error: sourceUrl.error }; if (!('value' in applicationUrl)) return { error: applicationUrl.error }
  if (!('value' in openAt)) return { error: openAt.error }; if (!('value' in deadline)) return { error: deadline.error }; if (!('value' in examAt)) return { error: examAt.error }
  if (!('value' in fee)) return { error: fee.error }; if (!('value' in seats)) return { error: seats.error }
  if (openAt.value && deadline.value && Date.parse(openAt.value) > Date.parse(deadline.value)) return { error: 'The opening date cannot be after the application deadline.' }
  const level = optionalText(input.education_level, 80)
  if (level && ((institutionType === 'school' && !schoolLevels.includes(level)) || ((institutionType === 'college' || institutionType === 'university') && !collegeLevels.includes(level)))) return { error: 'Schools may only use ECD/Grade 1–10 or SEE. +2 and higher admissions belong to colleges.' }
  const sponsored = input.is_sponsored === true, sponsorLabel = optionalText(input.sponsor_label, 160)
  if (sponsored && (!sponsorLabel || !/(sponsored|paid)/i.test(sponsorLabel))) return { error: 'Paid placements require a visible label containing “Sponsored” or “Paid”.' }
  const suppliedSlug = text(input.slug, 180), slug = suppliedSlug || fallbackSlug || `${slugify(title)}-${Date.now()}`
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: 'Slug may use lowercase letters, numbers and hyphens only.' }
  return { value: { title, slug, institution_type: institutionType, institution_name: institutionName, school_id: optionalText(input.school_id, 80), college_id: optionalText(input.college_id, 80), programs: list(input.programs, 30, 160), education_level: level, admission_type: admissionType, summary: optionalText(input.summary, 500), details: optionalText(input.details, 8000), eligibility: optionalText(input.eligibility, 3000), required_documents: list(input.required_documents, 30, 180), application_open_at: openAt.value, application_deadline: deadline.value, entrance_exam_at: examAt.value, application_fee: fee.value, available_seats: seats.value, application_url: applicationUrl.value, contact_phone: optionalText(input.contact_phone, 80), contact_email: optionalText(input.contact_email, 254), source_name: sourceName, source_url: sourceUrl.value, verification_status: verificationStatus, status, is_featured: input.is_featured === true, is_sponsored: sponsored, sponsor_label: sponsored ? sponsorLabel : null } }
}
