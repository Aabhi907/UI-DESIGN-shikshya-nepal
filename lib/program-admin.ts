import { slugify } from '@/lib/utils'

const DEGREE_LEVELS = ['+2', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate'] as const
type DegreeLevel = typeof DEGREE_LEVELS[number]

type ProgramInput = {
  name: string
  slug: string
  duration: string
  degree_level: DegreeLevel
  faculty: string
  overview: string | null
  eligibility: string | null
  entrance_requirements: string | null
  curriculum_highlights: string[]
  career_paths: string[]
  average_fee_min: number | null
  average_fee_max: number | null
  source_url: string
  last_verified_at: string
}

function shortText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : ''
}

function longText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) || null : null
}

function list(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => shortText(item, 180))
    .filter(Boolean)
    .slice(0, 20)
}

function nonNegativeNumber(value: unknown): { value: number | null } | { error: string } {
  if (value === null || value === undefined || value === '') return { value: null as number | null }
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= 0 ? { value: number } : { error: 'Fees must be valid non-negative amounts.' }
}

function officialHttpsUrl(value: unknown) {
  const raw = shortText(value, 1000)
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

/** Only accepts fields that the programmes table is allowed to store. */
export function parseProgramInput(body: unknown): { value: ProgramInput } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid programme data.' }
  const input = body as Record<string, unknown>
  const name = shortText(input.name, 180)
  const duration = shortText(input.duration, 60)
  const faculty = shortText(input.faculty, 120)
  const degreeLevel = shortText(input.degree_level, 20) as DegreeLevel
  const sourceUrl = officialHttpsUrl(input.source_url)
  const customSlug = shortText(input.slug, 180)
  const slug = customSlug || slugify(name)

  if (!name || !duration || !faculty || !DEGREE_LEVELS.includes(degreeLevel)) return { error: 'Name, duration, faculty and a valid level are required.' }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: 'Slug may use lowercase letters, numbers and hyphens only.' }
  if (!sourceUrl) return { error: 'An official HTTPS source URL is required before programme information can be saved.' }

  const minimum = nonNegativeNumber(input.average_fee_min)
  const maximum = nonNegativeNumber(input.average_fee_max)
  if (!('value' in minimum)) return { error: minimum.error }
  if (!('value' in maximum)) return { error: maximum.error }
  if (minimum.value !== null && maximum.value !== null && minimum.value > maximum.value) return { error: 'Minimum fee cannot be greater than maximum fee.' }

  return {
    value: {
      name,
      slug,
      duration,
      degree_level: degreeLevel,
      faculty,
      overview: longText(input.overview, 5000),
      eligibility: longText(input.eligibility, 3000),
      entrance_requirements: longText(input.entrance_requirements, 3000),
      curriculum_highlights: list(input.curriculum_highlights),
      career_paths: list(input.career_paths),
      average_fee_min: minimum.value,
      average_fee_max: maximum.value,
      source_url: sourceUrl,
      last_verified_at: new Date().toISOString(),
    },
  }
}
