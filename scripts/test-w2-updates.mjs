// Wave 2 / Stream 2 checks: results/notices/news detail pages must show the
// real error state on a query failure (never a 404), result alerts must fire
// exactly once per published result and never for a notice or news approval,
// and a failing email sender must never fail the publish itself.
//
// Uses the same transpile-and-execute approach as test-public-list-errors.mjs
// and test-w1-params-and-dates.mjs: real page/module source runs against a
// stubbed Supabase client and a stubbed email sender.
//
// Run: npm run test:w2-updates
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'
import * as seoLib from '../lib/seo.ts'
import * as utilsLib from '../lib/utils.ts'

const require = createRequire(import.meta.url)
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const { renderToStaticMarkup } = require('react-dom/server')

let checks = 0
const ok = (condition, message) => { assert.ok(condition, message); checks++ }

// ---- shared stubs (mirrors the other Wave test harnesses) ----
function stubComponent(name) {
  function StubComponent(props) { return React.createElement('div', { 'data-stub': name }, props?.children) }
  StubComponent.displayName = name
  return StubComponent
}
const stubModule = name => new Proxy({ __esModule: true, default: stubComponent(name.split('/').pop()) }, {
  get: (target, prop) => (prop in target || typeof prop !== 'string' || !/^[A-Z]/.test(prop) ? target[prop] : stubComponent(prop)),
})
const icons = new Proxy({}, { get: () => () => null })
const Link = ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children)
const notFound = () => { throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' }) }

// A page-level Proxy-chain fake: answers a queued result per table (or an
// array of results, consumed one per call to the same table, for tests that
// need successive calls to differ) and logs every filter method invoked.
function fakePageDb(tables) {
  const log = []
  const callCounts = {}
  return {
    log,
    from(table) {
      const spec = tables[table] ?? { data: [], error: null }
      const sequence = Array.isArray(spec) ? spec : [spec]
      const index = callCounts[table] ?? 0
      callCounts[table] = index + 1
      const result = sequence[Math.min(index, sequence.length - 1)]
      const builder = new Proxy({}, {
        get(_, prop) {
          if (prop === 'then') return (resolve, reject) => Promise.resolve(result).then(resolve, reject)
          if (prop === 'single' || prop === 'maybeSingle') return async () => result
          return (...args) => { log.push({ table, method: prop, args }); return builder }
        },
      })
      return builder
    },
  }
}

function loadModule(file, imports, expose = []) {
  let output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: path.basename(file),
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  if (expose.length) output += `\nObject.assign(exports, { ${expose.join(', ')} });\n`
  const loaded = { exports: {} }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, URLSearchParams, Date, console: { error() {}, warn() {}, log() {}, info() {} },
    require: name => {
      if (name.startsWith('@/components/')) return stubModule(name)
      if (!(name in imports)) throw new Error(`Unexpected import in module under test (${file}): ${name}`)
      return imports[name]
    },
  }, { filename: file })
  return loaded.exports
}

function loadPage(file, db) {
  const imports = {
    'react': React, 'react/jsx-runtime': jsxRuntime, 'lucide-react': icons,
    'next/link': { __esModule: true, default: Link }, 'next/navigation': { notFound },
    'next/image': { __esModule: true, default: stubComponent('Image') },
    'next/script': { __esModule: true, default: stubComponent('Script') },
    '@/lib/supabase': { createServerSupabaseClient: () => db, createAdminSupabaseClient: () => db },
    '@/lib/seo': seoLib, '@/lib/utils': utilsLib,
  }
  return loadModule(file, imports)
}

async function renderPage(file, tables, scenario) {
  const db = fakePageDb(tables)
  const page = loadPage(file, db)
  let element
  try {
    element = await page.default({ params: { slug: 'sentinel-slug' } })
  } catch (error) {
    throw new assert.AssertionError({ message: `${scenario}: threw instead of rendering (${error.digest ?? error.message})` })
  }
  return { markup: renderToStaticMarkup(element), page }
}

const DETAIL_PAGES = {
  // `rendered` names a marker guaranteed to appear as literal text in the
  // real markup — results/notices print the title directly, but news passes
  // its title as a prop to a stubbed design-system component (which drops
  // props), so news is checked via its body content instead.
  results: { file: 'app/(main)/results/[slug]/page.tsx', table: 'results', notFoundTitle: 'Result Not Found', genericTitle: 'Result', rendered: 'Sentinel title' },
  notices: { file: 'app/(main)/notices/[slug]/page.tsx', table: 'notices', notFoundTitle: 'Notice Not Found', genericTitle: 'Notice', rendered: 'Sentinel title' },
  news: { file: 'app/(main)/news/[slug]/page.tsx', table: 'news', notFoundTitle: 'News Not Found', genericTitle: 'News', rendered: 'Sentinel content' },
}

const SAMPLE_ROW = { id: 'row-1', title: 'Sentinel title', slug: 'sentinel-slug', content: 'Sentinel content', published_date: null, created_at: '2026-09-01T00:00:00Z', university: { id: 'u1', name: 'Sentinel University', short_name: 'SU', slug: 'su', website: null, created_at: '2026-09-01T00:00:00Z' } }
const DB_ERROR = { data: null, error: { message: 'database unavailable', code: '57P03' } }
const EMPTY = { data: null, error: null }
const POPULATED = { data: SAMPLE_ROW, error: null }

async function main() {
  // ---- Section A: detail pages — a query error must throw (real error
  // screen, never cached as a 404); an empty result must call notFound();
  // metadata must never crash and must not call an error "not found". ----
  for (const [name, spec] of Object.entries(DETAIL_PAGES)) {
    // 1. Query error → the page must throw the real error, not call notFound
    // and not render (a caught, digest-less throw is the real error boundary).
    {
      const db = fakePageDb({ [spec.table]: DB_ERROR })
      const page = loadPage(spec.file, db)
      await assert.rejects(
        () => page.default({ params: { slug: 'sentinel-slug' } }),
        error => error.digest !== 'NEXT_NOT_FOUND',
        `${name}: a query error must throw the real error, not call notFound()`,
      )
      checks++
    }

    // 2. Genuinely no row → notFound(), not a raw crash.
    const db = fakePageDb({ [spec.table]: EMPTY })
    const page = loadPage(spec.file, db)
    await assert.rejects(() => page.default({ params: { slug: 'sentinel-slug' } }), e => e.digest === 'NEXT_NOT_FOUND', `${name}: an empty result must call notFound()`)
    checks++

    // 3. A real row renders normally.
    const { markup } = await renderPage(spec.file, { [spec.table]: POPULATED }, `${name}/populated`)
    ok(markup.includes(spec.rendered), `${name}: a populated result must render (looked for "${spec.rendered}")`)

    // 4. generateMetadata: error → generic fallback, never "Not Found", never a throw.
    {
      const db2 = fakePageDb({ [spec.table]: DB_ERROR })
      const page2 = loadPage(spec.file, db2)
      const metadata = await page2.generateMetadata({ params: { slug: 'sentinel-slug' } })
      ok(metadata.title !== spec.notFoundTitle, `${name}/generateMetadata on error: must not claim "not found" for a database error`)
      ok(metadata.title === spec.genericTitle, `${name}/generateMetadata on error: expected the generic fallback title "${spec.genericTitle}", got "${metadata.title}"`)
    }
    // 5. generateMetadata: genuinely empty → the real "not found" title.
    {
      const db3 = fakePageDb({ [spec.table]: EMPTY })
      const page3 = loadPage(spec.file, db3)
      const metadata = await page3.generateMetadata({ params: { slug: 'sentinel-slug' } })
      ok(metadata.title === spec.notFoundTitle, `${name}/generateMetadata on empty: expected "${spec.notFoundTitle}", got "${metadata.title}"`)
    }
  }

  // News specifically must not select('*').
  {
    const source = fs.readFileSync('app/(main)/news/[slug]/page.tsx', 'utf8')
    ok(!/\.select\(\s*['"]\*['"]\s*\)/.test(source), 'news/[slug]: must not select(\'*\') — use the explicit column list the page renders')
    ok(/status/.test(source) && /published/.test(source), 'news/[slug]: must keep the status = \'published\' filter')
  }

  await testResultAlerts()
  await testIngestionRouteWiring()

  console.log(`Wave 2 / Stream 2 checks passed: ${checks} assertions (detail pages, result alerts, publish-path wiring).`)
}

// ---- Section B: lib/result-alerts.ts ----

function loadResultAlerts({ enabled, db, sendResultNotification }) {
  const source = fs.readFileSync('lib/result-alerts.ts', 'utf8')
  const patched = enabled
    ? source.replace('const RESULT_ALERTS_ENABLED = false', 'const RESULT_ALERTS_ENABLED = true')
    : source
  if (enabled && patched === source) throw new Error('test setup: expected to find and patch RESULT_ALERTS_ENABLED')
  const output = ts.transpileModule(patched, {
    fileName: 'result-alerts.ts',
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  const imports = {
    '@/lib/supabase': { createAdminSupabaseClient: () => db },
    '@/lib/email': { sendResultNotification },
    'crypto': crypto,
  }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, console: { error() {}, warn() {}, log() {}, info() {} },
    require: name => { if (!(name in imports)) throw new Error(`Unexpected import in result-alerts.ts: ${name}`); return imports[name] },
  }, { filename: 'result-alerts.ts' })
  return loaded.exports
}

// A hand-built fake tailored to result-alerts.ts's exact call shape: reading
// one result by id, then an insert-or-detect-duplicate on
// notification_delivery_runs (a real unique constraint on event_key, faked
// with a Set so a second call for the same result id collides), then an
// update to close it out.
function fakeAlertsDb(resultRow) {
  const insertedKeys = new Set()
  const updates = []
  let nextId = 1
  return {
    updates,
    from(table) {
      if (table === 'results') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: resultRow, error: null }) }) }) }
      }
      if (table === 'notification_delivery_runs') {
        return {
          insert: (row) => ({
            select: () => ({
              single: async () => {
                if (insertedKeys.has(row.event_key)) return { data: null, error: { code: '23505', message: 'duplicate' } }
                insertedKeys.add(row.event_key)
                return { data: { id: `run-${nextId++}` }, error: null }
              },
            }),
          }),
          update: (values) => ({
            eq: (column, id) => { updates.push({ id, values }); return Promise.resolve({ error: null }) },
          }),
        }
      }
      throw new Error(`fakeAlertsDb: unexpected table ${table}`)
    },
  }
}

async function testResultAlerts() {
  const resultRow = { title: 'Sentinel result', slug: 'sentinel-result', university: { short_name: 'SU' } }

  // Shipped (disabled) constant: must skip immediately, touching neither the
  // database nor the email sender.
  {
    let sendCalls = 0
    const db = fakeAlertsDb(resultRow)
    const { sendResultAlertForApproval } = loadResultAlerts({ enabled: false, db, sendResultNotification: async () => { sendCalls++; return { sent: 1, errors: 0, recipients: 1 } } })
    const outcome = await sendResultAlertForApproval(db, 'result-1')
    ok(outcome === 'skipped', `disabled: expected 'skipped', got '${outcome}'`)
    ok(sendCalls === 0, 'disabled: must not call the email sender at all')
    ok(db.updates.length === 0, 'disabled: must not touch notification_delivery_runs at all')
  }

  // Enabled: a successful send returns 'sent', and a second call for the
  // SAME result id sends no additional email (idempotent on the result id).
  {
    let sendCalls = 0
    const db = fakeAlertsDb(resultRow)
    const { sendResultAlertForApproval } = loadResultAlerts({
      enabled: true, db,
      sendResultNotification: async () => { sendCalls++; return { sent: 2, errors: 0, recipients: 2 } },
    })
    const first = await sendResultAlertForApproval(db, 'result-1')
    const second = await sendResultAlertForApproval(db, 'result-1')
    ok(first === 'sent', `enabled/first approval: expected 'sent', got '${first}'`)
    ok(second === 'skipped', `enabled/re-approval: expected 'skipped', got '${second}'`)
    ok(sendCalls === 1, `enabled: approving the same result twice must call the email sender exactly once, called ${sendCalls} times`)
  }

  // Enabled, email sender throws: the function must still resolve (never
  // throw) — a real publish must never fail because of email — and report
  // alert: 'failed', with a failed delivery run recorded.
  {
    const db = fakeAlertsDb(resultRow)
    const { sendResultAlertForApproval } = loadResultAlerts({
      enabled: true, db,
      sendResultNotification: async () => { throw new Error('Resend is down') },
    })
    const outcome = await sendResultAlertForApproval(db, 'result-2')
    ok(outcome === 'failed', `failing email sender: expected 'failed', got '${outcome}'`)
    ok(db.updates.some(u => u.values.status === 'failed'), 'failing email sender: must record a failed delivery run')
  }

  // Enabled, zero active subscribers: nothing to send is not a failure.
  {
    const db = fakeAlertsDb(resultRow)
    const { sendResultAlertForApproval } = loadResultAlerts({
      enabled: true, db,
      sendResultNotification: async () => ({ sent: 0, errors: 0, recipients: 0 }),
    })
    const outcome = await sendResultAlertForApproval(db, 'result-3')
    ok(outcome === 'skipped', `zero subscribers: expected 'skipped', got '${outcome}'`)
  }
}

// ---- Section C: app/api/admin/ingestion/[id]/route.ts wiring ----
// Only a result's own successful publish may trigger a result alert.

async function testIngestionRouteWiring() {
  for (const [targetType, shouldAlert] of [['result', true], ['notice', false], ['news', false]]) {
    let alertCalls = []
    let auditCalls = 0
    const db = fakePageDb({
      content_ingestion_items: { data: { id: 'item-1', status: 'pending', target_type: targetType, title: 'Sentinel', payload: {} }, error: null },
    })
    const imports = {
      'next/server': { NextResponse: { json: (body, init) => ({ status: init?.status ?? 200, json: async () => body }) } },
      '@/lib/auth': {
        getAuthContext: async () => ({ user: { id: 'u1', email: 'editor@example.com' }, profile: { role: 'editor' } }),
        writeAudit: async (...args) => { auditCalls++ },
      },
      '@/lib/supabase': { createAdminSupabaseClient: () => db },
      '@/lib/ingestion-review': {
        applyIngestionReview: async () => ({ status: 200, json: { id: 'item-1', status: 'approved' }, publishedId: 'published-1' }),
      },
      '@/lib/result-alerts': {
        sendResultAlertForApproval: async (_db, id) => { alertCalls.push(id); return 'sent' },
      },
    }
    const route = loadModule('app/api/admin/ingestion/[id]/route.ts', imports)
    const request = { json: async () => ({ status: 'approved' }) }
    const response = await route.PATCH(request, { params: { id: 'item-1' } })
    const body = await response.json()

    if (shouldAlert) {
      ok(alertCalls.length === 1 && alertCalls[0] === 'published-1', `${targetType}: approving a result must call the alert exactly once, for the published id`)
      ok(body.alert === 'sent', `${targetType}: the response must include the alert outcome`)
    } else {
      ok(alertCalls.length === 0, `${targetType}: approving a ${targetType} must send no result alert`)
      ok(body.alert === undefined, `${targetType}: the response must not carry an alert field when nothing was alerted`)
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
