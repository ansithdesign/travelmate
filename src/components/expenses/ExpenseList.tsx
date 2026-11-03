import { useMemo, useState } from 'react'
import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '../../data/categories'
import { useStore } from '../../store/store'
import type { CategoryId, CurrencyCode, Expense, ID, Trip } from '../../types'
import { cx } from '../../utils/cx'
import { dayLabel, isoDate, parseDate } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'
import { Chip, EmptyState, Segmented } from '../ui/Controls'
import { Field, TextInput, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { ExpenseDetailSheet } from './ExpenseDetailSheet'
import { ExpenseRow } from './ExpenseRow'
import { Avatar } from '../ui/Avatar'
import { firstName } from '../../utils/id'

type Sort = 'newest' | 'oldest' | 'highest' | 'lowest'

interface Filters {
  q: string
  categories: CategoryId[]
  paidBy: ID | 'any'
  from: string
  to: string
  sort: Sort
}

const EMPTY: Filters = { q: '', categories: [], paidBy: 'any', from: '', to: '', sort: 'newest' }

/**
 * Searchable, filterable list of expenses grouped by day.
 * Used for one trip, or across all trips (pass `trips`).
 */
export function ExpenseList({
  expenses,
  trips,
  settledTrips,
  emptyAction,
}: {
  expenses: Expense[]
  trips: Trip[]
  settledTrips: Set<ID>
  emptyAction?: React.ReactNode
}) {
  const { person, data } = useStore()
  const [f, setF] = useState<Filters>(EMPTY)
  const [open, setOpen] = useState<Expense | null>(null)
  const [sheet, setSheet] = useState(false)
  const multiTrip = trips.length > 1
  const tripById = useMemo(() => Object.fromEntries(trips.map((t) => [t.id, t])), [trips])

  const people = useMemo(() => {
    const ids = new Set(expenses.map((e) => e.paidBy))
    return [...ids].map(person).filter(Boolean) as NonNullable<ReturnType<typeof person>>[]
  }, [expenses, person])

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const out = expenses.filter((e) => {
      if (f.categories.length && !f.categories.includes(e.category)) return false
      if (f.paidBy !== 'any' && e.paidBy !== f.paidBy) return false
      const day = isoDate(new Date(e.date))
      if (f.from && day < f.from) return false
      if (f.to && day > f.to) return false
      if (q) {
        const payer = person(e.paidBy)?.name ?? ''
        const hay = `${e.title} ${e.notes ?? ''} ${e.receipt?.merchant ?? ''} ${payer} ${tripById[e.tripId]?.name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const by = {
      newest: (a: Expense, b: Expense) => b.date.localeCompare(a.date),
      oldest: (a: Expense, b: Expense) => a.date.localeCompare(b.date),
      highest: (a: Expense, b: Expense) => b.amount - a.amount,
      lowest: (a: Expense, b: Expense) => a.amount - b.amount,
    }[f.sort]
    return out.sort(by)
  }, [expenses, f, person, tripById])

  const byDate = f.sort === 'newest' || f.sort === 'oldest'
  const groups = useMemo(() => {
    if (!byDate) return [{ key: 'all', label: '', items: filtered }]
    const m = new Map<string, Expense[]>()
    for (const e of filtered) {
      const k = isoDate(new Date(e.date))
      m.set(k, [...(m.get(k) ?? []), e])
    }
    return [...m.entries()].map(([k, items]) => ({ key: k, label: dayLabel(k) + (parseDate(k).getFullYear() !== new Date().getFullYear() ? ` ${parseDate(k).getFullYear()}` : ''), items }))
  }, [filtered, byDate])

  const advanced = (f.paidBy !== 'any' ? 1 : 0) + (f.from || f.to ? 1 : 0) + (f.sort !== 'newest' ? 1 : 0)
  const anyFilter = f.q || f.categories.length || advanced
  const total = filtered.reduce((a, e) => a + e.amount, 0)
  const currencies = new Set(filtered.map((e) => tripById[e.tripId]?.currency ?? 'INR'))
  const singleCurrency: CurrencyCode | null = currencies.size <= 1 ? ([...currencies][0] ?? 'INR') : null

  const catCounts = useMemo(() => {
    const c: Partial<Record<CategoryId, number>> = {}
    for (const e of expenses) c[e.category] = (c[e.category] ?? 0) + 1
    return c
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        body="Add the first one when someone pays. Splits and balances update on their own."
        action={emptyAction}
        marker={<span className="flex h-14 w-11 items-end justify-center rounded-t-full rounded-b-[6px] bg-surface pb-2 shadow-[0_0_0_1px_var(--color-line)]"><span className="h-1 w-5 rounded-full bg-line" /></span>}
      />
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" aria-hidden />
          <TextInput
            type="search"
            aria-label="Search expenses"
            placeholder={multiTrip ? 'Search expenses, people, trips' : 'Search expenses or people'}
            value={f.q}
            onChange={(e) => setF((x) => ({ ...x, q: e.target.value }))}
            className="h-11 pl-10"
          />
        </div>
        <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setSheet(true)} aria-label="Filters and sort" className="relative px-3.5">
          <span className="hidden sm:inline">Filters</span>
          {advanced ? <span className="num ml-0.5 flex size-5 items-center justify-center rounded-full bg-forest text-[11px] font-semibold text-white">{advanced}</span> : null}
        </Button>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Chip active={f.categories.length === 0} onClick={() => setF((x) => ({ ...x, categories: [] }))}>
          All
        </Chip>
        {CATEGORIES.filter((c) => catCounts[c.id]).map((c) => (
          <Chip
            key={c.id}
            icon={c.icon}
            active={f.categories.includes(c.id)}
            count={catCounts[c.id]}
            onClick={() =>
              setF((x) => ({ ...x, categories: x.categories.includes(c.id) ? x.categories.filter((y) => y !== c.id) : [...x.categories, c.id] }))
            }
          >
            {c.short}
          </Chip>
        ))}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-3 border-b border-line pb-2.5 text-meta">
        <span className="text-ink-2">
          {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
          {anyFilter ? (
            <button type="button" onClick={() => setF(EMPTY)} className="ml-2 inline-flex items-center gap-1 font-medium text-forest hover:underline">
              <X size={13} aria-hidden /> Clear
            </button>
          ) : null}
        </span>
        {singleCurrency ? <span className="num font-medium">{formatMoney(total, { currency: singleCurrency })}</span> : <span className="text-ink-3">Mixed currencies</span>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing matches" body="Try another word or clear the filters." action={<Button variant="secondary" onClick={() => setF(EMPTY)}>Clear filters</Button>} />
      ) : (
        groups.map((g) => {
          const dayTotal = g.items.reduce((a, e) => a + e.amount, 0)
          return (
            <section key={g.key} className="mt-4">
              {g.label ? (
                <h3 className="flex items-baseline justify-between py-1 text-meta">
                  <span className="font-medium text-ink-2">{g.label}</span>
                  {singleCurrency ? <span className="num text-ink-3">{formatMoney(dayTotal, { currency: singleCurrency })}</span> : null}
                </h3>
              ) : null}
              <ul className="divide-y divide-line-soft">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <ExpenseRow
                      expense={e}
                      currency={tripById[e.tripId]?.currency ?? 'INR'}
                      settled={settledTrips.has(e.tripId)}
                      tripName={multiTrip ? tripById[e.tripId]?.name : undefined}
                      onOpen={() => setOpen(e)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}

      <ExpenseDetailSheet expense={open ? (data.expenses.find((x) => x.id === open.id) ?? null) : null} onClose={() => setOpen(null)} />

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filter and sort"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setF((x) => ({ ...EMPTY, q: x.q, categories: x.categories }))}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setSheet(false)}>
              Show {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-meta font-medium text-ink-2">
              <ArrowDownUp size={14} aria-hidden /> Sort by
            </h3>
            <Segmented
              label="Sort by"
              value={f.sort}
              onChange={(sort) => setF((x) => ({ ...x, sort }))}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'highest', label: 'Highest' },
                { value: 'lowest', label: 'Lowest' },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-meta font-medium text-ink-2">Paid by</h3>
            <div className="flex flex-wrap gap-2">
              <Chip active={f.paidBy === 'any'} onClick={() => setF((x) => ({ ...x, paidBy: 'any' }))}>
                Anyone
              </Chip>
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={f.paidBy === p.id}
                  onClick={() => setF((x) => ({ ...x, paidBy: p.id }))}
                  className={cx('inline-flex h-9 items-center gap-1.5 rounded-full py-0.5 pr-3.5 pl-0.5 text-meta font-medium', f.paidBy === p.id ? 'bg-ink text-white' : 'bg-surface text-ink-2 hairline')}
                >
                  <Avatar person={p} size={28} />
                  {p.isYou ? 'You' : firstName(p.name)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From" htmlFor="flt-from">
              <input id="flt-from" type="date" className={inputClass} value={f.from} max={f.to || undefined} onChange={(e) => setF((x) => ({ ...x, from: e.target.value }))} />
            </Field>
            <Field label="To" htmlFor="flt-to">
              <input id="flt-to" type="date" className={inputClass} value={f.to} min={f.from || undefined} onChange={(e) => setF((x) => ({ ...x, to: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
