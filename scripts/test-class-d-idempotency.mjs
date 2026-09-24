// Fault-injection checks for the three admin Class D retry paths. No network or DB writes.
// Run: node scripts/test-class-d-idempotency.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const root = process.cwd()
let db
const audits = []
const deps = {
  'next/server': { NextResponse: { json: (json, options = {}) => ({ status: options.status || 200, json }) } },
  'next/cache': { revalidatePath: () => {} },
  '@/lib/auth': {
    isStaff: async () => true,
    getAuthContext: async () => ({ user: { id: 'staff-id' } }),
    writeAudit: async (...args) => { audits.push(args) },
  },
  '@/lib/supabase': { createAdminSupabaseClient: () => db },
  '@/lib/editorial-quality': { editorialQualityError: () => null, recordReviewIssues: () => [] },
}

function loadRoute(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, console, Date,
    require: specifier => {
      if (!(specifier in deps)) throw new Error(`Unexpected dependency: ${specifier}`)
      return deps[specifier]
    },
  }, { filename: file })
  return loaded.exports
}

class Query {
  constructor(state, table) {
    this.state = state
    this.table = table
    this.filters = []
    this.action = 'select'
  }
  select() { return this }
  eq(key, value) { this.filters.push(row => row[key] === value); return this }
  is(key, value) { this.filters.push(row => row[key] === value); return this }
  update(payload) { this.action = 'update'; this.payload = payload; return this }
  upsert(payload, options = {}) { this.action = 'upsert'; this.payload = payload; this.options = options; return this }
  insert(payload) { this.action = 'insert'; this.payload = payload; return this }
  single() { return Promise.resolve(this.run(true)) }
  maybeSingle() { return Promise.resolve(this.run(true, true)) }
  then(resolve, reject) { return Promise.resolve(this.run(false)).then(resolve, reject) }
  run(single, optional = false) {
    const rows = this.state.tables[this.table]
    const targets = rows.filter(row => this.filters.every(filter => filter(row)))
    if (this.action === 'select') {
      if (single && !targets.length && !optional) return { data: null, error: { message: 'No row' } }
      return { data: single ? targets[0] || null : targets, error: null }
    }
    const failure = this.state.failures.find(item => item.table === this.table && item.action === this.action && item.remaining > 0 && (!item.when || item.when(this.payload)))
    if (failure) {
      failure.remaining--
      return { data: null, error: { message: 'Simulated second-write failure' } }
    }
    this.state.writes.push({ table: this.table, action: this.action, payload: this.payload })
    if (this.action === 'update') {
      for (const row of targets) Object.assign(row, this.payload)
      return { data: single ? targets[0] || null : targets, error: null }
    }
    const keys = (this.options.onConflict || 'id').split(',')
    let row = rows.find(candidate => keys.every(key => candidate[key] === this.payload[key]))
    if (row) Object.assign(row, this.payload)
    else {
      row = { ...this.payload }
      rows.push(row)
    }
    return { data: single ? row : [row], error: null }
  }
}

function makeDb(tables, failures = []) {
  return {
    tables, failures, writes: [],
    from(table) {
      if (!this.tables[table]) throw new Error(`Unexpected table: ${table}`)
      return new Query(this, table)
    },
  }
}

const claimRoute = loadRoute('app/api/admin/claims/[id]/route.ts')
db = makeDb({
  institution_claims: [{ id: 'claim-1', user_id: 'user-1', entity_type: 'college', entity_id: 'college-1', institution_name: 'College', status: 'pending' }],
  institution_memberships: [],
  profiles: [{ id: 'user-1', role: 'user' }],
}, [{ table: 'institution_claims', action: 'update', remaining: 1 }])
const claimRequest = { json: async () => ({ status: 'approved' }) }
assert.equal((await claimRoute.PATCH(claimRequest, { params: { id: 'claim-1' } })).status, 500)
assert.equal(db.tables.institution_memberships.length, 1)
assert.equal(db.tables.institution_claims[0].status, 'pending')
assert.equal((await claimRoute.PATCH(claimRequest, { params: { id: 'claim-1' } })).status, 200)
assert.equal(db.tables.institution_claims[0].status, 'approved')
assert.equal(db.tables.profiles[0].role, 'representative')
assert.equal(db.writes.filter(write => write.table === 'institution_memberships').length, 1)
console.log('PASS claim: failed status write, then retry grants membership only once')

const communityRoute = loadRoute('app/api/admin/community/route.ts')
db = makeDb({
  community_reports: [{ id: 'report-1', target_type: 'post', target_id: 'post-1', status: 'open' }],
  community_posts: [{ id: 'post-1', status: 'published' }],
}, [{ table: 'community_reports', action: 'update', remaining: 1 }])
const reportRequest = { json: async () => ({ type: 'report', id: 'report-1', status: 'hide-target' }) }
assert.equal((await communityRoute.PATCH(reportRequest)).status, 400) // UUID validation
db.tables.community_reports[0].id = '11111111-1111-4111-8111-111111111111'
db.tables.community_posts[0].id = '22222222-2222-4222-8222-222222222222'
db.tables.community_reports[0].target_id = db.tables.community_posts[0].id
const validReportRequest = { json: async () => ({ type: 'report', id: db.tables.community_reports[0].id, status: 'hide-target' }) }
assert.equal((await communityRoute.PATCH(validReportRequest)).status, 500)
assert.equal(db.tables.community_posts[0].status, 'hidden')
assert.equal(db.tables.community_reports[0].status, 'open')
assert.equal((await communityRoute.PATCH(validReportRequest)).status, 200)
assert.equal(db.tables.community_reports[0].status, 'resolved')
assert.equal(db.writes.filter(write => write.table === 'community_posts').length, 1)
assert.equal((await communityRoute.PATCH(validReportRequest)).status, 200)
assert.equal(db.writes.filter(write => write.table === 'community_posts').length, 1)
console.log('PASS report: failed resolution, then retry does not re-hide content')

const { applyIngestionReview } = loadRoute('lib/ingestion-review.ts')
const item = {
  id: '33333333-3333-4333-8333-333333333333',
  target_type: 'notice', title: 'Test notice', source_url: 'https://example.test/notice',
  scraper_name: 'test', content_category: null, college_id: null,
  payload: { title: 'Test notice', slug: 'test-notice', notice_url: 'https://example.test/notice', published_date: '2026-09-20' },
  published_record_id: null, status: 'pending',
}
db = makeDb({
  content_ingestion_items: [{ ...item }],
  notices: [],
}, [{ table: 'content_ingestion_items', action: 'update', when: payload => 'published_record_id' in payload && !('status' in payload), remaining: 1 }])
const review = { status: 'approved' }
assert.equal((await applyIngestionReview(db, item, review, 'staff')).status, 500)
assert.equal(db.tables.notices.length, 1)
assert.equal(db.tables.content_ingestion_items[0].published_record_id, null)
assert.equal((await applyIngestionReview(db, { ...db.tables.content_ingestion_items[0] }, review, 'staff')).status, 200)
assert.equal(db.tables.notices.length, 1)
assert.equal(db.tables.notices[0].id, item.id)
assert.equal(db.tables.content_ingestion_items[0].published_record_id, item.id)
assert.equal(db.tables.content_ingestion_items[0].status, 'approved')
console.log('PASS ingestion: failed link write, then retry reuses the same public row')
