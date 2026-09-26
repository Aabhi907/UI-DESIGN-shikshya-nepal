// Wave 1 / Stream 3 checks: a slightly odd link must never crash admissions,
// scholarships, opportunities, deadlines or entrance-exams, and entrance-exam
// status/dates must follow the Nepal calendar day, not the server's local
// midnight (UTC on Vercel).
//
// Each page's real source is transpiled and executed with stubbed imports (the
// same approach as test-public-list-errors.mjs). The fake Supabase client both
// answers a queued result per table AND logs every filter method called, in
// order, so a test can prove a bad param's filter was never applied (not just
// that the page happened not to crash), and that a date floor really is
// applied before the row limit.
//
// Run: npm run test:w1-params-and-dates
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import * as admissionsLib from '../lib/admissions.ts'
import { publicListState } from '../lib/public-list-state.ts'

const require = createRequire(import.meta.url)
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const { renderToStaticMarkup } = require('react-dom/server')

let checks = 0
const ok = (condition, message) => { assert.ok(condition, message); checks++ }

// ---- fake Supabase client: answers a queued result per table, and records
// every chained method call (with its arguments) so a test can inspect not
// just what rendered, but exactly which filters a query actually applied.
// A table's entry may be a single { data, error } used for every call to it,
// or an array of them consumed one per call — needed where a page issues two
// separate queries against the same table (e.g. entrance-exams' open/upcoming
// and recently-closed queries) and a test wants them to differ. ----
function fakeDb(tables) {
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
const rows = (...items) => ({ data: items, error: null })

// ---- stand-ins for UI components and Next.js internals, mirroring
// test-public-list-errors.mjs exactly (a plain stub div; a page that starts
// using a sub-component this doesn't know about fails loudly, not quietly). ----
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

// `expose` pulls out module-internal helpers (e.g. daysFromToday) that the
// page deliberately does NOT export — Next's typed-routes check rejects any
// export from a page.tsx beyond the reserved names (default, metadata, ...),
// so the real source stays clean and this reaches in from the test side only,
// by appending a line that reads those local consts after the transpiled
// module body has defined them.
function loadPage(file, db, expose = []) {
  let output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: 'page.tsx',
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  if (expose.length) output += `\nObject.assign(exports, { ${expose.join(', ')} });\n`
  const imports = {
    'react': React, 'react/jsx-runtime': jsxRuntime, 'lucide-react': icons,
    'next/link': { __esModule: true, default: Link },
    '@/lib/supabase': { createServerSupabaseClient: () => db },
    '@/lib/public-list-state': { publicListState }, '@/lib/admissions': admissionsLib,
  }
  const loaded = { exports: {} }
  vm.runInNewContext(output, {
    module: loaded, exports: loaded.exports, URLSearchParams, Date, console: { error() {}, warn() {}, log() {} },
    require: name => {
      if (name.startsWith('@/components/')) return stubModule(name)
      if (!(name in imports)) throw new Error(`Unexpected import in page under test: ${name}`)
      return imports[name]
    },
  }, { filename: file })
  return loaded.exports
}

// A page that throws instead of rendering is reported as that, with the scenario named.
async function render(file, tables, props, scenario) {
  const db = fakeDb(tables)
  const page = loadPage(path.resolve(file), db)
  let element
  try {
    element = await page.default(props)
  } catch (error) {
    throw new assert.AssertionError({ message: `${scenario}: the page threw instead of rendering (${error.digest ?? error.message})` })
  }
  return { markup: renderToStaticMarkup(element), log: db.log, page }
}

const ERROR = { data: null, error: { message: 'database unavailable', code: '57P03', details: null, hint: null } }
const alerts = markup => (markup.match(/role="alert"/g) || []).length

const calledWith = (log, table, method, firstArg) => log.some(e => e.table === table && e.method === method && (firstArg === undefined || e.args[0] === firstArg))
// Scholarships/opportunities also call .or() for their deadline window
// (independent of any search term), so "was a search applied" has to look at
// the shape of the call, not just whether .or() happened at all.
const hasSearchFilter = (log, table) => log.some(e => e.table === table && e.method === 'or' && /ilike/.test(e.args[0]))

const admissionRow = (n, extra = {}) => ({ id: `adm-${n}`, title: `Sentinel admission ${n}`, institution_name: 'Sentinel institute', institution_type: 'college', education_level: 'Bachelor', admission_type: 'general', application_deadline: null, application_open_at: null, verification_status: 'unverified', college: null, ...extra })
const scholarshipRow = (n, extra = {}) => ({ id: `sch-${n}`, title: `Sentinel scholarship ${n}`, provider_name: 'Sentinel provider', deadline: null, education_levels: [], target_groups: [], application_url: null, source_url: null, last_verified_at: null, coverage: null, eligibility: null, college: null, ...extra })
const opportunityRow = (n, extra = {}) => ({ id: `opp-${n}`, title: `Sentinel opportunity ${n}`, opportunity_type: 'internship', organisation: 'Sentinel org', location: null, eligibility: null, summary: 'Sentinel summary', application_url: null, source_url: null, deadline: null, is_verified: false, last_verified_at: null, ...extra })

async function main() {
  // ---- Section 0: lib/admissions.ts — addDaysToDateOnly must never throw,
  // even when called directly with input the page-level guard would already
  // have rejected (defence in depth, not just the page's own validation). ----
  {
    const safe = admissionsLib.addDaysToDateOnly('2026-09-25', NaN)
    ok(safe === '2026-09-25', `addDaysToDateOnly must return the input date unchanged on a non-finite offset, got ${safe}`)
    const safeHuge = admissionsLib.addDaysToDateOnly('2026-09-25', 99999999999)
    ok(typeof safeHuge === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(safeHuge), `addDaysToDateOnly must return a safe date string on an out-of-range offset, not throw — got ${safeHuge}`)
  }

  // ---- Section A: admissions — a bad or repeated `deadline`/`q` must never
  // crash the page, and must be dropped entirely (its filter never applied),
  // exactly as if the param had not been sent. ----
  const admissionRows = rows(admissionRow(1), admissionRow(2))

  for (const deadline of ['abc', '99999999999', '-5', '7.5']) {
    const { log } = await render('app/(main)/admissions/page.tsx', { admissions: admissionRows }, { searchParams: { deadline } }, `admissions?deadline=${deadline}`)
    ok(!calledWith(log, 'admissions', 'gte', 'application_deadline'), `admissions?deadline=${deadline}: an invalid deadline must not add a date filter (got one — the param was applied instead of ignored)`)
  }
  {
    const { log } = await render('app/(main)/admissions/page.tsx', { admissions: admissionRows }, { searchParams: { deadline: '7' } }, 'admissions?deadline=7 (control)')
    ok(calledWith(log, 'admissions', 'gte', 'application_deadline'), 'admissions?deadline=7: a valid window must still apply the date filter (the guard is over-rejecting)')
  }
  {
    // Next.js hands back an array for a repeated key.
    const { markup, log } = await render('app/(main)/admissions/page.tsx', { admissions: admissionRows }, { searchParams: { q: ['a', 'b'] } }, 'admissions?q=a&q=b')
    ok(!calledWith(log, 'admissions', 'or'), 'admissions?q=a&q=b: a repeated q must not reach the search filter as an array')
    ok(!markup.includes('undefined') && !markup.includes('[object'), 'admissions?q=a&q=b: an array must not leak into the rendered page')
  }
  {
    const longQuery = 'x'.repeat(200)
    const { log } = await render('app/(main)/admissions/page.tsx', { admissions: admissionRows }, { searchParams: { q: longQuery } }, 'admissions?q=<200 chars>')
    const orCall = log.find(e => e.table === 'admissions' && e.method === 'or')
    ok(Boolean(orCall), 'admissions?q=<200 chars>: a real search term must still reach the filter')
    const embedded = orCall.args[0].match(/title\.ilike\.%(.*?)%,/)?.[1] ?? ''
    ok(embedded.length <= 80, `admissions search must cap at 80 characters like scholarships/opportunities, got ${embedded.length}`)
  }

  // ---- Section B: scholarships and opportunities — the same repeated-`q`
  // shape must not crash either page. ----
  for (const [file, table, rowsFor] of [
    ['app/(main)/scholarships/page.tsx', 'scholarships', () => rows(scholarshipRow(1), scholarshipRow(2))],
    ['app/(main)/opportunities/page.tsx', 'student_opportunities', () => rows(opportunityRow(1), opportunityRow(2))],
  ]) {
    const { log } = await render(file, { [table]: rowsFor() }, { searchParams: { q: ['a', 'b'] } }, `${file}?q=a&q=b`)
    ok(!hasSearchFilter(log, table), `${file}?q=a&q=b: a repeated q must not reach the search filter as an array`)
  }

  // ---- Section C: entrance-exams — the same array shape on q/authority/field
  // must not crash, and the Nepal calendar day, not the server's local
  // midnight, must decide open/closed. ----
  {
    const { log } = await render('app/(main)/entrance-exams/page.tsx', { entrance_exams: rows() }, { searchParams: { q: ['a', 'b'], authority: ['x', 'y'], field: ['p', 'q'] } }, 'entrance-exams?q=a&q=b&authority=x&authority=y&field=p&field=q')
    ok(!hasSearchFilter(log, 'entrance_exams'), 'entrance-exams: a repeated q must not reach the search filter as an array')
  }

  {
    const page = loadPage(path.resolve('app/(main)/entrance-exams/page.tsx'), fakeDb({}), ['daysFromToday', 'stateFor'])
    // A date-only deadline is stored at UTC midnight for its Nepal calendar
    // day (2026-09-25). Nepal is UTC+5:45, so its midnight falls at 18:15 UTC
    // — the four instants below straddle that boundary from both sides.
    const deadline = '2026-09-25T00:00:00Z'
    const boundaryCases = [
      ['23:30 NPT (same Nepal day as the deadline)', '2026-09-25T17:45:00Z', 0],
      ['00:30 NPT, the next Nepal day', '2026-09-25T18:45:00Z', -1],
      ['18:00 UTC (still 23:45 NPT, same day)', '2026-09-25T18:00:00Z', 0],
      ['19:00 UTC (00:45 NPT, next day)', '2026-09-25T19:00:00Z', -1],
    ]
    for (const [label, nowIso, expectedDays] of boundaryCases) {
      const days = page.daysFromToday(deadline, new Date(nowIso))
      ok(days === expectedDays, `entrance-exams daysFromToday at ${label}: expected ${expectedDays}, got ${days} (server-local midnight instead of Nepal midnight?)`)
    }
    // stateFor must carry the same day count through to the label a student reads.
    ok(page.stateFor({ application_deadline: deadline }, new Date('2026-09-25T18:00:00Z')).label === 'Closes today', 'entrance-exams stateFor at 18:00 UTC must read "Closes today"')
    ok(page.stateFor({ application_deadline: deadline }, new Date('2026-09-25T19:00:00Z')).label === 'Closed', 'entrance-exams stateFor at 19:00 UTC must read "Closed"')
  }

  // ---- Section D: entrance-exams list — an "open/upcoming" query must exist
  // with its own floor, independent of how many closed exams there are; the
  // "recently closed" query must only run when it will actually be shown. ----
  {
    const { log } = await render('app/(main)/entrance-exams/page.tsx', { entrance_exams: rows() }, { searchParams: {} }, 'entrance-exams (open only)')
    const upcoming = log.filter(e => e.table === 'entrance_exams')
    const orIndex = upcoming.findIndex(e => e.method === 'or' && /application_deadline\.is\.null/.test(e.args[0]))
    const limitIndex = upcoming.findIndex(e => e.method === 'limit')
    ok(orIndex !== -1, 'entrance-exams: the open/upcoming query must floor at today (or a null deadline)')
    ok(orIndex !== -1 && limitIndex !== -1 && orIndex < limitIndex, 'entrance-exams: the floor must be applied before the row cap')
    ok(!upcoming.some(e => e.method === 'lt' && e.args[0] === 'application_deadline'), 'entrance-exams: the default (open-only) view must not run a second, unbounded historical query')
  }
  {
    const { log } = await render('app/(main)/entrance-exams/page.tsx', { entrance_exams: rows() }, { searchParams: { status: 'all' } }, 'entrance-exams?status=all')
    const all = log.filter(e => e.table === 'entrance_exams')
    // The open/upcoming query floors via `.or('application_deadline.is.null,...gte...')`
    // (it must still include undated exams); the recently-closed query floors
    // and ceilings via separate `.gte`/`.lt` calls, since it excludes nulls anyway.
    const upcomingFloor = all.findIndex(e => e.method === 'or' && /application_deadline\.is\.null/.test(e.args[0]))
    const closedFloor = all.findIndex(e => e.method === 'gte' && e.args[0] === 'application_deadline')
    const closedCeiling = all.findIndex(e => e.method === 'lt' && e.args[0] === 'application_deadline')
    const limitIndexes = all.reduce((acc, e, i) => (e.method === 'limit' ? [...acc, i] : acc), [])
    ok(upcomingFloor !== -1, 'entrance-exams?status=all: the open/upcoming query must still floor at today (or a null deadline)')
    ok(closedFloor !== -1, 'entrance-exams?status=all: the recently-closed set needs its own 90-day floor')
    ok(closedCeiling !== -1, 'entrance-exams?status=all: the recently-closed set needs its own ceiling at today')
    ok(closedFloor !== -1 && closedCeiling !== -1 && all[closedFloor].args[1] < all[closedCeiling].args[1], 'entrance-exams?status=all: the recently-closed floor must be earlier than its ceiling')
    ok(limitIndexes.length >= 2, 'entrance-exams?status=all: open/upcoming and recently-closed must be capped separately so neither crowds the other out')
    ok(limitIndexes.every(i => i > upcomingFloor) , 'entrance-exams?status=all: every cap must come after its query\'s own floor')
  }
  {
    // A failed recently-closed query (open/upcoming succeeds) must show the
    // same failure state as a failed open/upcoming query — not quietly drop
    // the closed exams and render as if the page loaded fine.
    const { markup } = await render('app/(main)/entrance-exams/page.tsx', { entrance_exams: [rows(), ERROR] }, { searchParams: { status: 'all' } }, 'entrance-exams?status=all (closed query fails)')
    ok(alerts(markup) === 1, `entrance-exams?status=all with a failed closed-exam query: expected exactly one role="alert", found ${alerts(markup)}`)
    ok(markup.includes('Entrance exams could not be loaded'), 'entrance-exams?status=all with a failed closed-exam query must show the failure state, not silently drop the closed exams')
    // Reverse check: the same request with BOTH queries succeeding must not
    // show that failure state, proving the assertion above isn't vacuous.
    const ok2 = await render('app/(main)/entrance-exams/page.tsx', { entrance_exams: [rows(), rows()] }, { searchParams: { status: 'all' } }, 'entrance-exams?status=all (both queries succeed, control)')
    ok(alerts(ok2.markup) === 0 && !ok2.markup.includes('Entrance exams could not be loaded'), 'entrance-exams?status=all: the failure state must not show when both queries succeed (control for the check above)')
  }

  // ---- Section E: /deadlines — every source query must floor (and, for
  // "recently missed", also cap the ceiling) before the row limit, so old
  // rows can never crowd out the window actually being shown. ----
  const deadlineTables = [['admissions', 'application_deadline'], ['entrance_exams', 'application_deadline'], ['scholarships', 'deadline'], ['student_opportunities', 'deadline']]
  {
    const { log } = await render('app/(main)/deadlines/page.tsx', {}, { searchParams: {} }, 'deadlines (coming up)')
    for (const [table, col] of deadlineTables) {
      const entries = log.filter(e => e.table === table)
      const gteIndex = entries.findIndex(e => e.method === 'gte' && e.args[0] === col)
      const limitIndex = entries.findIndex(e => e.method === 'limit')
      ok(gteIndex !== -1, `deadlines/${table}: expected a .gte('${col}', ...) floor`)
      ok(limitIndex !== -1 && gteIndex < limitIndex, `deadlines/${table}: the floor must be applied before the row cap`)
      ok(gteIndex !== -1 && /^\d{4}-\d{2}-\d{2}$/.test(entries[gteIndex].args[1]), `deadlines/${table}: the floor must be a bare Nepal calendar day, not an instant`)
    }
  }
  {
    const { log } = await render('app/(main)/deadlines/page.tsx', {}, { searchParams: { range: 'past' } }, 'deadlines?range=past')
    for (const [table, col] of deadlineTables) {
      const entries = log.filter(e => e.table === table)
      const gteIndex = entries.findIndex(e => e.method === 'gte' && e.args[0] === col)
      const ltIndex = entries.findIndex(e => e.method === 'lt' && e.args[0] === col)
      const limitIndex = entries.findIndex(e => e.method === 'limit')
      ok(gteIndex !== -1 && ltIndex !== -1, `deadlines/${table} (past): "recently missed" needs both a 90-day floor and a today ceiling`)
      ok(limitIndex !== -1 && gteIndex < limitIndex && ltIndex < limitIndex, `deadlines/${table} (past): floor and ceiling must both be applied before the row cap`)
    }
  }
  {
    // A repeated `level` must not crash the page either (it reads searchParams.level directly, not through a cleaner like the search boxes above).
    await render('app/(main)/deadlines/page.tsx', {}, { searchParams: { level: ['a', 'b'] } }, 'deadlines?level=a&level=b')
  }

  console.log(`Wave 1 / Stream 3 checks passed: ${checks} assertions across five pages (bad params, Nepal-day boundaries, and query floors).`)
}

main().catch(error => { console.error(error); process.exitCode = 1 })
