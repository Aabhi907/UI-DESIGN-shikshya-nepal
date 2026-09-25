import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { publicListState } from '../lib/public-list-state.ts'

const pages = {
  admissions: 'app/(main)/admissions/page.tsx',
  exams: 'app/(main)/entrance-exams/page.tsx',
  province: 'app/(main)/colleges/province/[province]/page.tsx',
  program: 'app/(main)/colleges/program/[slug]/page.tsx',
  location: 'app/(main)/colleges/in/[location]/page.tsx',
}

const override = process.argv[2] === '--override' ? { name: process.argv[3], file: process.argv[4] } : null
if (override && (!Object.hasOwn(pages, override.name) || !override.file)) {
  throw new Error('Usage: --override <admissions|exams|province|program|location> <source-file>')
}

for (const [name, file] of Object.entries(pages)) {
  const source = fs.readFileSync(override?.name === name ? override.file : path.resolve(file), 'utf8')
  assert.ok(/publicListState\s*\(/.test(source), `${name} must preserve query errors`)
  assert.ok(/loadError\s*\?/.test(source), `${name} must render an error branch`)
  assert.ok(/role="alert"/.test(source), `${name} must identify the error state`)
  assert.ok(/Try again/.test(source), `${name} must offer retry`)
  assert.ok(/No (matching|colleges|active)/.test(source), `${name} must retain an empty state`)

  const empty = publicListState({ data: [], error: null })
  assert.deepEqual(empty, { items: [], loadError: false }, `${name}: genuine empty`)
  const failed = publicListState({ data: null, error: { message: 'database unavailable' } })
  assert.deepEqual(failed, { items: [], loadError: true }, `${name}: database failure`)
  const populated = publicListState({ data: [{ id: name }], error: null })
  assert.deepEqual(populated, { items: [{ id: name }], loadError: false }, `${name}: populated`)
}

console.log('Public list error-state checks passed for all five pages.')
