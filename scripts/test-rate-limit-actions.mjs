// Offline contract check. No environment files or database clients are loaded.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

function source(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
}
const security = source('lib/public-form-security.ts')
const declaration = security.statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === 'PublicFormAction')
assert.ok(declaration && ts.isUnionTypeNode(declaration.type), 'PublicFormAction must be an explicit string union')
const actions = declaration.type.types.map(node => {
  assert.ok(ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal))
  return node.literal.text
}).sort()
const migrations = fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).sort()
const latest = migrations.reverse().find(file => /CREATE OR REPLACE FUNCTION (?:public\.)?consume_public_form_rate_limit\s*\(/i.test(fs.readFileSync(path.join('supabase/migrations', file), 'utf8')))
assert.ok(latest, 'No rate-limit function migration found')
const override = process.argv.indexOf('--migration-file')
const file = override < 0 ? path.join('supabase/migrations', latest) : process.argv[override + 1]
const sql = fs.readFileSync(file, 'utf8')
const body = sql.match(/CREATE OR REPLACE FUNCTION (?:public\.)?consume_public_form_rate_limit\s*\([\s\S]*?AS \$\$([\s\S]*?)\$\$;/i)?.[1]
assert.ok(body, 'Rate-limit function body not found')
function values(list) {
  return [...list.matchAll(/'([^']+)'/g)].map(match => match[1]).sort()
}
const functionList = body.match(/p_action NOT IN\s*\(([^)]+)\)/i)?.[1]
assert.ok(functionList, 'Function action allow-list not found')
const accepted = values(functionList)
assert.deepEqual(accepted, actions, 'Rate-limit action mismatch: PublicFormAction and function allow-list differ')
const constraintList = sql.match(/ADD CONSTRAINT public_form_attempts_action_check\s+CHECK\s*\(action IN\s*\(([^)]+)\)/i)?.[1]
assert.ok(constraintList, 'Action constraint not found')
assert.deepEqual(values(constraintList), [...actions, 'school_submission'].sort(), 'Constraint must retain historical school_submission rows')

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? filesIn(file) : /\.tsx?$/.test(file) ? [file] : []
  })
}
const used = new Set()
for (const file of ['app', 'lib', 'components'].flatMap(filesIn)) {
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'checkPublicFormRateLimit') {
      const action = node.arguments[2]
      assert.ok(action && ts.isStringLiteral(action), file + ': action must be an explicit literal')
      assert.ok(actions.includes(action.text), file + ': unknown form action ' + action.text)
      used.add(action.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source(file))
}
assert.deepEqual([...used].sort(), actions, 'PublicFormAction must match actions used by forms')
assert.match(sql.trim(), /^--[^]*?BEGIN;/)
assert.match(sql.trim(), /COMMIT;$/)
assert.match(sql, /ALTER DEFAULT PRIVILEGES FOR ROLE postgres\s+REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;/)
assert.match(sql, /ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public\s+REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;/)
for (const signature of [
  'cast_community_vote(TEXT, UUID, TEXT, SMALLINT)',
  'consume_public_form_rate_limit(TEXT, TEXT, INTEGER)',
  'delete_expired_community_security_events()',
  'handle_new_user()',
]) {
  assert.ok(sql.includes('REVOKE ALL ON FUNCTION public.' + signature + ' FROM PUBLIC, anon, authenticated;'))
  assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.' + signature + ' TO service_role;'))
}
console.log('Rate-limit checks passed: ' + actions.join(', ') + '; historical school_submission retained in the constraint only.')
