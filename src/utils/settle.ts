import type { Expense, ID, Paise, Payment } from '../types'
import { apportion, computeSplit, rawShares } from './split'

export interface Ledger {
  /** What each person paid for the group */
  paid: Record<ID, Paise>
  /** Each person's share of all expenses */
  share: Record<ID, Paise>
  /** Payments sent and received while settling */
  sent: Record<ID, Paise>
  received: Record<ID, Paise>
  /** paid - share + sent - received. Positive: gets money back. Negative: owes. */
  net: Record<ID, Paise>
  total: Paise
}

export function buildLedger(members: ID[], expenses: Expense[], payments: Payment[] = []): Ledger {
  const zero = () => Object.fromEntries(members.map((m) => [m, 0])) as Record<ID, Paise>
  const paid = zero()
  const share = zero()
  const sent = zero()
  const received = zero()
  let total = 0

  const raw: Record<ID, number> = {}
  // Fixed order so floating-point sums (and therefore rounding) never depend on how a screen sorted the list.
  const ordered = [...expenses].sort((a, b) => a.id.localeCompare(b.id))
  for (const e of ordered) {
    total += e.amount
    paid[e.paidBy] = (paid[e.paidBy] ?? 0) + e.amount
    for (const [p, s] of Object.entries(rawShares(e.amount, e.split))) raw[p] = (raw[p] ?? 0) + s
  }
  // Round once for the whole trip so shares add up to the total exactly.
  const ids = Object.keys(raw)
  const rounded = apportion(total, ids, ids.map((id) => raw[id]))
  for (const id of ids) share[id] = rounded[id]
  for (const pay of payments) {
    sent[pay.from] = (sent[pay.from] ?? 0) + pay.amount
    received[pay.to] = (received[pay.to] ?? 0) + pay.amount
  }

  const net: Record<ID, Paise> = {}
  const everyone = new Set([...members, ...Object.keys(paid), ...Object.keys(share)])
  for (const p of everyone) {
    net[p] = (paid[p] ?? 0) - (share[p] ?? 0) + (sent[p] ?? 0) - (received[p] ?? 0)
  }
  return { paid, share, sent, received, net, total }
}

export interface Transfer {
  from: ID
  to: ID
  amount: Paise
}

/**
 * Suggest payments that clear every balance. Greedy: the person who owes the most
 * pays the person owed the most, repeat. This yields at most n-1 payments and is the
 * practical minimum for groups of this size.
 */
export function suggestTransfers(net: Record<ID, Paise>): Transfer[] {
  const debtors = Object.entries(net)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amt: -v }))
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amt: v }))
  const out: Transfer[] = []

  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.amt - a.amt || a.id.localeCompare(b.id))
    creditors.sort((a, b) => b.amt - a.amt || a.id.localeCompare(b.id))
    const d = debtors[0]
    const c = creditors[0]
    const amt = Math.min(d.amt, c.amt)
    if (amt > 0) out.push({ from: d.id, to: c.id, amount: amt })
    d.amt -= amt
    c.amt -= amt
    if (d.amt === 0) debtors.shift()
    if (c.amt === 0) creditors.shift()
  }
  return out
}

export function isSettled(net: Record<ID, Paise>): boolean {
  return Object.values(net).every((v) => v === 0)
}

/**
 * How many separate "A owes B" debts the expenses create before anything is netted.
 * Used to show how much the suggested payments simplify.
 */
export function countGrossDebts(expenses: Expense[]): number {
  const pairs = new Set<string>()
  for (const e of expenses) {
    for (const [p, share] of Object.entries(computeSplit(e.amount, e.split).shares)) {
      if (p !== e.paidBy && share > 0) pairs.add(`${p}>${e.paidBy}`)
    }
  }
  return pairs.size
}
