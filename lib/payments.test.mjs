import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const { outputText } = ts.transpileModule(readFileSync(new URL('./payments.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { parsePayment, applyPayment } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
test('payment decimals and comma preserve cents', () => {
  assert.equal(parsePayment('1 200,50'), 120050)
  assert.equal(parsePayment('0.01'), 1)
  for (const value of ['-10', '0', '', '1.234', 'Infinity', 'abc']) assert.equal(parsePayment(value), null)
})
test('partial and final payments retain exact cents', () => {
  assert.deepEqual(applyPayment(100, 0, 3333), { received: 33.33, status: 'partial' })
  assert.deepEqual(applyPayment(100, 33.33, 6667), { received: 100, status: 'paid' })
})
test('invalid and excess payments rejected rather than clamped', () => {
  for (const amount of [0, -1, 10001, NaN, 1.5]) assert.throws(() => applyPayment(100, 0, amount))
  assert.throws(() => applyPayment(100, 100, 1))
})
