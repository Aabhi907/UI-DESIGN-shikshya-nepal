// Offline behavioural checks of the real auth modules. No real Supabase or env file.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const React = require('react')
const runtime = require('react/jsx-runtime')
const { renderToStaticMarkup } = require('react-dom/server')
const { NextResponse } = require('next/server')
const overrides = new Map()
const read = file => overrides.get(file) ?? fs.readFileSync(file, 'utf8')
const env = { NODE_ENV: 'production', ADMIN_EMAIL: 'owner@example.test', NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'stub-anon', SUPABASE_SERVICE_ROLE_KEY: 'stub-service' }
function load(file, mocks = {}, globals = {}) {
  const compiled = ts.transpileModule(read(file), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, process: { env: { ...env } }, URL, URLSearchParams, Request,
    console: { error() {}, log() {} }, ...globals,
    require: name => {
      if (Object.hasOwn(mocks, name)) return mocks[name]
      if (name === 'react/jsx-runtime') return runtime
      if (name === 'next/server') return { NextResponse }
      if (name === 'next/link') return { __esModule: true, default: props => React.createElement('a', props) }
      if (name === 'lucide-react') return new Proxy({}, { get: () => () => null })
      throw new Error('Unstubbed import: ' + name)
    },
  }, { filename: file })
  return module.exports
}
function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? filesIn(file) : /\.tsx?$/.test(file) ? [file] : []
  })
}
function boundaries() {
  for (const file of ['app', 'components', 'lib'].flatMap(filesIn)) {
    const text = read(file)
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    for (const node of source.statements) {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === '@/lib/supabase') {
        const imports = node.importClause?.namedBindings
        if (imports && ts.isNamedImports(imports)) {
          assert.ok(!imports.elements.some(item => (item.propertyName || item.name).text === 'supabase'), 'Browser Supabase import: ' + file)
        }
      }
    }
    assert.ok(!text.includes('rest/v1'), 'Direct REST URL: ' + file)
    if (/^\s*['"]use client['"]/.test(text)) {
      assert.ok(!text.includes('@supabase/'), 'Browser Supabase SDK: ' + file)
      assert.ok(!text.includes('document.cookie'), 'Browser cookie reader: ' + file)
    }
  }
}
function hooks() {
  const values = [], effects = [], cleanups = []
  let cursor = 0, mounting = true
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++
      if (!(index in values)) values[index] = initial
      return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next }]
    },
    useEffect(effect) { if (mounting) effects.push(effect) },
  }
  return {
    react,
    render(component, props) { cursor = 0; const result = component(props); mounting = false; return result },
    async flush() { for (const effect of effects.splice(0)) { const cleanup = effect(); if (cleanup) cleanups.push(cleanup) } await new Promise(resolve => setImmediate(resolve)) },
    cleanup() { cleanups.forEach(cleanup => cleanup()) },
  }
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (predicate(node)) return node
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = find(child, predicate)
    if (found) return found
  }
  return null
}
function safeTests() {
  const { safeNextPath } = load('lib/safe-next.ts')
  const hostile = ['/.//evil.com', '/..//evil.com', '//evil.com', '/%2F%2Fevil.com', '/%2f/evil.com', '/\\evil.com', '/%5cevil.com', '/\t/evil.com', 'https://evil.com', '/Admin', '/admin/x', 'javascript:alert(1)', '/%255cevil.com', '/%252f%252fevil.com', '/foo/../Admin', '/%61dmin', '/%00evil', null, '', '/%ZZ']
  for (const value of hostile) assert.equal(safeNextPath(value), '/', 'Unsafe next accepted: ' + value)
  for (const value of ['/colleges?q=ku', '/account/saved#top']) assert.equal(safeNextPath(value), value, 'Safe next changed')
  return safeNextPath
}
async function loginTests() {
  for (const file of ['app/api/auth/login/route.ts', 'app/api/admin/login/route.ts']) {
    const admin = file.includes('/admin/')
    async function attempt({ rate = 'allowed', email = 'owner@example.test', authError = false, role = 'owner', profileError = false, profileThrows = false } = {}) {
      let signIns = 0, signOuts = 0
      const client = { auth: { signInWithPassword: async () => { signIns++; return { data: { user: authError ? null : { id: 'stub-user', email } }, error: authError ? {} : null } }, signOut: async () => { signOuts++; return { error: null } } } }
      const db = { from(table) { assert.equal(table, 'profiles'); return { select() { return this }, eq() { return this }, async single() { if (profileThrows) throw Error('stub profile failure'); return { data: { role, status: 'active' }, error: profileError ? {} : null } } } } }
      const route = load(file, {
        '@/lib/auth': { createAuthClient: () => client, isAdminEmail: value => value === env.ADMIN_EMAIL },
        '@/lib/supabase': { createAdminSupabaseClient: () => db },
        '@/lib/public-form-security': { checkPublicFormRateLimit: async (passedDb, request, action, limit) => {
          assert.equal(passedDb, db)
          assert.equal(signIns, 0, 'Password called before limiter')
          assert.equal(action, admin ? 'admin_login' : 'account_login')
          assert.equal(limit, admin ? 20 : 40)
          return rate
        } },
      })
      const response = await route.POST(new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify({ email, password: 'test-password' }) }))
      return { status: response.status, body: await response.json(), signIns, signOuts, retry: response.headers.get('Retry-After') }
    }
    const limited = await attempt({ rate: 'limited' })
    assert.equal(limited.status, 429, 'Login must enforce rate limit: ' + file)
    assert.equal(limited.signIns, 0)
    assert.equal(limited.retry, '3600')
    for (const rate of ['unavailable', 'not_configured']) {
      const failure = await attempt({ rate })
      assert.equal(failure.status, 503, 'Limiter failure must fail closed')
      assert.equal(failure.signIns, 0)
    }
    assert.equal((await attempt()).status, 200)
    if (admin) {
      for (const input of [{ email: 'unknown@example.test' }, { authError: true }, { role: 'user' }, { profileError: true }, { profileThrows: true }]) {
        const result = await attempt(input)
        assert.equal(result.status, 401, 'Admin credential failures must have identical status')
        assert.deepEqual(result.body, { error: 'Invalid email or password' }, 'Admin credential failures must have identical body')
        if (!input.email && !input.authError) assert.equal(result.signOuts, 1, 'Failed profile check must sign out')
      }
    }
  }
}
async function cookieTests() {
  for (const mode of ['production', 'development']) {
    let options
    const client = { auth: { getUser: async () => ({ data: { user: null } }) } }
    const sdk = { createServerClient: (url, key, passed) => { options = passed; return client } }
    const context = { process: { env: { ...env, NODE_ENV: mode } } }
    const auth = load('lib/auth.ts', {
      '@supabase/ssr': sdk, 'next/headers': { cookies: () => ({ getAll: () => [], set() {} }) },
      '@/lib/supabase': { createAdminSupabaseClient: () => { throw Error('not needed') } },
    }, context)
    auth.createAuthClient()
    verify(options.cookieOptions, 'lib/auth.ts', mode)
    const middleware = load('middleware.ts', { '@supabase/ssr': sdk }, context)
    await middleware.middleware({ method: 'GET', headers: new Headers(), url: 'http://localhost/colleges', nextUrl: new URL('http://localhost/colleges'), cookies: { getAll: () => [], set() {} } })
    verify(options.cookieOptions, 'middleware.ts', mode)
  }
  function verify(options, file, mode) {
    assert.equal(options?.httpOnly, true, 'HttpOnly missing: ' + file)
    assert.ok(options.maxAge > 0 && options.maxAge <= 7 * 24 * 60 * 60, 'Cookie lifetime too long: ' + file)
    assert.equal(options.secure, mode === 'production')
    assert.equal(options.sameSite, 'lax')
    assert.equal(options.path, '/')
  }
  const db = load('lib/supabase.ts', { '@supabase/supabase-js': { createClient: () => ({}) } }, { process: { env: { ...env, SUPABASE_SERVICE_ROLE_KEY: '' } } })
  assert.throws(() => db.createAdminSupabaseClient(), /SUPABASE_SERVICE_ROLE_KEY/, 'Missing service key must throw')
  assert.ok(!Object.hasOwn(db, 'supabase'), 'Browser client must not be exported')
}
async function oauthTests(safeNextPath) {
  const button = load('components/auth/GoogleSignInButton.tsx', { '@/lib/safe-next': { safeNextPath } }).default
  const element = button({ next: '/colleges?q=ku' })
  assert.equal(element.type, 'a', 'Google button must render a plain anchor, not Link')
  assert.ok(!read('components/auth/GoogleSignInButton.tsx').includes('next/link'), 'Google button must not import next/link')
  const markup = renderToStaticMarkup(element)
  assert.ok(markup.includes('/auth/google?next=%2Fcolleges%3Fq%3Dku'), 'Google button must use server start route')
  let options
  const start = load('app/auth/google/route.ts', {
    '@/lib/safe-next': { safeNextPath },
    '@/lib/auth': { createAuthClient: () => ({ auth: { signInWithOAuth: async passed => { options = passed; return { data: { url: 'https://provider.example.test/authorize' }, error: null } } } }) },
  })
  const redirect = await start.GET(new Request('http://localhost/auth/google?next=%2Fcolleges'))
  assert.equal(redirect.headers.get('location'), 'https://provider.example.test/authorize')
  assert.equal(options.provider, 'google')
  assert.equal(options.options.redirectTo, 'http://localhost/auth/callback?next=%2Fcolleges')
  assert.ok(!options.options.queryParams, 'OAuth must not request offline access or consent')
  for (const failure of ['error', 'throw']) {
    const broken = load('app/auth/google/route.ts', {
      '@/lib/safe-next': { safeNextPath },
      '@/lib/auth': { createAuthClient: () => ({ auth: { signInWithOAuth: async () => { if (failure === 'throw') throw Error('stub'); return { data: {}, error: {} } } } }) },
    })
    assert.ok((await broken.GET(new Request('http://localhost/auth/google'))).headers.get('location').includes('/account/login?error=google_sign_in_failed'))
  }
  const callback = load('app/auth/callback/route.ts', {
    '@/lib/safe-next': { safeNextPath },
    '@/lib/auth': { createAuthClient: () => ({ auth: { exchangeCodeForSession: async code => { assert.equal(code, 'stub-code'); return { error: null } } } }) },
  })
  assert.equal((await callback.GET(new Request('http://localhost/auth/callback?code=stub-code&next=%2Fcolleges'))).headers.get('location'), 'http://localhost/colleges', 'Callback ignores safe next')
  assert.equal((await callback.GET(new Request('http://localhost/auth/callback?code=stub-code&next=%2FAdmin'))).headers.get('location'), 'http://localhost/')
  assert.ok((await callback.GET(new Request('http://localhost/auth/callback'))).headers.get('location').includes('google_callback_failed'))
  const ssr = fs.readFileSync('node_modules/@supabase/ssr/src/createServerClient.ts', 'utf8')
  assert.ok(ssr.includes('flowType: "pkce"'), 'Installed server client must use PKCE')
}
async function componentTests(safeNextPath) {
  const h = hooks(), replacements = []
  const login = load('app/(main)/account/login/page.tsx', {
    react: h.react, 'next/navigation': { useRouter: () => ({ replace: value => replacements.push(value), refresh() {} }) },
    '@/lib/safe-next': { safeNextPath }, '@/components/auth/GoogleSignInButton': { __esModule: true, default: props => React.createElement('span', { 'data-next': props.next }) },
  }, { window: { location: { search: '?next=%2Fcolleges' }, history: { replaceState() {} } }, fetch: async () => ({ ok: true, json: async () => ({ success: true }) }) }).default
  h.render(login); await h.flush()
  let tree = h.render(login)
  find(tree, node => node.props?.autoComplete === 'email').props.onChange({ target: { value: 'student@example.test' } })
  tree = h.render(login)
  find(tree, node => node.props?.autoComplete === 'current-password').props.onChange({ target: { value: 'test-password' } })
  tree = h.render(login)
  await find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.deepEqual(replacements, ['/colleges'], 'Email login ignores safe next')
  assert.ok(renderToStaticMarkup(tree).includes('data-next="/colleges"'), 'Google button ignores safe next')

  for (const state of ['signed-in', 'signed-out', 'http-error', 'bad-json', 'network-error']) {
    const hooksState = hooks()
    const review = load('components/colleges/ReviewForm.tsx', { react: hooksState.react }, {
      localStorage: { getItem: () => null },
      fetch: async (url, options) => {
        assert.equal(url, '/api/auth/session', 'Review must use cookie-backed session endpoint')
        assert.equal(options.cache, 'no-store')
        if (state === 'network-error') throw Error('stub')
        return { ok: state !== 'http-error', json: async () => { if (state === 'bad-json') throw Error('stub'); return { authenticated: state === 'signed-in' } } }
      },
    }).default
    let tree = hooksState.render(review, { collegeId: 'stub-college', collegeName: 'Stub College' })
    assert.ok(renderToStaticMarkup(tree).includes('Sign in to write a review'), 'Loading review check must be signed out')
    await hooksState.flush()
    tree = hooksState.render(review, { collegeId: 'stub-college', collegeName: 'Stub College' })
    const submit = find(tree, node => node.type === 'button' && node.props.type === 'submit')
    if (state === 'signed-in') assert.equal(submit?.props.disabled, false, 'Signed-in review submit must be enabled')
    else assert.ok(renderToStaticMarkup(tree).includes('Sign in to write a review'), 'Failed session check must stay signed out')
    hooksState.cleanup()
  }
  const notice = read('components/admin/NoticeForm.tsx')
  assert.ok(notice.includes('universities }: Props'), 'NoticeForm must consume server university props')
  for (const file of ['app/admin/notices/new/page.tsx', 'app/admin/notices/[id]/edit/page.tsx']) {
    assert.ok(read(file).includes('universities={'), 'Admin page must pass universities: ' + file)
    assert.ok(read(file).includes('createAdminSupabaseClient'), 'University list must use service-role client')
  }
}
async function suite() {
  boundaries()
  const safeNextPath = safeTests()
  await loginTests()
  await cookieTests()
  await oauthTests(safeNextPath)
  await componentTests(safeNextPath)
}
await suite()
console.log('Wave 2 auth checks passed: redirects, login failures/limits, cookies, OAuth, email next, review sessions and server university props.')
if (process.argv.includes('--mutations')) {
  const mutations = [
    ['redirect normalization', 'lib/safe-next.ts', text => text.replace("path.pathname.startsWith('//')", 'false')],
    ['browser client boundary', 'components/auth/GoogleSignInButton.tsx', text => "import { supabase } from '@/lib/supabase'\n" + text],
    ['Google full-page navigation', 'components/auth/GoogleSignInButton.tsx', text => "import Link from 'next/link'\n" + text.replace('<a\n', '<Link\n').replace('</a>', '</Link>')],
    ['callback next', 'app/auth/callback/route.ts', text => text.replace("safeNextPath(url.searchParams.get('next'))", "'/'")],
    ['email next', 'app/(main)/account/login/page.tsx', text => text.replace('router.replace(safeNextPath(nextPath))', "router.replace('/')")],
    ['review session endpoint', 'components/colleges/ReviewForm.tsx', text => text.replace("fetch('/api/auth/session'", "fetch('/api/auth/wrong'")],
    ['direct NoticeForm REST', 'components/admin/NoticeForm.tsx', text => text + "\n// rest/v1/universities\n"],
    ['service key fallback', 'lib/supabase.ts', text => text.replace("throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the admin Supabase client')", "console.error('stub fallback')")],
    ['auth HttpOnly', 'lib/auth.ts', text => text.replace('httpOnly: true', 'httpOnly: false')],
    ['middleware lifetime', 'middleware.ts', text => text.replace('7 * 24 * 60 * 60', '400 * 24 * 60 * 60')],
    ['account login limit', 'app/api/auth/login/route.ts', text => text.replace("rate === 'limited'", 'false')],
    ['admin login limit', 'app/api/admin/login/route.ts', text => text.replace("rate === 'limited'", 'false')],
    ['uniform admin errors', 'app/api/admin/login/route.ts', text => text.replace('if (!isAdminEmail(email)) return invalid()', "if (!isAdminEmail(email)) return NextResponse.json({ error: 'Not owner' }, { status: 403 })")],
  ]
  for (const [label, file, mutate] of mutations) {
    const original = read(file), altered = mutate(original)
    assert.notEqual(altered, original, 'Mutation did not change source: ' + label)
    overrides.set(file, altered)
    try {
      await suite()
      throw new Error('Mutation passed unexpectedly: ' + label)
    } catch (error) {
      assert.ok(!String(error.message).startsWith('Mutation passed unexpectedly'), error.message)
      console.log(label + ': rejected — ' + String(error.message).split('\n')[0])
    } finally { overrides.delete(file) }
  }
  await suite()
  console.log('All mutations rejected; original source restored in memory and passed again.')
}
