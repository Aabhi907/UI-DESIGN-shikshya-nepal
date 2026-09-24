// Route-to-cache wiring checks. No network or database writes.
// Run: node scripts/test-college-revalidation.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const root = process.cwd()
const calls = []
let db
let staff = true
const dependencies = {
  'next/server': { NextResponse: { json: (json, options = {}) => ({ status: options.status || 200, json }) } },
  '@/lib/auth': {
    isStaff: async () => staff,
    getAuthContext: async () => ({ user: { id: 'staff-id' } }),
    writeAudit: async () => {},
  },
  '@/lib/supabase': { createAdminSupabaseClient: () => db },
  '@/lib/college-admin': { sanitizeCollegeAdminPayload: body => ({ data: body }) },
  '@/lib/revalidate-college': {
    revalidateCollege: slug => { calls.push(['profile', slug]); return true },
    revalidateCollegeListings: () => { calls.push(['listings']); return true },
    revalidateAllCollegePages: () => { calls.push(['all']); return true },
  },
}

function load(file, overrides = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  const imports = { ...dependencies, ...overrides }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, console: overrides.console || console, Date,
    require: name => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
      return imports[name]
    },
  }, { filename: file })
  return loaded.exports
}

function queuedDb(responses) {
  const queue = [...responses]
  return {
    from() {
      const builder = {}
      for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'or', 'not', 'order', 'limit', 'in', 'is']) {
        builder[method] = () => builder
      }
      const next = () => {
        if (!queue.length) throw new Error('Unexpected database operation')
        return queue.shift()
      }
      builder.single = async () => next()
      builder.maybeSingle = async () => next()
      builder.then = (resolve, reject) => Promise.resolve(next()).then(resolve, reject)
      return builder
    },
    remaining: () => queue.length,
  }
}

const request = json => ({ json: async () => json })
async function check(label, file, method, responses, body, expected, params) {
  calls.length = 0
  db = queuedDb(responses)
  const route = load(file)
  const result = await route[method](request(body), params && { params })
  assert.ok(result.status < 400, `${label}: response ${result.status}`)
  assert.deepEqual(calls, expected, label)
  assert.equal(db.remaining(), 0, `${label}: unused database response`)
  console.log(`PASS ${label}`)
}

const college = { id: 'college-id', name: 'College', slug: 'new-college' }
const old = { ...college, slug: 'old-college', status: 'active' }
const evidence = { id: 'evidence-id', college: { slug: college.slug } }

await check('college create', 'app/api/admin/colleges/route.ts', 'POST',
  [{ data: college, error: null }], college, [['profile', 'new-college'], ['listings']])
await check('college edit invalidates old and new slugs', 'app/api/admin/colleges/[id]/route.ts', 'PUT',
  [{ data: { slug: old.slug }, error: null }, { data: college, error: null }],
  college, [['profile', 'old-college'], ['profile', 'new-college'], ['listings']], { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
await check('college pending delete', 'app/api/admin/colleges/[id]/route.ts', 'DELETE',
  [{ data: { ...old, status: 'pending_review' }, error: null }, { error: null }],
  {}, [['profile', 'old-college'], ['listings']], { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
await check('college archive', 'app/api/admin/colleges/[id]/route.ts', 'DELETE',
  [{ data: old, error: null }, { error: null }],
  {}, [['profile', 'old-college'], ['listings']], { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
await check('evidence create', 'app/api/admin/evidence/route.ts', 'POST',
  [{ data: evidence, error: null }],
  { college_id: college.id, field_key: 'fee', claim_summary: 'Verified fee', source_name: 'Official source', source_url: 'https://example.org/fee' },
  [['profile', 'new-college']])
await check('evidence update', 'app/api/admin/evidence/[id]/route.ts', 'PATCH',
  [{ data: evidence, error: null }],
  { verification_status: 'editor_verified' }, [['profile', 'new-college']], { id: evidence.id })
await check('bulk evidence publish', 'app/api/admin/evidence/bulk-publish/route.ts', 'POST',
  [{ data: [{ id: evidence.id }], error: null }], {}, [['all']])
await check('evidence bootstrap', 'app/api/admin/evidence/bootstrap/route.ts', 'POST',
  [
    { data: [{ id: college.id, name: college.name, affiliation: 'TU', source_url: 'https://example.org/college' }], error: null },
    { data: [], error: null },
    { data: [{ id: evidence.id }], error: null },
  ], {}, [['all']])

const endpoint = load('app/api/admin/cache/revalidate-college/route.ts')
calls.length = 0
assert.equal((await endpoint.POST(request({ slug: college.slug }))).status, 200)
assert.deepEqual(calls, [['profile', 'new-college'], ['listings']])
calls.length = 0
assert.equal((await endpoint.POST(request({ all: true }))).status, 200)
assert.deepEqual(calls, [['all']])
staff = false
calls.length = 0
assert.equal((await endpoint.POST(request({ all: true }))).status, 403)
assert.deepEqual(calls, [])
console.log('PASS internal endpoint: slug, all, and staff-only gate')

const invalidated = []
const errors = []
const cache = load('lib/revalidate-college.ts', {
  console: { ...console, error: (...args) => errors.push(args) },
  'next/cache': { revalidatePath: (target, type) => {
    invalidated.push([target, type])
    if (target === '/colleges/nearby') throw new Error('Simulated cache failure')
  } },
})
assert.equal(cache.revalidateCollege('new-college'), true)
assert.equal(cache.revalidateCollegeListings(), false)
assert.deepEqual(invalidated[0], ['/colleges/new-college', undefined])
assert.ok(invalidated.some(([target, type]) => target === '/colleges/province/[province]' && type === 'page'))
assert.ok(invalidated.some(([target, type]) => target === '/colleges/program/[slug]' && type === 'page'))
assert.ok(invalidated.some(([target]) => target === '/programs/[slug]'))
assert.equal(errors.length, 1)
assert.equal(errors[0][1].path, '/colleges/nearby')
console.log('PASS helper: exact/broad paths and non-throwing revalidation failure')

db = queuedDb([{ data: college, error: null }])
const createWithCacheFailure = load('app/api/admin/colleges/route.ts', {
  '@/lib/revalidate-college': {
    revalidateCollege: () => false,
    revalidateCollegeListings: () => false,
  },
})
staff = true
assert.equal((await createWithCacheFailure.POST(request(college))).status, 201)
console.log('PASS successful college write still succeeds when cache invalidation fails')
