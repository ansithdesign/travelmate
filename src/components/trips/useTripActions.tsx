import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import type { TripView } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import type { MenuItem } from '../ui/Menu'
import { ConfirmDialog } from '../ui/Sheet'
import { useToast } from '../ui/Toast'

/** Edit, complete/reopen and delete for a trip, with their confirmations. */
export function useTripActions(view: TripView) {
  const { saveTrip, deleteTrip } = useStore()
  const { openTrip } = useUI()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<null | 'delete' | 'complete'>(null)
  const { trip, status, settled, expenses } = view

  const items: MenuItem[] = [
    { label: 'Edit trip', icon: Pencil, onSelect: () => openTrip(trip.id) },
    status.phase === 'completed'
      ? {
          label: 'Reopen trip',
          icon: RotateCcw,
          onSelect: () => {
            saveTrip({ ...trip, completed: false, completedAt: undefined })
            toast.success('Trip reopened')
          },
        }
      : { label: 'Mark as completed', icon: CircleCheck, onSelect: () => setConfirm('complete') },
    { label: 'Delete trip', icon: Trash2, danger: true, onSelect: () => setConfirm('delete') },
  ]

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirm === 'complete'}
        onClose={() => setConfirm(null)}
        tone="primary"
        title="Mark this trip as completed?"
        body={
          settled
            ? 'It moves to past trips and opens as a journal page. You can still add expenses or reopen it.'
            : 'It moves to past trips and opens as a journal page. Balances are not settled yet; you can still settle up afterwards.'
        }
        confirmLabel="Mark completed"
        onConfirm={() => {
          saveTrip({ ...trip, completed: true, completedAt: new Date().toISOString() })
          toast.success(`${trip.name} is in your journal`)
          navigate(`/trips/${trip.id}/journal`)
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        title={`Delete ${trip.name}?`}
        body={`This removes the trip, its ${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'} and payment history for everyone. This cannot be undone.`}
        confirmLabel="Delete trip"
        onConfirm={() => {
          deleteTrip(trip.id)
          toast.success('Trip deleted')
          navigate('/')
        }}
      />
    </>
  )
  return { items, dialogs }
}
