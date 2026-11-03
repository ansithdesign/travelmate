import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { Button } from '../components/ui/Button'
import { ScrollRow } from '../components/ui/ScrollRow'
import { PhotoCard } from '../components/ui/Cover'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { CategoryIcon } from '../components/icons/CategoryIcon'
import { categoryById } from '../data/categories'
import type { CategoryId } from '../types'
import { cx } from '../utils/cx'
import { formatMoney } from '../utils/money'

export function Expenses() {
  const views = useAllTripViews()
  const { data, me } = useStore()
  const { openExpense } = useUI()
  const [tripId, setTripId] = useState<string>('all')
  const [cat, setCat] = useState<CategoryId | null>(null)
  const sorted = useMemo(() => [...views].sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate)), [views])
  const scope = tripId === 'all' ? sorted : sorted.filter((v) => v.trip.id === tripId)
  const expenses = scope.flatMap((v) => v.expenses)
  const settled = new Set(views.filter((v) => v.settled && v.expenses.length).map((v) => v.trip.id))

  const inr = scope.filter((v) => v.trip.currency === 'INR')
  const owedToMe = inr.reduce((a, v) => a + Math.max(0, v.ledger.net[me.id] ?? 0), 0)
  const iOwe = inr.reduce((a, v) => a + Math.max(0, -(v.ledger.net[me.id] ?? 0)), 0)
  const bubbles = useMemo(() => {
    const t = new Map<CategoryId, number>()
    for (const e of expenses) t.set(e.category, (t.get(e.category) ?? 0) + e.amount)
    return [...t.entries()].map(([id, total]) => ({ id, total })).sort((a, b) => b.total - a.total).slice(0, 7)
  }, [expenses])

  return (
    <>
      <SkyHero className="pt-[max(28px,env(safe-area-inset-top))] pb-8 lg:pt-12">
        <div className="on-sky">
        <h1 className="text-hero">
          Expenses
          <Dot />
        </h1>

        {/* Where the money went: each category is a bubble sized by spend. Tap one to filter. */}
        {bubbles.length ? (
          <ScrollRow className="-mx-6 mt-8 flex items-end gap-3 px-6 pt-1 pb-1" role="group" aria-label="Spend by category">
            {bubbles.map((b) => {
              const size = Math.round(54 + 44 * Math.sqrt(b.total / bubbles[0].total))
              const on = cat === b.id
              return (
                <button key={b.id} type="button" aria-pressed={on} aria-label={`${categoryById[b.id].label}, ${formatMoney(b.total)}`} onClick={() => setCat(on ? null : b.id)} className="press shrink-0 text-center">
                  <span
                    className={cx('flex items-center justify-center rounded-full bg-white/20 transition-[background-color,box-shadow] duration-300', on && 'bg-white/35 shadow-[0_0_0_3px_#fff]')}
                    style={{ width: size, height: size }}
                  >
                    <CategoryIcon id={b.id} size={Math.round(size * 0.74)} />
                  </span>
                  <span className={cx('num mt-1.5 block text-caption', on ? 'font-bold' : 'font-medium text-ink-3')}>{formatMoney(b.total, { round: true })}</span>
                </button>
              )
            })}
            <span aria-hidden className="w-4 shrink-0" />
          </ScrollRow>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className={cx('level num', iOwe ? 'act' : owedToMe ? 'ok' : 'quiet')}>
            {iOwe ? `You owe ${formatMoney(iOwe)}` : owedToMe ? `You are owed ${formatMoney(owedToMe)}` : 'All clear'}
          </span>
          {iOwe && owedToMe ? <span className="level ok num">You are owed {formatMoney(owedToMe)}</span> : null}
          <span className="num text-caption font-medium text-ink-3">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </span>
        </div>

        </div>
        <ScrollRow className="-mx-6 mt-6 flex gap-2 px-6 py-1 sm:mx-0 sm:px-0" role="group" aria-label="Trip">
          <button
            type="button"
            aria-pressed={tripId === 'all'}
            onClick={() => setTripId('all')}
            className={cx('press flex h-[42px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium', tripId === 'all' ? 'bg-white text-[#14224a]' : 'bg-white/20 text-white')}
          >
            All trips <span className="num opacity-80">{data.expenses.length}</span>
          </button>
          {sorted.map((v, i) => (
            <button
              key={v.trip.id}
              type="button"
              aria-pressed={tripId === v.trip.id}
              onClick={() => setTripId(v.trip.id)}
              className={cx('press flex h-[42px] shrink-0 items-center gap-2 rounded-full pr-4 pl-1.5 text-[14px] font-medium', tripId === v.trip.id ? 'bg-white text-[#14224a]' : 'bg-white/20 text-white')}
            >
              <PhotoCard photo={v.trip.cover} seed={i + 1} radius={999} className="size-7" />
              {v.trip.name}
              <span className="num opacity-80">{v.expenses.length}</span>
            </button>
          ))}
          <span aria-hidden className="w-6 shrink-0" />
        </ScrollRow>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="lg:max-w-[820px]">
          <ExpenseList
            key={tripId}
            category={cat}
            onCategory={setCat}
            expenses={expenses}
            trips={scope.map((v) => v.trip)}
            settledTrips={settled}
            emptyAction={
              data.trips.length ? (
                <Button icon={Plus} onClick={() => openExpense({ tripId: tripId === 'all' ? undefined : tripId })}>
                  Add expense
                </Button>
              ) : undefined
            }
          />
        </SheetBody>
      </ContentSheet>
    </>
  )
}
