import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('health route is dynamic so it cannot serve stale database status', async () => {
  const source = await readFile('app/api/health/route.ts', 'utf8')
  assert.match(source, /dynamic\s*=\s*['"]force-dynamic['"]/)
})
