import { useParams } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { TripSkyHeader } from '../components/trips/TripHeader'
import { ContentSheet, SheetBody } from '../components/shared/Page'
import { Button } from '../components/ui/Button'
import { useTripView } from '../hooks/useTrip'
import { useUI } from '../store/ui'
import { NotFound } from './NotFound'

export function TripExpenses() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  const { openExpense } = useUI()
  if (!view) return <NotFound />
  return (
    <>
      <TripSkyHeader
        view={view}
        title="Expenses"
        actions={
          <Button size="sm" variant="white" icon={Plus} onClick={() => openExpense({ tripId: view.trip.id })}>
            Add
          </Button>
        }
      />
      <ContentSheet>
        <SheetBody className="lg:max-w-[820px]">
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
        </SheetBody>
      </ContentSheet>
    </>
  )
}
