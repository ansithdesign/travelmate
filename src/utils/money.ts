import type { CurrencyCode, Paise } from '../types'

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'INR', symbol: '₹', name: 'Indian rupee' },
  { code: 'USD', symbol: '$', name: 'US dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British pound' },
  { code: 'AED', symbol: 'AED ', name: 'UAE dirham' },
  { code: 'THB', symbol: '฿', name: 'Thai baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore dollar' },
  { code: 'IDR', symbol: 'Rp ', name: 'Indonesian rupiah' },
  { code: 'LKR', symbol: 'Rs ', name: 'Sri Lankan rupee' },
]
const SYMBOL = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.symbol])) as Record<CurrencyCode, string>
export const currencySymbol = (c: CurrencyCode = 'INR') => SYMBOL[c] ?? `${c} `

const whole = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const fractional = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ₹6,500 or ₹1,234.50. Indian digit grouping (₹1,20,000). Amounts are stored in minor units (paise, cents). */
export function formatMoney(paise: Paise, opts: { sign?: boolean; symbol?: boolean; currency?: CurrencyCode; round?: boolean } = {}): string {
  const { sign = false, symbol = true, currency = 'INR', round = false } = opts
  const abs = round ? Math.round(Math.abs(paise) / 100) * 100 : Math.abs(paise)
  const rupees = abs / 100
  const body = abs % 100 === 0 ? whole.format(rupees) : fractional.format(rupees)
  const prefix = paise < 0 ? '−' : sign && paise > 0 ? '+' : ''
  return `${prefix}${symbol ? currencySymbol(currency) : ''}${body}`
}

/** Compact for tight places: ₹1.2L, ₹38.4K */
export function formatCompact(paise: Paise, currency: CurrencyCode = 'INR'): string {
  const r = Math.abs(paise) / 100
  const s = currencySymbol(currency)
  if (currency === 'INR' && r >= 100000) return `${s}${trim(r / 100000)}L`
  if (r >= 1000) return `${s}${trim(r / 1000)}K`
  return formatMoney(paise, { currency })
}

function trim(n: number) {
  return n.toFixed(1).replace(/\.0$/, '')
}

/** Parse what a person types ("1,250.5", "₹ 640") into paise. Returns null when not a positive number. */
export function parseMoney(input: string): Paise | null {
  const cleaned = input.replace(/[₹,\s]/g, '')
  if (cleaned === '' || !/^\d*\.?\d{0,2}$/.test(cleaned)) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100)
}

/** Paise to an editable string without grouping: 125050 -> "1250.50", 650000 -> "6500" */
export function toInput(paise: Paise): string {
  if (paise % 100 === 0) return String(paise / 100)
  return (paise / 100).toFixed(2)
}
