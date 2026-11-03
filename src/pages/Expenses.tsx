import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
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
      <SkyHero className="pt-[max(28px,env(safe-area-inset-top))] pb-8 lg:pt-12">
        <h1 className="text-hero">
          Expenses
          <Dot />
        </h1>

        {/* Stats are open: a hairline and a figure, no box */}
        <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-6">
          <div className="hairline pt-3">
            <p className="text-meta font-medium text-ink-3">You are owed</p>
            <p className={cx('num mt-1 text-[26px] leading-8 font-[650] tracking-[-0.03em]', owedToMe ? 'text-gain' : 'text-ink')}>{owedToMe ? formatMoney(owedToMe) : 'Nothing'}</p>
          </div>
          <div className="hairline pt-3">
            <p className="text-meta font-medium text-ink-3">You owe</p>
            <p className={cx('num mt-1 text-[26px] leading-8 font-[650] tracking-[-0.03em]', iOwe ? 'text-loss' : 'text-ink')}>{iOwe ? formatMoney(iOwe) : 'All clear'}</p>
          </div>
        </div>

        <div className="no-scrollbar -mx-6 mt-6 flex gap-2 overflow-x-auto px-6 py-1 sm:mx-0 sm:px-0" role="group" aria-label="Trip">
          <button
            type="button"
            aria-pressed={tripId === 'all'}
            onClick={() => setTripId('all')}
            className={cx('press flex h-[42px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium', tripId === 'all' ? 'luminous' : 'glass-control')}
          >
            All trips <span className="num opacity-60">{data.expenses.length}</span>
          </button>
          {sorted.map((v, i) => (
            <button
              key={v.trip.id}
              type="button"
              aria-pressed={tripId === v.trip.id}
              onClick={() => setTripId(v.trip.id)}
              className={cx('press flex h-[42px] shrink-0 items-center gap-2 rounded-full pr-4 pl-1.5 text-[14px] font-medium', tripId === v.trip.id ? 'luminous' : 'glass-control')}
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
