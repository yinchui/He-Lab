import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('health route is dynamic so it cannot serve stale database status', async () => {
  const source = await readFile('app/api/health/route.ts', 'utf8')
  assert.match(source, /dynamic\s*=\s*['"]force-dynamic['"]/)
})

test('Supabase diagnostics route reports only redacted runtime state', async () => {
  const source = await readFile('app/api/debug/supabase/route.ts', 'utf8')
  assert.match(source, /supabaseProjectRef/)
  assert.match(source, /serviceRoleKeySet/)
  assert.doesNotMatch(source, /serviceRoleKey:/)
  assert.doesNotMatch(source, /anonKey:/)
})
