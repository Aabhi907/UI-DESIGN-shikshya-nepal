// Reproducible test for the ingestion-approval atomicity fix (see
// lib/ingestion-review.ts). Exercises the real applyIngestionReview() function
// against the real database — no mocking of Supabase itself, only of the one
// write call this test deliberately forces to fail.
//
// Run with: npx tsx scripts/test-ingestion-approval-atomicity.ts
// Requires SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (or the NEXT_PUBLIC_ variant)
// in .env.local, same as the running app.

import fs from 'node:fs'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { applyIngestionReview, type IngestionQueueItem } from '../lib/ingestion-review'

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

// Wraps a real Supabase client so that a single, specific write can be made to
// fail on demand — everything else passes straight through to the real client.
// This simulates "the queue-status update fails right after the insert
// succeeds" without touching the network for that one call, and without
// pretending the rest of Supabase is mocked.
function withFailingStatusUpdate(real: SupabaseClient) {
  const failingBuilder = {
    eq() { return failingBuilder },
    select() { return failingBuilder },
    single() { return failingBuilder },
    then(resolve: (value: { data: null; error: { message: string; code: string } }) => void) {
      resolve({ data: null, error: { message: 'Simulated network failure (test)', code: 'TEST_SIMULATED' } })
    },
  }
  return new Proxy(real, {
    get(target, prop, receiver) {
      if (prop !== 'from') return Reflect.get(target, prop, receiver)
      return (table: string) => {
        const builder = (target as any).from(table)
        if (table !== 'content_ingestion_items') return builder
        return new Proxy(builder, {
          get(builderTarget, builderProp, builderReceiver) {
            if (builderProp === 'update') {
              return (payload: Record<string, unknown>) => {
                // Only the final combined status-flip write carries `status` —
                // the earlier published_record_id-only link write does not.
                if ('status' in payload) return failingBuilder
                return builderTarget.update(payload)
              }
            }
            return Reflect.get(builderTarget, builderProp, builderReceiver)
          },
        })
      }
    },
  }) as SupabaseClient
}

async function countRows(table: string, column: string, value: string) {
  const { count, error } = await db.from(table).select('id', { count: 'exact', head: true }).eq(column, value)
  if (error) throw new Error(`count failed on ${table}: ${error.message}`)
  return count ?? 0
}

async function seedQueueItem(fingerprint: string): Promise<IngestionQueueItem & { status: string }> {
  const { data: university, error: uniError } = await db.from('universities').select('id').limit(1).single()
  if (uniError || !university) throw new Error('No university row found to attach the test notice to.')
  const { data, error } = await db.from('content_ingestion_items').insert({
    scraper_name: 'test-atomicity-script',
    target_type: 'notice',
    title: `TEST ATOMICITY ${fingerprint}`,
    source_url: 'https://example.test/atomicity-check',
    fingerprint,
    payload: {
      title: `TEST ATOMICITY ${fingerprint}`,
      slug: `test-atomicity-${fingerprint}`,
      content: 'Seeded by scripts/test-ingestion-approval-atomicity.ts — safe to delete.',
      university_id: university.id,
      notice_url: 'https://example.test/atomicity-check',
      published_date: new Date().toISOString(),
    },
    status: 'pending',
  }).select('*').single()
  if (error || !data) throw new Error(`Failed to seed queue item: ${error?.message}`)
  return data
}

async function cleanup(queueItemId: string, publishedRecordId: string | null) {
  if (publishedRecordId) await db.from('notices').delete().eq('id', publishedRecordId)
  await db.from('content_ingestion_items').delete().eq('id', queueItemId)
}

async function main() {
  let failures = 0
  const fingerprint = `atomicity-${Date.now()}`
  const item = await seedQueueItem(fingerprint)
  const approveBody = { status: 'approved', reviewer_notes: 'atomicity test' }

  try {
    // 1) A normal, non-retried approve still creates exactly one public record
    //    and flips the queue item to approved.
    const first = await applyIngestionReview(db, item, approveBody, 'atomicity-test@sikshyanepal.internal')
    if (first.status !== 200) throw new Error(`Expected the first approve to succeed, got ${first.status}: ${JSON.stringify(first.json)}`)
    const afterFirst = first.json as { published_record_id: string; status: string }
    const noticeCountAfterFirst = await countRows('notices', 'id', afterFirst.published_record_id)
    if (noticeCountAfterFirst !== 1) throw new Error(`Expected exactly 1 notice after a normal approve, found ${noticeCountAfterFirst}`)
    if (afterFirst.status !== 'approved') throw new Error(`Expected queue item status 'approved', got '${afterFirst.status}'`)
    console.log('PASS: a normal approve creates exactly one public record and flips the queue item to approved')
    await cleanup(item.id, afterFirst.published_record_id)
  } catch (e) {
    failures++
    console.error('FAIL (normal approve):', e instanceof Error ? e.message : e)
  }

  // 2) Simulate the queue-status update failing right after the insert succeeds,
  //    then retry — must not create a second public record.
  const item2 = await seedQueueItem(`${fingerprint}-retry`)
  let publishedRecordId: string | null = null
  try {
    const faultyDb = withFailingStatusUpdate(db)
    const failedAttempt = await applyIngestionReview(faultyDb, item2, approveBody, 'atomicity-test@sikshyanepal.internal')
    if (failedAttempt.status === 200) throw new Error('Expected the simulated failure to make the first attempt fail, but it succeeded')
    console.log(`Simulated failure produced the expected non-200 status: ${failedAttempt.status}`)

    const { data: itemAfterFailure, error: reReadError } = await db.from('content_ingestion_items').select('*').eq('id', item2.id).single()
    if (reReadError || !itemAfterFailure) throw new Error('Could not re-read queue item after the simulated failure')

    // The crux of the fix: the insert (and the link-write right after it)
    // succeeded before the simulated failure, so published_record_id must
    // already be persisted on the queue row even though the overall request
    // returned an error.
    if (!itemAfterFailure.published_record_id) throw new Error('Expected published_record_id to survive the simulated failure, but it is null')
    const noticeCountAfterFailure = await countRows('notices', 'id', itemAfterFailure.published_record_id)
    if (noticeCountAfterFailure !== 1) throw new Error(`Expected exactly 1 notice right after the simulated failure, found ${noticeCountAfterFailure}`)

    // Retry with the real (non-faulty) db, exactly as a staff member clicking
    // "approve" again would trigger.
    const retry = await applyIngestionReview(db, itemAfterFailure, approveBody, 'atomicity-test@sikshyanepal.internal')
    if (retry.status !== 200) throw new Error(`Expected the retry to succeed, got ${retry.status}: ${JSON.stringify(retry.json)}`)
    const afterRetry = retry.json as { published_record_id: string; status: string }
    publishedRecordId = afterRetry.published_record_id
    if (afterRetry.status !== 'approved') throw new Error(`Expected queue item status 'approved' after retry, got '${afterRetry.status}'`)
    if (afterRetry.published_record_id !== itemAfterFailure.published_record_id) throw new Error('Retry published a different record instead of reusing the one already linked')

    const noticeCountAfterRetry = await countRows('notices', 'id', afterRetry.published_record_id)
    if (noticeCountAfterRetry !== 1) throw new Error(`Expected exactly 1 notice after the simulated failure + retry, found ${noticeCountAfterRetry}`)

    console.log('PASS: the insert + link survive the simulated failure — published_record_id is already recorded, exactly one notice exists')
    console.log('PASS: retrying approve reuses the linked record instead of inserting a second one')
    console.log('PASS: the queue item reaches a consistent approved state once the retry succeeds')
  } catch (e) {
    failures++
    console.error('FAIL (retry after simulated failure):', e instanceof Error ? e.message : e)
  } finally {
    await cleanup(item2.id, publishedRecordId)
  }

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll atomicity checks passed.')
}

main().catch((e) => {
  console.error('Test script crashed:', e)
  process.exit(1)
})
