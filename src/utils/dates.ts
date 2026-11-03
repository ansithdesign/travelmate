const DAY = 86400000

/** Local YYYY-MM-DD */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY)
}

const dm = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const dmy = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const wd = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
const long = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
const time = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })

/** 12 – 18 Dec 2026, 28 Nov – 3 Dec 2026, 30 Dec 2026 – 2 Jan 2027 */
export function formatRange(start: string, end: string): string {
  const a = parseDate(start)
  const b = parseDate(end)
  if (a.getFullYear() !== b.getFullYear()) return `${dmy.format(a)} – ${dmy.format(b)}`
  if (a.getMonth() === b.getMonth()) {
    if (a.getDate() === b.getDate()) return dmy.format(a)
    return `${a.getDate()} – ${dmy.format(b)}`
  }
  return `${dm.format(a)} – ${dmy.format(b)}`
}

export const fmt = {
  dayMonth: (s: string) => dm.format(parseDate(s)),
  full: (s: string) => dmy.format(parseDate(s)),
  weekday: (s: string) => wd.format(parseDate(s)),
  long: (s: string) => long.format(parseDate(s)),
  time: (iso: string) => time.format(new Date(iso)).replace(' ', ' ').toLowerCase(),
  monthYear: (s: string) => monthYear.format(parseDate(s)),
}

/** "Today", "Yesterday", "Sat, 19 Sept" for list group headers */
export function dayLabel(iso: string): string {
  const d = parseDate(iso)
  const diff = daysBetween(d, today())
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return wd.format(d)
}

export function tripLength(start: string, end: string): number {
  return daysBetween(parseDate(start), parseDate(end)) + 1
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Datetime-local input value from an ISO string */
export function toLocalInput(iso: string): string {
  const d = new Date(iso)
  return `${isoDate(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
