// Wave 2 / Stream 3 trust fixes (Build Brief 36).
//
// Each API route under test is transpiled from its real source and executed in a
// sandboxed CommonJS module (the same approach as test-public-list-errors.mjs),
// with a custom `require` shim standing in for its imports. Where a route must
// short-circuit before touching the database, its dependencies are "tripwires"
// that throw the moment any property is read off them — so a handler that falls
// through the guard fails loudly here instead of quietly passing.
//
// Run: npm run test:w2-trust
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { COMMUNITY_OPEN, COMMUNITY_CLOSED_MESSAGE } from '../lib/community-status.ts'

let checks = 0
const ok = (condition, message) => { assert.ok(condition, message); checks++ }

// ── sandbox plumbing ──────────────────────────────────────────────────────

function tripwire(label) {
  return new Proxy({}, {
    get(_, prop) {
      throw new Error(`${label}.${String(prop)} must not be touched here`)
    },
  })
}

const NextResponse = {
  json: (body, init = {}) => ({ __isResponse: true, body, status: init.status ?? 200, headers: init.headers ?? {} }),
}

function loadModule(file, importMap) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: path.basename(file),
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, Buffer, console: { error() {}, warn() {}, log() {} },
    require: name => {
      if (!(name in importMap)) throw new Error(`Unexpected import in ${file}: ${name}`)
      return importMap[name]
    },
  }, { filename: file })
  return loaded.exports
}

// A minimal Supabase query-builder stand-in: every call just returns another
// chainable proxy, except `.then`/`.single`/`.maybeSingle`, which resolve the
// queued result — mirrors the fakeDb pattern in test-public-list-errors.mjs.
function chainable(result) {
  return new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return (resolve) => Promise.resolve(result).then(resolve)
      if (prop === 'single' || prop === 'maybeSingle') return () => Promise.resolve(result)
      return () => chainable(result)
    },
  })
}
function fakeSequence(responses) {
  let i = 0
  return { from() { const result = responses[i++]; if (!result) throw new Error('fakeSequence: ran out of queued responses'); return chainable(result) } }
}

const UUID = '11111111-1111-1111-1111-111111111111'

// ── 1. no dead address remains ───────────────────────────────────────────

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}
{
  const offenders = []
  for (const dir of ['app', 'components', 'lib']) {
    for (const file of walk(dir)) {
      let content
      try { content = fs.readFileSync(file, 'utf8') } catch { continue }
      if (/@sikshyanepal\.com/i.test(content)) offenders.push(file)
    }
  }
  ok(offenders.length === 0, `Dead @sikshyanepal.com address(es) found: ${offenders.join(', ')}`)
}

// ── 2. community create routes 503 while closed, no database call made ──

ok(COMMUNITY_OPEN === false, 'COMMUNITY_OPEN must be false for this brief (community stays closed)')

function closedImportMap() {
  return {
    'next/server': { NextResponse },
    '@/lib/community-status': { COMMUNITY_OPEN, COMMUNITY_CLOSED_MESSAGE },
    '@/lib/supabase': tripwire('@/lib/supabase'),
    '@/lib/auth': tripwire('@/lib/auth'),
    '@/lib/community-server': tripwire('@/lib/community-server'),
    '@/lib/community': tripwire('@/lib/community'),
    'crypto': tripwire('crypto'),
  }
}

const closedRoutes = [
  ['app/api/community/posts/route.ts', 'POST', request => [request]],
  ['app/api/community/posts/[id]/comments/route.ts', 'POST', request => [request, { params: { id: UUID } }]],
  ['app/api/community/vote/route.ts', 'POST', request => [request]],
  ['app/api/community/me/route.ts', 'PUT', request => [request]],
]

for (const [file, method, callArgs] of closedRoutes) {
  const mod = loadModule(path.resolve(file), closedImportMap())
  const handler = mod[method]
  ok(typeof handler === 'function', `${file}: expected an exported ${method} handler`)
  const request = new Request('http://localhost/test', { method, body: JSON.stringify({}) })
  let response
  try {
    response = await handler(...callArgs(request))
  } catch (error) {
    throw new assert.AssertionError({ message: `${file}: threw instead of returning 503 while COMMUNITY_OPEN is false (${error.message})` })
  }
  ok(response.status === 503, `${file}: expected 503 while closed, got ${response.status}`)
  ok(response.body?.error === COMMUNITY_CLOSED_MESSAGE, `${file}: expected the closed message, got ${JSON.stringify(response.body)}`)
}

// ── 3. my-content DELETE keeps working while the community is closed ────

{
  const importMap = {
    'next/server': { NextResponse },
    '@/lib/auth': { getAuthContext: async () => ({ user: { id: 'user-1' } }) },
    '@/lib/supabase': { createAdminSupabaseClient: () => fakeSequence([
      { data: { id: 'post-1', media_path: null }, error: null }, // select before delete
      { error: null }, // the delete itself
    ]) },
    '@/lib/community-server': { recordCommunitySecurityEvent: async () => {}, requestFingerprint: () => 'fp' },
  }
  const mod = loadModule(path.resolve('app/api/community/my-content/route.ts'), importMap)
  const request = new Request('http://localhost/test', { method: 'DELETE', body: JSON.stringify({ type: 'post', id: UUID }) })
  const response = await mod.DELETE(request)
  ok(response.status === 200 && response.body?.success === true, `my-content DELETE: expected success, got ${JSON.stringify(response.body)} (status ${response.status})`)
}

// ── 4. admin reviews: verify rejected with 409, approve/reject still work ─

const REVIEWS_ROUTE = path.resolve('app/api/admin/reviews/[id]/route.ts')
const VERIFY_MESSAGE = 'Verification paused until evidence review is built.'

{
  const importMap = {
    'next/server': { NextResponse },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/auth': {
      isStaff: async () => true,
      getAuthContext: async () => { throw new Error('getAuthContext must not be called when rejecting a verify request') },
      writeAudit: async () => { throw new Error('writeAudit must not be called when rejecting a verify request') },
    },
    '@/lib/supabase': {
      createAdminSupabaseClient: () => { throw new Error('createAdminSupabaseClient must not be called when rejecting a verify request') },
    },
  }
  const mod = loadModule(REVIEWS_ROUTE, importMap)
  const request = new Request('http://localhost/test', { method: 'PUT', body: JSON.stringify({ verification_status: 'verified' }) })
  const response = await mod.PUT(request, { params: { id: 'review-1' } })
  ok(response.status === 409, `admin reviews PUT: expected 409 for a verify request, got ${response.status}`)
  ok(response.body?.error === VERIFY_MESSAGE, `admin reviews PUT: unexpected message ${JSON.stringify(response.body)}`)
}

function reviewsWorkingImportMap(updateResult) {
  return {
    'next/server': { NextResponse },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/auth': { isStaff: async () => true, getAuthContext: async () => ({ user: { id: 'admin-1' } }), writeAudit: async () => {} },
    '@/lib/supabase': { createAdminSupabaseClient: () => ({ from: () => chainable(updateResult) }) },
  }
}
{
  const result = { data: { id: 'review-1', is_approved: true, verification_status: 'unverified', college: { slug: 'test-college' } }, error: null }
  const mod = loadModule(REVIEWS_ROUTE, reviewsWorkingImportMap(result))
  const request = new Request('http://localhost/test', { method: 'PUT', body: JSON.stringify({ is_approved: true }) })
  const response = await mod.PUT(request, { params: { id: 'review-1' } })
  ok(response.status === 200 && response.body?.is_approved === true, `admin reviews PUT: approve must still work, got ${JSON.stringify(response.body)} (status ${response.status})`)
}
{
  const result = { data: { id: 'review-1', is_approved: false, verification_status: 'rejected', college: { slug: 'test-college' } }, error: null }
  const mod = loadModule(REVIEWS_ROUTE, reviewsWorkingImportMap(result))
  const request = new Request('http://localhost/test', { method: 'PUT', body: JSON.stringify({ verification_status: 'rejected' }) })
  const response = await mod.PUT(request, { params: { id: 'review-1' } })
  ok(response.status === 200 && response.body?.verification_status === 'rejected', `admin reviews PUT: reject must still work, got ${JSON.stringify(response.body)} (status ${response.status})`)
}

// ── 5. Nav has no Community link and no LanguageSwitch ───────────────────

{
  const source = fs.readFileSync('components/design-system/Nav.tsx', 'utf8')
  ok(!source.includes('/community'), 'Nav.tsx must not link to Community')
  ok(!source.includes('LanguageSwitch'), 'Nav.tsx must not reference LanguageSwitch (moved to the footer)')
}

console.log(`W2 trust checks passed: ${checks} assertions.`)
