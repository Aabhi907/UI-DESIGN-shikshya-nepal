// Static checks are offline. --local requires an isolated, loopback Supabase.
// --setup-local applies the test fixture and migration only to its Docker DB.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { createRequire, Module } from 'node:module'
import ts from 'typescript'
import { createClient } from '@supabase/supabase-js'
import { publicSelects, restrictedTables, wildcardTables } from './check-queries.mjs'

const overrideIndex = process.argv.indexOf('--migration-file')
const migrationFile = overrideIndex >= 0 ? process.argv[overrideIndex + 1] : 'supabase/migrations/20261023_restrict_public_columns.sql'
const migration = fs.readFileSync(migrationFile, 'utf8')
const privateColumns = {
  community_posts: ['author_id', 'fingerprint_hash', 'moderation_note'],
  community_comments: ['author_id', 'fingerprint_hash', 'moderation_note'],
  reviews: ['author_id', 'moderated_by'],
  review_responses: ['responder_id', 'reviewed_by'],
  college_evidence: ['reviewed_by'],
  colleges: ['submitted_by', 'submitter_role', 'submitter_contact', 'verified_by', 'source'],
  admission_deadline_history: ['changed_by'],
}
function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? filesIn(file) : /\.tsx?$/.test(file) ? [file] : []
  })
}
const reads = ['app', 'lib', 'components'].flatMap(filesIn).flatMap(file => publicSelects(file, fs.readFileSync(file, 'utf8')))
  .filter(read => restrictedTables.has(read.table) || read.selections.some(selection => [...restrictedTables].some(table => selection.includes(`${table}(`))))
const grants = new Map([...migration.matchAll(/GRANT SELECT\s*\(([^)]+)\)\s+ON public\.(\w+) TO anon, authenticated;/g)]
  .map(match => [match[2], match[1].split(',').map(column => column.trim())]))

for (const [table, columns] of Object.entries(privateColumns)) {
  assert.ok(grants.has(table), `missing explicit grant: ${table}`)
  for (const column of columns) assert.ok(!grants.get(table).includes(column), `unexpected grant: ${table}.${column}`)
}
assert.ok(grants.get('community_posts').includes('media_path'))
for (const read of reads) {
  assert.ok(read.selections.length, `${read.file}:${read.line} has no verifiable selector`)
  for (const selection of read.selections) assert.deepEqual(wildcardTables(selection, read.table), [])
}
const fixture = `import { createServerSupabaseClient as publicClient, createAdminSupabaseClient } from '@/lib/supabase'
function publicRead() { const db = publicClient(); return db.from('colleges').select('*') }
function adminRead() { const db = createAdminSupabaseClient(); return db.from('colleges').select('*') }`
const fixtureReads = publicSelects('fixture.ts', fixture)
assert.equal(fixtureReads.length, 1, 'guard must distinguish public and admin client bindings')
assert.deepEqual(wildcardTables(fixtureReads[0].selections[0], fixtureReads[0].table), ['colleges'])
assert.deepEqual(wildcardTables('*,college:colleges(*),reviews(rating)', 'college_programs'), ['colleges'])
const alteredGrant = new Map(grants)
alteredGrant.set('community_posts', [...grants.get('community_posts'), 'author_id'])
assert.ok(alteredGrant.get('community_posts').some(column => privateColumns.community_posts.includes(column)), 'grant test must detect a restored private column')
console.log(`Static checks passed; found ${reads.length} public reads for local query verification.`)

if (!process.argv.includes('--local') && !process.argv.includes('--setup-local')) process.exit(0)
const localUrl = new URL(process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321')
assert.ok(localUrl.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(localUrl.hostname) && localUrl.port === '54321', 'Only isolated loopback Supabase is allowed')
const container = process.env.LOCAL_SUPABASE_DB_CONTAINER
assert.equal(container, 'supabase_db_sikshyanepal-w1-local', 'Use the isolated /tmp Supabase project')
const dockerHost = `unix://${os.homedir()}/.docker/run/docker.sock`
function sql(statement) {
  return execFileSync('docker', ['--host', dockerHost, 'exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: statement, encoding: 'utf8' })
}
if (process.argv.includes('--setup-local')) {
  sql(fs.readFileSync('supabase/schema.sql', 'utf8'))
  // Existing app columns omitted from the checked-in schema checkpoint.
  sql(`ALTER TABLE colleges ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS programs_offered TEXT, ADD COLUMN IF NOT EXISTS submitted_by TEXT,
    ADD COLUMN IF NOT EXISTS submitter_role TEXT, ADD COLUMN IF NOT EXISTS submitter_contact TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT;`)
  for (const name of [
    '20260922_student_reality_reviews.sql', '20261003_anonymous_student_community.sql',
    '20261004_community_media.sql', '20261005_community_voting.sql',
    '20261006_pseudonymous_community_accountability.sql', '20261007_review_accountability.sql',
    '20261008_college_evidence_ledger.sql', '20261011_college_sponsorship_and_fee_context.sql',
    '20261013_private_community_media.sql',
  ]) sql(fs.readFileSync(`supabase/migrations/${name}`, 'utf8'))
  sql(migration)
  sql("NOTIFY pgrst, 'reload schema';")
  console.log('Isolated local fixture and migration applied. Run --local after the API schema cache refreshes.')
  process.exit(0)
}

assert.ok(process.env.LOCAL_SUPABASE_ANON_KEY && process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY, 'Supply local keys explicitly; .env.local is never loaded')
const admin = createClient(localUrl.href, process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const anon = createClient(localUrl.href, process.env.LOCAL_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
async function checkPermissions(client) {
  for (const [table, columns] of Object.entries(privateColumns)) {
    for (const column of columns) {
      const result = await client.from(table).select(column).limit(1)
      assert.equal(result.error?.code, '42501', `${table}.${column} must be denied`)
    }
    const safe = await client.from(table).select(grants.get(table).join(',')).limit(1)
    assert.equal(safe.error, null, `${table} safe-column query failed`)
  }
}
await checkPermissions(anon)
for (const read of reads) {
  for (const selection of read.selections) {
    const result = await anon.from(read.table).select(selection).limit(1)
    assert.equal(result.error, null, `${read.file}:${read.line}: ${result.error?.message}`)
  }
}
// Real grant mutation, restored even if the assertion fails.
try {
  sql('GRANT SELECT (author_id) ON community_posts TO anon;')
  await assert.rejects(() => checkPermissions(anon), /community_posts.author_id must be denied/)
} finally {
  sql('REVOKE SELECT (author_id) ON community_posts FROM anon;')
}

const stamp = Date.now()
const email = `local-columns-${stamp}@example.test`
const password = `Local-only-${stamp}-Password!`
const { data: user, error: userError } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
assert.equal(userError, null)
const signedIn = createClient(localUrl.href, process.env.LOCAL_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const require = createRequire(import.meta.url)
function route(file, mocks) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = new Module(path.resolve(file))
  module.filename = path.resolve(file)
  module.require = name => Object.hasOwn(mocks, name) ? mocks[name] : require(name)
  module._compile(compiled, module.filename)
  return module.exports
}
const mocks = {
  '@/lib/supabase': { createAdminSupabaseClient: () => admin },
  '@/lib/auth': { isStaff: async () => true, writeAudit: async () => {}, getAuthContext: async () => ({ user: user.user }) },
  '@/lib/college-admin': { sanitizeCollegeAdminPayload: body => ({ data: body }) },
  '@/lib/revalidate-college': { revalidateCollege: () => {}, revalidateCollegeListings: () => {}, revalidateAllCollegePages: () => {} },
  '@/lib/community-server': { recordCommunitySecurityEvent: async () => {}, requestFingerprint: () => 'local-test' },
}
let collegeId, postId, mediaPath
try {
  const login = await signedIn.auth.signInWithPassword({ email, password })
  assert.equal(login.error, null)
  await checkPermissions(signedIn)
  const college = await admin.from('colleges').insert({
    name: 'Local column test college', slug: `local-columns-${stamp}`, location: 'Local',
    status: 'pending_review', submitted_by: 'Local submitter', submitter_role: 'Student', submitter_contact: 'local@example.test',
  }).select('id').single()
  assert.equal(college.error, null)
  collegeId = college.data.id
  const approval = route('app/api/admin/colleges/[id]/route.ts', mocks)
  const approved = await approval.PUT(new Request('http://localhost/api/test', { method: 'PUT', body: JSON.stringify({ status: 'active' }) }), { params: { id: collegeId } })
  assert.equal(approved.status, 200)
  const stored = await admin.from('colleges').select('status,submitted_by,submitter_role,submitter_contact').eq('id', collegeId).single()
  assert.deepEqual(stored.data, { status: 'active', submitted_by: null, submitter_role: null, submitter_contact: null })
  mediaPath = `local-tests/${stamp}.png`
  const upload = await admin.storage.from('community-media').upload(mediaPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1sAAAAASUVORK5CYII=', 'base64'), { contentType: 'image/png' })
  assert.equal(upload.error, null)
  const post = await admin.from('community_posts').insert({ title: 'Local media deletion test', body: 'A local test of the media deletion operation.', topic: 'other', status: 'pending', fingerprint_hash: 'local-only', author_id: user.user.id, media_path: mediaPath, media_type: 'image' }).select('id').single()
  assert.equal(post.error, null)
  postId = post.data.id
  const deletion = route('app/api/community/my-content/route.ts', mocks)
  const deleted = await deletion.DELETE(new Request('http://localhost/api/test', { method: 'DELETE', body: JSON.stringify({ type: 'post', id: postId }) }))
  assert.equal(deleted.status, 200)
  const remaining = await admin.storage.from('community-media').list('local-tests', { search: `${stamp}.png` })
  assert.equal(remaining.error, null)
  assert.equal(remaining.data.length, 0)
  console.log('Local column permissions, exact page queries, grant mutation, approval and media deletion passed.')
} finally {
  if (postId) await admin.from('community_posts').delete().eq('id', postId)
  if (mediaPath) await admin.storage.from('community-media').remove([mediaPath])
  if (collegeId) await admin.from('colleges').delete().eq('id', collegeId)
  await admin.auth.admin.deleteUser(user.user.id)
}
