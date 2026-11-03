import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Controls'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { formatMoney } from '../utils/money'
import { cx } from '../utils/cx'

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
    <div className="mx-auto w-full max-w-[760px] px-4 pt-6 pb-12 sm:px-6 lg:px-8 lg:pt-10">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-display">Expenses</h1>
        <Button icon={Plus} size="sm" onClick={() => openExpense({ tripId: tripId === 'all' ? undefined : tripId })} disabled={data.trips.length === 0}>
          Add
        </Button>
      </header>
      <p className="mt-2 text-body text-ink-2">
        {owedToMe === 0 && iOwe === 0 ? (
          'You are settled on every trip.'
        ) : (
          <>
            {owedToMe > 0 ? (
              <>
                You are owed <span className="num font-medium text-forest">{formatMoney(owedToMe)}</span>
              </>
            ) : null}
            {owedToMe > 0 && iOwe > 0 ? ' and you ' : iOwe > 0 ? 'You ' : ''}
            {iOwe > 0 ? (
              <>
                owe <span className="num font-medium text-brick">{formatMoney(iOwe)}</span>
              </>
            ) : null}
            {tripId === 'all' ? ' across your trips.' : ' on this trip.'}
          </>
        )}
      </p>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Trip">
        <Chip active={tripId === 'all'} onClick={() => setTripId('all')} count={data.expenses.length}>
          All trips
        </Chip>
        {sorted.map((v) => (
          <Chip key={v.trip.id} active={tripId === v.trip.id} onClick={() => setTripId(v.trip.id)} count={v.expenses.length}>
            {v.trip.name}
          </Chip>
        ))}
      </div>

      <div className={cx('mt-5', tripId !== 'all' && 'mt-5')}>
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
      </div>
    </div>
  )
}
