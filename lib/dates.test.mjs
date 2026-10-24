import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('./dates.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { dateKey, relativeDate, dayOffset, taskBucket, dayLabel } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
test('Tashkent midnight, independent of system timezone', () => {
  assert.equal(dateKey('2026-12-31T19:00:00Z'), '2027-01-01')
  assert.equal(dateKey('2026-12-31T18:59:59Z'), '2026-12-31')
})
test('relative dates cross months, years and leap days', () => {
  assert.equal(relativeDate(1, '12:00', new Date('2026-12-31T10:00Z')), '2027-01-01T07:00:00.000Z')
  assert.equal(dateKey(relativeDate(1, '12:00', new Date('2028-02-28T10:00Z'))), '2028-02-29')
})
test('overdue uses the deadline, not a manual group', () => {
  const now = new Date('2026-10-24T10:00Z')
  assert.equal(taskBucket('2026-10-24T09:59Z', now), 'overdue')
  assert.equal(taskBucket('2026-10-24T11:00Z', now), 'today')
  assert.equal(taskBucket('2026-10-24T19:00Z', now), 'later')
})
test('day labels and offsets roll over at midnight', () => {
  const value = '2026-10-24T19:00Z'
  assert.equal(dayOffset(value, new Date('2026-10-24T18:59Z')), 1)
  assert.equal(dayLabel(value, new Date(value)), 'Сегодня')
})
test('invalid time rejected', () => {
  assert.throws(() => relativeDate(0, '25:00'))
})
