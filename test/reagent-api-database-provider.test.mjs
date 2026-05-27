import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const files = [
  'app/api/reagents/route.ts',
  'app/api/reagents/[id]/route.ts',
  'app/api/health/route.ts',
]

test('reagent API routes use the Supabase admin client', async () => {
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    assert.match(source, /@\/lib\/supabase-server/, `${file} should import Supabase server client`)
    assert.doesNotMatch(source, /jianguoyun/i, `${file} should not use Jianguoyun store at runtime`)
  }
})

