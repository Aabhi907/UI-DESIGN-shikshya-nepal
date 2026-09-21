#!/usr/bin/env node

/**
 * Convert the full 80-record research export into a review-first SQL import.
 *
 * The generated migration deliberately creates pending college_evidence rows.
 * It never publishes a claim, changes verification status, or imports dynamic
 * fee, seat, scholarship, or admission information.
 *
 * Usage:
 *   node scripts/prepare-college-research-evidence.mjs /path/to/1.txt \
 *     supabase/migrations/20261021_import_80_research_evidence.sql
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const [inputPath, outputPath] = process.argv.slice(2)

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/prepare-college-research-evidence.mjs <research.txt> <output.sql>')
  process.exit(1)
}

const squash = (value) => value.replace(/\s+/g, ' ').trim()
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`
const field = (profile, label) => squash(profile.match(new RegExp(`^${label}:\\s*(.+)$`, 'mi'))?.[1] || '')
const firstHttpsUrl = (value) => value.match(/https:\/\/[^\s<>()]+/i)?.[0].replace(/[.,;]+$/, '') || ''
const section = (profile, number) => {
  const next = number + 1
  return squash(profile.match(new RegExp(`\\n${number}\\. [A-Z &]+\\n([\\s\\S]*?)(?=\\n${next}\\. [A-Z &]+|$)`))?.[1] || '')
}

function researchQueueSlugs(markdown) {
  return markdown.split('\n')
    .map((line) => line.match(/^\|\s*(\d+)\s*\|.*?\|\s*`([^`]+)`\s*\|/))
    .filter(Boolean)
    .map((match) => ({ number: Number(match[1]), slug: match[2] }))
    .sort((left, right) => left.number - right.number)
}

function evidenceForProfile(profile, slug) {
  const identity = section(profile, 1)
  const sourceLedger = section(profile, 9)
  const website = field(profile, 'Official website') || firstHttpsUrl(identity) || firstHttpsUrl(sourceLedger)
  if (!/^https:\/\//i.test(website)) return []

  const affiliation = field(profile, 'Affiliation / awarding body') || field(profile, 'Recognition / affiliation')
  const programmes = section(profile, 3)
  const facilities = section(profile, 6).split(/Student-fit note from research pack:/i)[0].trim()
  const location = field(profile, 'Location') || field(profile, 'Location / campus')
  const established = field(profile, 'Established')
  const sourceName = 'Nepal Education Institutions full research dataset (review required)'
  const common = { slug, sourceName, website, confidence: 65 }
  const records = []

  if (affiliation && !/^(unknown|not stated)/i.test(affiliation)) records.push({ ...common, key: 'affiliation', claim: `Dataset records: ${affiliation}. Confirm per programme before publishing.` })
  if (programmes && !/^unknown/i.test(programmes)) records.push({ ...common, key: 'programs', claim: `Dataset records: ${programmes}` })
  if (facilities && !/^unknown/i.test(facilities)) records.push({ ...common, key: 'facilities', claim: `Dataset records: ${facilities}` })
  const contact = [location && `Location: ${location}`, established && !/^unknown/i.test(established) && `Established: ${established}`, `Official website: ${website}`].filter(Boolean).join('. ')
  if (contact) records.push({ ...common, key: 'contact', claim: contact })

  return records.filter((record) => record.claim.length >= 3).map((record) => ({ ...record, claim: record.claim.slice(0, 500) }))
}

const [dataset, brief] = await Promise.all([
  readFile(resolve(inputPath), 'utf8'),
  readFile(resolve('docs/COLLEGE_RESEARCH_BRIEF.md'), 'utf8'),
])
const slugByNumber = new Map(researchQueueSlugs(brief).map((item) => [item.number, item.slug]))
const profiles = [...dataset.matchAll(/^#{88}\n(\d{2})\. ([^\n]+)\n#{88}\n([\s\S]*?)(?=^#{88}\n\d{2}\. |(?![\s\S]))/gm)]

if (profiles.length !== 80 || slugByNumber.size !== 80) {
  throw new Error(`Expected 80 research profiles and 80 queue slugs; found ${profiles.length} profiles and ${slugByNumber.size} slugs.`)
}

const excluded = []
const records = []
for (const match of profiles) {
  const number = Number(match[1])
  const name = match[2]
  const slug = slugByNumber.get(number)
  const type = field(match[3], 'Type')
  const isK12School = /not a college/i.test(type) || (/\bschool\b/i.test(type) && !/higher-education|university constituent|college|bachelor|diploma|tertiary/i.test(type))
  if (!slug || slug === 'select-school-below-to-apply-kat' || isK12School) {
    excluded.push(`${number}. ${name}`)
    continue
  }
  records.push(...evidenceForProfile(match[3], slug))
}

const values = records.map((record) => `  (${[record.slug, record.key, record.claim, record.sourceName, record.website, record.confidence].map(sql).join(', ')})`).join(',\n')
const output = `-- Generated from Nepal Education Institutions — Full 80-Record Dataset on 21 September 2026.\n-- Review-first import: every claim begins pending and is not shown publicly.\n-- Dynamic fees, seats, scholarships and admissions are intentionally excluded.\n\nWITH imported(college_slug, field_key, claim_summary, source_name, source_url, confidence_score) AS (\nVALUES\n${values}\n)\nINSERT INTO public.college_evidence (college_id, field_key, claim_summary, source_name, source_url, checked_at, confidence_score, verification_status, extraction_method)\nSELECT colleges.id, imported.field_key, imported.claim_summary, imported.source_name, imported.source_url, '2026-09-21T00:00:00+05:45'::timestamptz, imported.confidence_score::smallint, 'pending', 'structured_import'\nFROM imported\nJOIN public.colleges ON colleges.slug = imported.college_slug\nON CONFLICT (college_id, field_key, source_url) WHERE superseded_at IS NULL DO NOTHING;\n\n-- Excluded from the college evidence ledger: ${excluded.join('; ')}.\n`

await writeFile(resolve(outputPath), output)
console.log(JSON.stringify({ profiles: profiles.length, evidenceRecords: records.length, excluded, output: resolve(outputPath) }, null, 2))
