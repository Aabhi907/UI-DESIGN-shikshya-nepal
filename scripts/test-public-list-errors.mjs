// Behavioural checks for the five public list pages that must tell "the query failed"
// apart from "there is genuinely nothing to show".
//
// Each page's real source is transpiled and executed with stubbed imports (the same
// approach as test-college-revalidation.mjs). Supabase is a fake client that answers a
// queued success or error per table, and the page's returned element tree is rendered to
// HTML. The assertions are on what a visitor would see, so inverting the error branch,
// swallowing the error, or showing the empty state on failure all fail here.
//
// Run: npm run test:public-list-errors
// Probe: --override <admissions|exams|province|program|location> <source-file> runs the
// same checks with that page replaced by another file (e.g. a deliberately broken copy).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { publicListState } from '../lib/public-list-state.ts'
import * as admissionsLib from '../lib/admissions.ts'

const require = createRequire(import.meta.url)
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const { renderToStaticMarkup } = require('react-dom/server')

const ERROR = { data: null, error: { message: 'database unavailable', code: '57P03', details: null, hint: null } }
const EMPTY = { data: [], error: null }
const rows = (...items) => ({ data: items, error: null })

const item = (n, extra = {}) => ({ id: `item-${n}`, title: `Sentinel item ${n}`, name: `Sentinel item ${n}`, ...extra })
const exam = n => item(n, { education_level: 'Bachelor', application_deadline: null, exam_date: null, program: null, exam_body: 'Sentinel Board', university: null, exam_url: null, source_url: null, syllabus_url: null })

// A page renders one of three things: a failure notice, the genuine empty state, or items.
// `table` is the query the list depends on; `stub` is the component that renders one item
// (undefined when the page renders items inline); `count` counts rendered items.
const pages = {
  admissions: {
    file: 'app/(main)/admissions/page.tsx', props: { searchParams: {} }, table: 'admissions',
    failure: 'Admissions could not be loaded', empty: 'No matching admissions', retry: '/admissions',
    filtered: { props: { searchParams: { q: 'bca' } }, retry: '/admissions?q=bca' },
    rows: [item(1), item(2)], count: m => count(m, 'data-stub="AdmissionCard"'),
    // The summary tiles only make sense with real data.
    hiddenOnFailure: ['Closing soon', 'data-stub="AdmissionFilters"'],
  },
  exams: {
    file: 'app/(main)/entrance-exams/page.tsx', props: { searchParams: {} }, table: 'entrance_exams',
    failure: 'Entrance exams could not be loaded', empty: 'No matching exams', retry: '/entrance-exams',
    filtered: { props: { searchParams: { q: 'bca' } }, retry: '/entrance-exams?q=bca' },
    rows: [exam(1), exam(2)], count: m => count(m, 'Sentinel item'),
  },
  province: {
    file: 'app/(main)/colleges/province/[province]/page.tsx', props: { params: { province: 'bagmati' } }, table: 'colleges',
    failure: 'Colleges could not be loaded', empty: 'No colleges are indexed for Bagmati yet.', retry: '/colleges/province/bagmati',
    rows: [item(1), item(2)], count: m => count(m, 'data-stub="CollegeCard"'),
  },
  program: {
    file: 'app/(main)/colleges/program/[slug]/page.tsx', props: { params: { slug: 'bca' } }, table: 'college_programs',
    failure: 'Colleges could not be loaded', empty: 'No colleges are indexed for this program yet.', retry: '/colleges/program/bca',
    // The page first looks the programme up, then lists its colleges.
    before: { programs: rows({ id: 'program-1', slug: 'bca', name: 'Sentinel programme' }) },
    rows: [{ college: item(1) }, { college: item(2) }], count: m => count(m, 'data-stub="CollegeCard"'),
  },
  location: {
    file: 'app/(main)/colleges/in/[location]/page.tsx', props: { params: { location: 'kathmandu' } }, table: 'colleges',
    failure: 'Colleges could not be loaded', empty: 'No active colleges are indexed for Kathmandu yet.', retry: '/colleges/in/kathmandu',
    rows: [item(1), item(2)], count: m => count(m, 'data-stub="CollegeCard"'),
  },
}

const override = process.argv[2] === '--override' ? { name: process.argv[3], file: process.argv[4] } : null
if (process.argv[2] === '--override' && (!Object.hasOwn(pages, override.name) || !override.file)) {
  throw new Error('Usage: --override <admissions|exams|province|program|location> <source-file>')
}

const count = (markup, token) => markup.split(token).length - 1

function fakeDb(tables, calls) {
  return {
    from(table) {
      calls.push(table)
      const result = tables[table] ?? EMPTY
      const builder = new Proxy({}, {
        get(_, prop) {
          if (prop === 'then') return (resolve, reject) => Promise.resolve(result).then(resolve, reject)
          if (prop === 'single' || prop === 'maybeSingle') return async () => result
          return () => builder
        },
      })
      return builder
    },
  }
}

// A stand-in for any UI component: keeps the page's own markup and branching, but not the
// component's internals (they have their own concerns and may need client-only context).
// It is a plain function on purpose: if a page starts using a sub-component such as
// <Button.Link>, that is undefined here and the run fails loudly instead of passing quietly.
function stubComponent(name) {
  function StubComponent(props) {
    return React.createElement('div', { 'data-stub': name, 'data-id': props?.college?.id ?? props?.admission?.id }, props?.children)
  }
  StubComponent.displayName = name
  return StubComponent
}
const stubModule = name => new Proxy({ __esModule: true, default: stubComponent(name.split('/').pop()) }, {
  get: (target, prop) => (prop in target || typeof prop !== 'string' || !/^[A-Z]/.test(prop) ? target[prop] : stubComponent(prop)),
})
const icons = new Proxy({}, { get: () => () => null })
const Link = ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children)
const notFound = () => { throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' }) }

function loadPage(file, db) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: 'page.tsx',
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const imports = {
    'react': React, 'react/jsx-runtime': jsxRuntime, 'lucide-react': icons,
    'next/link': { __esModule: true, default: Link }, 'next/navigation': { notFound },
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

async function renderRaw(name, tables, props) {
  const spec = pages[name]
  const file = override?.name === name ? path.resolve(override.file) : path.resolve(spec.file)
  const calls = []
  const page = loadPage(file, fakeDb({ ...spec.before, ...tables }, calls))
  return { markup: renderToStaticMarkup(await page.default(props ?? spec.props)), calls, page }
}

// A page that throws (a 404, a crash) instead of rendering is reported as that, with the scenario named.
async function render(name, tables, props, scenario = 'render') {
  try {
    return await renderRaw(name, tables, props)
  } catch (error) {
    throw new assert.AssertionError({ message: `${name}/${scenario}: the page threw instead of rendering (${error.digest ?? error.message})` })
  }
}

const alerts = markup => count(markup, 'role="alert"')
let checks = 0
const ok = (condition, message) => { assert.ok(condition, message); checks++ }

for (const [name, spec] of Object.entries(pages)) {
  // 1. The query fails: the failure notice and a retry link, and nothing that implies "no results".
  const failed = await render(name, { [spec.table]: ERROR }, undefined, 'failure')
  ok(failed.calls.includes(spec.table), `${name}/failure: the page never queried ${spec.table}`)
  ok(alerts(failed.markup) === 1, `${name}/failure: expected exactly one role="alert", found ${alerts(failed.markup)}`)
  ok(failed.markup.includes(spec.failure), `${name}/failure: missing the failure message "${spec.failure}"`)
  ok(failed.markup.includes('Try again') && failed.markup.includes(`href="${spec.retry}"`), `${name}/failure: missing a retry link to ${spec.retry}`)
  ok(!failed.markup.includes(spec.empty), `${name}/failure: a database error must not read as "${spec.empty}"`)
  ok(spec.count(failed.markup) === 0, `${name}/failure: items are showing on a failed load`)
  for (const token of spec.hiddenOnFailure ?? []) ok(!failed.markup.includes(token), `${name}/failure: "${token}" should not render on a failed load`)

  // 2. Success with nothing to show: the genuine empty state, and no failure notice.
  const empty = await render(name, { [spec.table]: EMPTY }, undefined, 'empty')
  ok(empty.calls.includes(spec.table), `${name}/empty: the page never queried ${spec.table}`)
  ok(empty.markup.includes(spec.empty), `${name}/empty: missing the empty state "${spec.empty}"`)
  ok(alerts(empty.markup) === 0 && !empty.markup.includes('Try again') && !empty.markup.includes(spec.failure), `${name}/empty: a genuine empty result must not show the failure notice`)
  ok(spec.count(empty.markup) === 0, `${name}/empty: phantom items rendered`)

  // 3. Success with data: the items, and neither the empty state nor the failure notice.
  const full = await render(name, { [spec.table]: rows(...spec.rows) }, undefined, 'populated')
  ok(spec.count(full.markup) === spec.rows.length, `${name}/populated: expected ${spec.rows.length} items, rendered ${spec.count(full.markup)}`)
  ok(alerts(full.markup) === 0 && !full.markup.includes(spec.failure), `${name}/populated: the failure notice is showing on a successful load`)
  ok(!full.markup.includes(spec.empty), `${name}/populated: the empty state is showing alongside items`)

  // 4. Retrying must keep the visitor's filters.
  if (spec.filtered) {
    const kept = await render(name, { [spec.table]: ERROR }, spec.filtered.props, 'failure-with-filters')
    ok(kept.markup.includes(`href="${spec.filtered.retry}"`), `${name}/failure: retry link must preserve filters (${spec.filtered.retry})`)
  }
}

// The programme page has a second query. A failed programme lookup is a failure, not a 404;
// a lookup that succeeds with no programme is a real 404; neither may reach the colleges query.
{
  const spec = pages.program
  const failedLookup = await render('program', { programs: ERROR }, undefined, 'lookup-failure')
  ok(alerts(failedLookup.markup) === 1 && failedLookup.markup.includes(spec.failure), 'program/lookup-failure: a failed programme lookup must show the failure notice')
  ok(!failedLookup.calls.includes('college_programs'), 'program/lookup-failure: colleges must not be queried after a failed lookup')
  await assert.rejects(() => renderRaw('program', { programs: { data: null, error: null } }), e => e.digest === 'NEXT_NOT_FOUND')
  checks++
  const { page } = await render('program', { programs: ERROR }, undefined, 'metadata')
  const title = (await page.generateMetadata({ params: spec.props.params })).title
  ok(title === 'Colleges by Program', `program/metadata: a failed lookup must not title the page "${title}"`)
}

// The helper every page relies on. Kept as a unit check; the behaviour above is what proves the wiring.
assert.deepEqual(publicListState({ data: [], error: null }), { items: [], loadError: false })
assert.deepEqual(publicListState({ data: null, error: { message: 'database unavailable' } }), { items: [], loadError: true })
assert.deepEqual(publicListState({ data: [{ id: 1 }], error: null }), { items: [{ id: 1 }], loadError: false })
checks += 3

console.log(`Public list error-state checks passed: ${checks} assertions across the five pages (failure, empty and populated rendered from each page's real code).`)
