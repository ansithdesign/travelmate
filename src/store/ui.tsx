import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ID } from '../types'

export interface ExpenseSheetState {
  open: boolean
  tripId?: ID
  expenseId?: ID
  /** Open straight into the receipt scanner */
  scan?: boolean
}

interface UIState {
  expense: ExpenseSheetState
  trip: { open: boolean; tripId?: ID }
  openExpense: (o?: { tripId?: ID; expenseId?: ID; scan?: boolean }) => void
  closeExpense: () => void
  openTrip: (tripId?: ID) => void
  closeTrip: () => void
}

const UIContext = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [expense, setExpense] = useState<ExpenseSheetState>({ open: false })
  const [trip, setTrip] = useState<{ open: boolean; tripId?: ID }>({ open: false })

  const openExpense = useCallback((o: { tripId?: ID; expenseId?: ID; scan?: boolean } = {}) => setExpense({ open: true, ...o }), [])
  const closeExpense = useCallback(() => setExpense((s) => ({ ...s, open: false })), [])
  const openTrip = useCallback((tripId?: ID) => setTrip({ open: true, tripId }), [])
  const closeTrip = useCallback(() => setTrip((s) => ({ ...s, open: false })), [])

  const value = useMemo(
    () => ({ expense, trip, openExpense, closeExpense, openTrip, closeTrip }),
    [expense, trip, openExpense, closeExpense, openTrip, closeTrip],
  )
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIState {
  const ui = useContext(UIContext)
  if (!ui) throw new Error('useUI outside UIProvider')
  return ui
}
