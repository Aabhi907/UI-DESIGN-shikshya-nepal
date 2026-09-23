// Reproducible test for the "date-only deadline disappears at midnight on its
// own day" fix in app/(main)/scholarships/page.tsx and
// app/(main)/opportunities/page.tsx.
//
// Seeds one row with today's date-only deadline and one with yesterday's, for
// both scholarships and student_opportunities, then runs the exact same
// Supabase filter the pages use (both the fixed "start of today" boundary and
// the old buggy "exact current instant" boundary) to prove: the fix keeps a
// same-day deadline visible, the bug would have hidden it, and a genuinely
// past deadline is excluded either way.
//
// Run with: node scripts/test-deadline-visibility.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY in .env.local.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Same helper as the fixed pages.
const startOfTodayIso = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString() }
// The old, buggy boundary the pages used before this fix.
const exactNowIso = () => new Date().toISOString()

const toDateOnly = (d) => d.toISOString().slice(0, 10)
const todayDateOnly = toDateOnly(new Date())
const yesterdayDateOnly = toDateOnly(new Date(Date.now() - 86400000))

let failures = 0
function check(label, condition) {
  if (condition) console.log(`PASS: ${label}`)
  else { failures++; console.error(`FAIL: ${label}`) }
}

async function idsMatchingBoundary(table, activeColumn, boundaryIso, candidateIds) {
  const { data, error } = await db.from(table).select('id')
    .eq(activeColumn, true)
    .or(`deadline.gte.${boundaryIso},deadline.is.null`)
    .in('id', candidateIds)
  if (error) throw new Error(`${table} query failed: ${error.message}`)
  return new Set((data || []).map((r) => r.id))
}

async function testScholarships() {
  const stamp = `test-deadline-${Date.now()}`
  const { data: todayRow, error: e1 } = await db.from('scholarships').insert({
    title: `TEST DEADLINE TODAY ${stamp}`, deadline: todayDateOnly, is_active: true,
  }).select('id').single()
  const { data: yesterdayRow, error: e2 } = await db.from('scholarships').insert({
    title: `TEST DEADLINE YESTERDAY ${stamp}`, deadline: yesterdayDateOnly, is_active: true,
  }).select('id').single()
  if (e1 || e2 || !todayRow || !yesterdayRow) throw new Error(`Failed to seed scholarships: ${e1?.message || e2?.message}`)

  try {
    const candidateIds = [todayRow.id, yesterdayRow.id]
    const withFix = await idsMatchingBoundary('scholarships', 'is_active', startOfTodayIso(), candidateIds)
    const withBug = await idsMatchingBoundary('scholarships', 'is_active', exactNowIso(), candidateIds)

    check('scholarships: fixed query includes a date-only deadline of today', withFix.has(todayRow.id))
    check('scholarships: fixed query excludes a date-only deadline of yesterday', !withFix.has(yesterdayRow.id))
    check('scholarships: the old exact-instant comparison would have excluded today\'s deadline (proves this is a real regression, not a tautology)', !withBug.has(todayRow.id))
    check('scholarships: the old comparison also excluded yesterday\'s deadline (unchanged, already correct)', !withBug.has(yesterdayRow.id))
  } finally {
    await db.from('scholarships').delete().in('id', [todayRow.id, yesterdayRow.id])
  }
}

async function testOpportunities() {
  const stamp = `test-deadline-${Date.now()}`
  const base = {
    opportunity_type: 'internship', organisation: 'Test Org', summary: 'Seeded by scripts/test-deadline-visibility.mjs — safe to delete.',
    application_url: 'https://example.test/apply', is_published: true,
  }
  const { data: todayRow, error: e1 } = await db.from('student_opportunities').insert({
    ...base, title: `TEST DEADLINE TODAY ${stamp}`, slug: `test-deadline-today-${stamp}`, deadline: todayDateOnly,
  }).select('id').single()
  const { data: yesterdayRow, error: e2 } = await db.from('student_opportunities').insert({
    ...base, title: `TEST DEADLINE YESTERDAY ${stamp}`, slug: `test-deadline-yesterday-${stamp}`, deadline: yesterdayDateOnly,
  }).select('id').single()
  if (e1 || e2 || !todayRow || !yesterdayRow) throw new Error(`Failed to seed student_opportunities: ${e1?.message || e2?.message}`)

  try {
    const candidateIds = [todayRow.id, yesterdayRow.id]
    const withFix = await idsMatchingBoundary('student_opportunities', 'is_published', startOfTodayIso(), candidateIds)
    const withBug = await idsMatchingBoundary('student_opportunities', 'is_published', exactNowIso(), candidateIds)

    check('opportunities: fixed query includes a date-only deadline of today', withFix.has(todayRow.id))
    check('opportunities: fixed query excludes a date-only deadline of yesterday', !withFix.has(yesterdayRow.id))
    check('opportunities: the old exact-instant comparison would have excluded today\'s deadline (proves this is a real regression, not a tautology)', !withBug.has(todayRow.id))
    check('opportunities: the old comparison also excluded yesterday\'s deadline (unchanged, already correct)', !withBug.has(yesterdayRow.id))
  } finally {
    await db.from('student_opportunities').delete().in('id', [todayRow.id, yesterdayRow.id])
  }
}

async function main() {
  await testScholarships()
  await testOpportunities()
  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll deadline-visibility checks passed.')
}

main().catch((e) => {
  console.error('Test script crashed:', e)
  process.exit(1)
})
