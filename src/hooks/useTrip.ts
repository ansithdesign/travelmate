import { useMemo } from 'react'
import { useStore } from '../store/store'
import type { Expense, Payment, Trip } from '../types'
import { daysBetween, parseDate, today, tripLength } from '../utils/dates'
import { buildLedger, isSettled, suggestTransfers, type Ledger, type Transfer } from '../utils/settle'

export type TripPhase = 'upcoming' | 'ongoing' | 'ended' | 'completed'

export interface TripStatus {
  phase: TripPhase
  /** Days until start (upcoming), current day number (ongoing), or days since end */
  days: number
  length: number
}

export function tripStatus(trip: Trip): TripStatus {
  const now = today()
  const start = parseDate(trip.startDate)
  const end = parseDate(trip.endDate)
  const length = tripLength(trip.startDate, trip.endDate)
  if (trip.completed) return { phase: 'completed', days: daysBetween(end, now), length }
  if (now < start) return { phase: 'upcoming', days: daysBetween(now, start), length }
  if (now <= end) return { phase: 'ongoing', days: daysBetween(start, now) + 1, length }
  return { phase: 'ended', days: daysBetween(end, now), length }
}

export interface TripView {
  trip: Trip
  status: TripStatus
  expenses: Expense[]
  payments: Payment[]
  ledger: Ledger
  transfers: Transfer[]
  settled: boolean
}

export function computeTripView(trip: Trip, allExpenses: Expense[], allPayments: Payment[]): TripView {
  const expenses = allExpenses
    .filter((e) => e.tripId === trip.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const payments = allPayments.filter((p) => p.tripId === trip.id).sort((a, b) => b.date.localeCompare(a.date))
  const ledger = buildLedger(trip.members, expenses, payments)
  const transfers = suggestTransfers(ledger.net)
  return { trip, status: tripStatus(trip), expenses, payments, ledger, transfers, settled: isSettled(ledger.net) }
}

export function useTripView(id: string | undefined): TripView | null {
  const { data } = useStore()
  return useMemo(() => {
    const trip = data.trips.find((t) => t.id === id)
    return trip ? computeTripView(trip, data.expenses, data.payments) : null
  }, [data, id])
}

export function useAllTripViews(): TripView[] {
  const { data } = useStore()
  return useMemo(
    () => data.trips.map((t) => computeTripView(t, data.expenses, data.payments)),
    [data],
  )
}
