import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ContentSheet, SheetBody, SkyHero } from '../components/shared/Page'
import { Button } from '../components/ui/Button'
import { PhotoCard } from '../components/ui/Cover'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { cx } from '../utils/cx'
import { formatMoney } from '../utils/money'

export function Expenses() {
  const views = useAllTripViews()
  const { data, me } = useStore()
  const { openExpense } = useUI()
  const [tripId, setTripId] = useState<string>('all')
  const sorted = useMemo(() => [...views].sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate)), [views])
  const scope = tripId === 'all' ? sorted : sorted.filter((v) => v.trip.id === tripId)
  const expenses = scope.flatMap((v) => v.expenses)
  const settled = new Set(views.filter((v) => v.settled && v.expenses.length).map((v) => v.trip.id))

  const inr = scope.filter((v) => v.trip.currency === 'INR')
  const owedToMe = inr.reduce((a, v) => a + Math.max(0, v.ledger.net[me.id] ?? 0), 0)
  const iOwe = inr.reduce((a, v) => a + Math.max(0, -(v.ledger.net[me.id] ?? 0)), 0)

  return (
    <>
      <SkyHero className="pt-[max(18px,env(safe-area-inset-top))] pb-6 lg:pt-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sky text-hero">Expenses</h1>
          <Button icon={Plus} size="sm" variant="white" onClick={() => openExpense({ tripId: tripId === 'all' ? undefined : tripId })} disabled={data.trips.length === 0}>
            Add
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="glass-control rounded-[24px] px-4 py-3.5">
            <p className="text-sky-2 text-caption font-semibold">You are owed</p>
            <p className="text-sky num mt-0.5 text-title">{owedToMe ? formatMoney(owedToMe) : 'Nothing'}</p>
          </div>
          <div className="glass-control rounded-[24px] px-4 py-3.5">
            <p className="text-sky-2 text-caption font-semibold">You owe</p>
            <p className="text-sky num mt-0.5 text-title">{iOwe ? formatMoney(iOwe) : 'All clear'}</p>
          </div>
        </div>

        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="group" aria-label="Trip">
          <button
            type="button"
            aria-pressed={tripId === 'all'}
            onClick={() => setTripId('all')}
            className={cx('press flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-meta font-semibold', tripId === 'all' ? 'bg-white text-[#0c1736]' : 'glass-control text-white')}
          >
            All trips <span className="num opacity-60">{data.expenses.length}</span>
          </button>
          {sorted.map((v, i) => (
            <button
              key={v.trip.id}
              type="button"
              aria-pressed={tripId === v.trip.id}
              onClick={() => setTripId(v.trip.id)}
              className={cx('press flex h-10 shrink-0 items-center gap-2 rounded-full pr-4 pl-1.5 text-meta font-semibold', tripId === v.trip.id ? 'bg-white text-[#0c1736]' : 'glass-control text-white')}
            >
              <PhotoCard photo={v.trip.cover} seed={i + 1} radius={999} className="size-7" />
              {v.trip.name}
              <span className="num opacity-60">{v.expenses.length}</span>
            </button>
          ))}
        </div>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="lg:max-w-[820px]">
          <ExpenseList
            key={tripId}
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
