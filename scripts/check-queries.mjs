import fs from 'node:fs'
import path from 'node:path'

// Postgres sorts NULL first on a descending order. On a column that really
// contains NULLs, every undated row then floats above every dated one and a row
// cap (.limit) can push the dated rows out entirely. Any descending .order() on
// one of these columns must say what it wants: nullsFirst: false (or true, if
// that is genuinely intended).
//
// Keep this list explicit rather than guessed. Add a column here when the schema
// allows NULL and production actually holds NULLs in it. created_at and the
// scholarships/opportunities deadline orderings are deliberately not listed:
// created_at is filled by its default, and the deadline orderings already
// handle nulls explicitly.
const NULLABLE_DATE_COLUMNS = ['published_date']

const roots = ['app', 'lib', 'components']
const extensions = new Set(['.ts', '.tsx'])

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return filesIn(file)
    return extensions.has(path.extname(entry.name)) ? [file] : []
  })
}

// .order('col')  |  .order("col", { ascending: false, nullsFirst: false })
// The options object may span lines. A column passed as a variable cannot be
// checked here, so keep column names literal at the call site.
const orderCall = /\.order\(\s*(['"`])([A-Za-z_][A-Za-z0-9_]*)\1\s*(?:,\s*\{([^}]*)\})?\s*\)/g

const failures = []
for (const root of roots) {
  for (const file of filesIn(root)) {
    const text = fs.readFileSync(file, 'utf8')
    for (const match of text.matchAll(orderCall)) {
      const column = match[2]
      if (!NULLABLE_DATE_COLUMNS.includes(column)) continue
      const options = match[3] ?? ''
      const hasDirection = /\bascending\s*:/.test(options)
      const literallyAscending = /\bascending\s*:\s*true\b/.test(options)
      const explicitNulls = /\bnullsFirst\s*:/.test(options)
      // No direction means ascending, which already puts NULLs last.
      const maybeDescending = hasDirection && !literallyAscending
      if (maybeDescending && !explicitNulls) {
        const line = text.slice(0, match.index).split(/\r?\n/).length
        failures.push(`${file}:${line} orders ${column} descending without nullsFirst`)
      }
    }
  }
}

if (failures.length) {
  console.error('Query guard found descending orders on nullable date columns with no explicit null handling.')
  console.error('NULLs sort first on a descending order, so undated rows bury dated ones. Add nullsFirst: false.')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('Query guard passed.')
}
