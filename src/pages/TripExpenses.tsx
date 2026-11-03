import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { TripPage, TripSubnav } from '../components/trips/TripHeader'
import { Button } from '../components/ui/Button'
import { useTripView } from '../hooks/useTrip'
import { useUI } from '../store/ui'
import { NotFound } from './NotFound'

export function TripExpenses() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  const { openExpense } = useUI()
  if (!view) return <NotFound />
  const add = (
    <Button size="sm" icon={Plus} onClick={() => openExpense({ tripId: view.trip.id })}>
      Add
    </Button>
  )
  return (
    <>
      <TripSubnav view={view} actions={<div className="pr-2">{add}</div>} />
      <TripPage>
        <h1 className="sr-only">Expenses for {view.trip.name}</h1>
        <ExpenseList
          expenses={view.expenses}
          trips={[view.trip]}
          settledTrips={new Set(view.settled && view.expenses.length ? [view.trip.id] : [])}
          emptyAction={
            <Button icon={Plus} onClick={() => openExpense({ tripId: view.trip.id })}>
              Add expense
            </Button>
          }
        />
      </TripPage>
    </>
  )
}
