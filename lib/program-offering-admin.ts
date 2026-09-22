const STATUSES = ['draft', 'published', 'archived'] as const
type OfferingStatus = typeof STATUSES[number]

type OfferingInput = {
  university_id: string
  display_name: string | null
  duration: string
  eligibility: string | null
  entrance_requirements: string | null
  overview: string | null
  curriculum_highlights: string[]
  official_program_url: string
  source_name: string
  source_published_at: string | null
  last_verified_at: string
  status: OfferingStatus
  updated_at: string
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : ''
}

function longText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) || null : null
}

function list(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => text(item, 180))
    .filter(Boolean)
    .slice(0, 30)
}

function httpsUrl(value: unknown) {
  const raw = text(value, 1000)
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

function optionalDate(value: unknown) {
  const raw = text(value, 40)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** Validate the university-specific facts editors may publish. */
export function parseProgramOfferingInput(body: unknown): { value: OfferingInput } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid university programme data.' }
  const input = body as Record<string, unknown>
  const universityId = text(input.university_id, 80)
  const duration = text(input.duration, 80)
  const sourceName = text(input.source_name, 180)
  const officialProgramUrl = httpsUrl(input.official_program_url)
  const status = text(input.status, 20) as OfferingStatus
  const publishedAt = optionalDate(input.source_published_at)

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(universityId)) {
    return { error: 'Choose a valid awarding university.' }
  }
  if (!duration) return { error: 'University-specific duration is required.' }
  if (!sourceName) return { error: 'Name the official source.' }
  if (!officialProgramUrl) return { error: 'An official HTTPS programme URL is required.' }
  if (!STATUSES.includes(status)) return { error: 'Choose a valid publication status.' }
  if (publishedAt === undefined) return { error: 'Source publication date is invalid.' }

  return {
    value: {
      university_id: universityId,
      display_name: text(input.display_name, 220) || null,
      duration,
      eligibility: longText(input.eligibility, 4000),
      entrance_requirements: longText(input.entrance_requirements, 4000),
      overview: longText(input.overview, 6000),
      curriculum_highlights: list(input.curriculum_highlights),
      official_program_url: officialProgramUrl,
      source_name: sourceName,
      source_published_at: publishedAt,
      last_verified_at: new Date().toISOString(),
      status,
      updated_at: new Date().toISOString(),
    },
  }
}
