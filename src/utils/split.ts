import type { ID, Paise, Split } from '../types'

/**
 * Distribute `total` paise across keys in proportion to `weights`, using the
 * largest-remainder method so the parts always add up to exactly `total`.
 * Ties are broken by input order, which keeps results stable between renders.
 */
export function apportion(total: Paise, keys: ID[], weights: number[]): Record<ID, Paise> {
  const result: Record<ID, Paise> = {}
  const sum = weights.reduce((a, b) => a + b, 0)
  if (keys.length === 0 || sum <= 0) {
    keys.forEach((k) => (result[k] = 0))
    return result
  }
  const raw = weights.map((w) => (total * w) / sum)
  const floors = raw.map(Math.floor)
  let remainder = total - floors.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (const { i } of order) {
    if (remainder <= 0) break
    floors[i] += 1
    remainder -= 1
  }
  keys.forEach((k, i) => (result[k] = floors[i]))
  return result
}

export interface SplitResult {
  shares: Record<ID, Paise>
  /** Sum of what has been assigned (exact) or percent total (percent) */
  assigned: number
  /** What `assigned` must reach */
  target: number
  valid: boolean
  message?: string
}

/** Compute each participant's share of an expense, and whether the split is complete. */
export function computeSplit(amount: Paise, split: Split): SplitResult {
  const people = split.participants
  if (people.length === 0) {
    return { shares: {}, assigned: 0, target: amount, valid: false, message: 'Choose at least one person' }
  }
  switch (split.method) {
    case 'equal': {
      const shares = apportion(amount, people, people.map(() => 1))
      return { shares, assigned: amount, target: amount, valid: amount > 0 }
    }
    case 'exact': {
      const shares: Record<ID, Paise> = {}
      let assigned = 0
      for (const p of people) {
        const v = Math.max(0, Math.round(split.values[p] ?? 0))
        shares[p] = v
        assigned += v
      }
      const diff = amount - assigned
      return {
        shares,
        assigned,
        target: amount,
        valid: diff === 0 && amount > 0,
        message: diff === 0 ? undefined : diff > 0 ? 'left' : 'over',
      }
    }
    case 'percent': {
      // Work in hundredths of a percent to stay in integers.
      const bps = people.map((p) => Math.max(0, Math.round((split.values[p] ?? 0) * 100)))
      const assigned = bps.reduce((a, b) => a + b, 0)
      const shares = apportion(amount, people, bps)
      return {
        shares,
        assigned: assigned / 100,
        target: 100,
        valid: assigned === 10000 && amount > 0,
        message: assigned === 10000 ? undefined : assigned < 10000 ? 'left' : 'over',
      }
    }
    case 'shares': {
      const w = people.map((p) => Math.max(0, split.values[p] ?? 0))
      const total = w.reduce((a, b) => a + b, 0)
      const shares = apportion(amount, people, w)
      return {
        shares,
        assigned: total,
        target: total,
        valid: total > 0 && amount > 0,
        message: total > 0 ? undefined : 'Give at least one person a share',
      }
    }
  }
}

/**
 * Unrounded share per person (fractional paise). Summing these across a trip and
 * rounding once avoids paisa drift that per-expense rounding would accumulate.
 */
export function rawShares(amount: Paise, split: Split): Record<ID, number> {
  const people = split.participants
  const out: Record<ID, number> = {}
  if (people.length === 0) return out
  if (split.method === 'exact') {
    for (const p of people) out[p] = Math.max(0, Math.round(split.values[p] ?? 0))
    return out
  }
  const w =
    split.method === 'equal'
      ? people.map(() => 1)
      : people.map((p) => Math.max(0, split.values[p] ?? 0))
  const sum = w.reduce((a, b) => a + b, 0)
  people.forEach((p, i) => (out[p] = sum > 0 ? (amount * w[i]) / sum : 0))
  return out
}

/** Seed per-person values when switching methods so the new method starts balanced. */
export function defaultValues(method: Split['method'], amount: Paise, people: ID[]): Record<ID, number> {
  if (people.length === 0) return {}
  if (method === 'exact') return apportion(amount, people, people.map(() => 1))
  if (method === 'percent') {
    const bps = apportion(10000, people, people.map(() => 1))
    return Object.fromEntries(people.map((p) => [p, bps[p] / 100]))
  }
  if (method === 'shares') return Object.fromEntries(people.map((p) => [p, 1]))
  return {}
}
