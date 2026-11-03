import { describe, expect, it } from 'vitest'
import type { Expense, Split } from '../types'
import { buildLedger, suggestTransfers } from './settle'
import { apportion, computeSplit } from './split'
import { parseMoney, formatMoney } from './money'

const exp = (id: string, amount: number, paidBy: string, split: Split): Expense => ({
  id,
  tripId: 't',
  title: id,
  amount,
  category: 'other',
  paidBy,
  date: '2026-01-01T10:00:00',
  split,
  createdAt: '2026-01-01T10:00:00',
})
const equal = (participants: string[]): Split => ({ method: 'equal', participants, values: {} })

describe('apportion', () => {
  it('always sums to the total', () => {
    const r = apportion(1000, ['a', 'b', 'c'], [1, 1, 1])
    expect(r.a + r.b + r.c).toBe(1000)
    expect([r.a, r.b, r.c]).toEqual([334, 333, 333])
  })
})

describe('computeSplit', () => {
  it('validates exact amounts against the total', () => {
    const s = computeSplit(65000, { method: 'exact', participants: ['a', 'b'], values: { a: 40000, b: 20000 } })
    expect(s.valid).toBe(false)
    expect(s.message).toBe('left')
    const ok = computeSplit(65000, { method: 'exact', participants: ['a', 'b'], values: { a: 45000, b: 20000 } })
    expect(ok.valid).toBe(true)
  })
  it('validates percentages reach 100', () => {
    const s = computeSplit(100000, { method: 'percent', participants: ['a', 'b'], values: { a: 60, b: 40 } })
    expect(s.valid).toBe(true)
    expect(s.shares).toEqual({ a: 60000, b: 40000 })
  })
  it('splits by shares', () => {
    const s = computeSplit(90000, { method: 'shares', participants: ['a', 'b'], values: { a: 2, b: 1 } })
    expect(s.shares).toEqual({ a: 60000, b: 30000 })
  })
})

describe('settlement (brief example)', () => {
  // A paid 8,000, B paid 3,000, C paid 1,000, all shared equally. Total 12,000, share 4,000 each.
  const members = ['A', 'B', 'C']
  const expenses = [
    exp('1', 800000, 'A', equal(members)),
    exp('2', 300000, 'B', equal(members)),
    exp('3', 100000, 'C', equal(members)),
  ]
  const ledger = buildLedger(members, expenses)
  it('computes nets', () => {
    expect(ledger.total).toBe(1200000)
    expect(ledger.net).toEqual({ A: 400000, B: -100000, C: -300000 })
  })
  it('needs two payments', () => {
    expect(suggestTransfers(ledger.net)).toEqual([
      { from: 'C', to: 'A', amount: 300000 },
      { from: 'B', to: 'A', amount: 100000 },
    ])
  })
  it('clears after payments are recorded', () => {
    const payments = suggestTransfers(ledger.net).map((t, i) => ({ id: String(i), tripId: 't', date: '', ...t }))
    const after = buildLedger(members, expenses, payments)
    expect(Object.values(after.net).every((v) => v === 0)).toBe(true)
  })
})

describe('money', () => {
  it('parses and formats', () => {
    expect(parseMoney('1,250.5')).toBe(125050)
    expect(parseMoney('abc')).toBeNull()
    expect(formatMoney(12000000)).toBe('₹1,20,000')
    expect(formatMoney(125050)).toBe('₹1,250.50')
  })
})
