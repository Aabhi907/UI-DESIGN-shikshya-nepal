import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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
const dateFilterColumns = new Set(['admission_deadline', 'application_deadline', 'application_open_at'])
const dateFilterOperators = new Set(['gte', 'gt', 'lte', 'lt', 'eq'])

function instantFilterFailures(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const isoVariables = new Set()
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && /\.toISOString\s*\(/.test(node.initializer.getText(source))) {
      isoVariables.add(node.name.text)
    }
    ts.forEachChild(node, collect)
  }
  collect(source)
  const found = []
  function inspect(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const operator = node.expression.name.text
      const column = node.arguments[0]
      const value = node.arguments[1]
      const direct = dateFilterOperators.has(operator) && column && ts.isStringLiteral(column) && dateFilterColumns.has(column.text)
      const raw = operator === 'or' && column && [...dateFilterColumns].some(name => new RegExp(`\\b${name}\\.(?:gte|gt|lte|lt|eq)\\.`).test(column.getText(source)))
      if ((direct || raw) && (direct ? value : column)) {
        const argument = (direct ? value : column).getText(source)
        const usesInstant = /\.toISOString\s*\(/.test(argument)
          || /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(argument)
          || [...isoVariables].some(name => new RegExp(`\\b${name}\\b`).test(argument))
        if (usesInstant) {
          const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
          found.push(`${file}:${line} compares an admissions date to an ISO instant`)
        }
      }
    }
    ts.forEachChild(node, inspect)
  }
  inspect(source)
  return found
}

const files = process.argv[2] === '--check-file' && process.argv[3]
  ? [process.argv[3]]
  : roots.flatMap(filesIn)
for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    failures.push(...instantFilterFailures(file, text))
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

if (failures.length) {
  console.error('Query guard found unsafe date queries.')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('Query guard passed.')
}
