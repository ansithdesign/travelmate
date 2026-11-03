import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { AppData, Expense, ID, Invite, Payment, Person, Trip } from '../types'
import { createSeed } from '../data/seed'
import { localRepository, type Repository } from '../services/storage'
import { uid } from '../utils/id'

type Action =
  | { type: 'replace'; data: AppData }
  | { type: 'trip/upsert'; trip: Trip }
  | { type: 'trip/delete'; id: ID }
  | { type: 'expense/upsert'; expense: Expense }
  | { type: 'expense/delete'; id: ID }
  | { type: 'person/upsert'; person: Person }
  | { type: 'payment/add'; payment: Payment }
  | { type: 'payment/delete'; id: ID }

function upsert<T extends { id: ID }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id)
  if (i === -1) return [...list, item]
  const next = list.slice()
  next[i] = item
  return next
}

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'replace':
      return action.data
    case 'trip/upsert':
      return { ...state, trips: upsert(state.trips, action.trip) }
    case 'trip/delete':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.id),
        expenses: state.expenses.filter((e) => e.tripId !== action.id),
        payments: state.payments.filter((p) => p.tripId !== action.id),
      }
    case 'expense/upsert':
      return { ...state, expenses: upsert(state.expenses, action.expense) }
    case 'expense/delete':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }
    case 'person/upsert':
      return { ...state, people: upsert(state.people, action.person) }
    case 'payment/add':
      return { ...state, payments: [...state.payments, action.payment] }
    case 'payment/delete':
      return { ...state, payments: state.payments.filter((p) => p.id !== action.id) }
  }
}

interface Store {
  data: AppData
  me: Person
  person: (id: ID) => Person | undefined
  saveTrip: (trip: Trip) => void
  deleteTrip: (id: ID) => void
  saveExpense: (expense: Expense) => void
  deleteExpense: (id: ID) => Expense | undefined
  restoreExpense: (expense: Expense) => void
  addMember: (tripId: ID, name: string, email?: string) => Person
  /** Put someone who is already known from another trip onto this trip. */
  addExistingMember: (tripId: ID, personId: ID) => void
  removeMember: (tripId: ID, personId: ID) => { ok: boolean; reason?: string }
  addInvite: (tripId: ID, name: string, contact?: string) => void
  revokeInvite: (tripId: ID, inviteId: ID) => void
  acceptInvite: (tripId: ID, inviteId: ID) => void
  recordPayment: (payment: Omit<Payment, 'id'>) => Payment
  deletePayment: (id: ID) => void
  updateMe: (patch: Partial<Person>) => void
  resetDemo: () => void
  clearAll: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({
  children,
  repository = localRepository,
  onSaveError,
}: {
  children: ReactNode
  repository?: Repository
  onSaveError?: (message: string) => void
}) {
  const [data, dispatch] = useReducer(reducer, undefined, () => repository.load() ?? createSeed())
  // Persists on every change, including the seed on first run so ids stay stable across refreshes.
  useEffect(() => {
    try {
      repository.save(data)
    } catch (e) {
      onSaveError?.((e as Error).message)
    }
  }, [data, repository, onSaveError])

  const trip = useCallback((id: ID) => data.trips.find((t) => t.id === id), [data.trips])
  const person = useCallback((id: ID) => data.people.find((p) => p.id === id), [data.people])
  const me = data.people.find((p) => p.isYou) ?? data.people[0]

  const patchTrip = useCallback(
    (id: ID, fn: (t: Trip) => Trip) => {
      const t = trip(id)
      if (t) dispatch({ type: 'trip/upsert', trip: fn(t) })
    },
    [trip],
  )

  const store = useMemo<Store>(
    () => ({
      data,
      me,
      person,
      saveTrip: (t) => dispatch({ type: 'trip/upsert', trip: t }),
      deleteTrip: (id) => dispatch({ type: 'trip/delete', id }),
      saveExpense: (e) => dispatch({ type: 'expense/upsert', expense: e }),
      deleteExpense: (id) => {
        const e = data.expenses.find((x) => x.id === id)
        dispatch({ type: 'expense/delete', id })
        return e
      },
      restoreExpense: (e) => dispatch({ type: 'expense/upsert', expense: e }),
      addMember: (tripId, name, email) => {
        const p: Person = { id: uid('p-'), name: name.trim(), email: email?.trim() || undefined }
        dispatch({ type: 'person/upsert', person: p })
        patchTrip(tripId, (t) => ({ ...t, members: [...t.members, p.id] }))
        return p
      },
      addExistingMember: (tripId, personId) => patchTrip(tripId, (t) => (t.members.includes(personId) ? t : { ...t, members: [...t.members, personId] })),
      removeMember: (tripId, personId) => {
        const involved = data.expenses.some(
          (e) => e.tripId === tripId && (e.paidBy === personId || e.split.participants.includes(personId)),
        )
        if (involved) {
          return { ok: false, reason: 'They are part of expenses on this trip. Edit or delete those expenses first.' }
        }
        patchTrip(tripId, (t) => ({ ...t, members: t.members.filter((m) => m !== personId) }))
        return { ok: true }
      },
      addInvite: (tripId, name, contact) => {
        const inv: Invite = { id: uid('inv-'), name: name.trim(), contact: contact?.trim() || undefined, createdAt: new Date().toISOString() }
        patchTrip(tripId, (t) => ({ ...t, invites: [...t.invites, inv] }))
      },
      revokeInvite: (tripId, inviteId) => patchTrip(tripId, (t) => ({ ...t, invites: t.invites.filter((i) => i.id !== inviteId) })),
      acceptInvite: (tripId, inviteId) => {
        const t = trip(tripId)
        const inv = t?.invites.find((i) => i.id === inviteId)
        if (!t || !inv) return
        const existing = data.people.find((p) => p.name.toLowerCase() === inv.name.toLowerCase())
        const p: Person = existing ?? { id: uid('p-'), name: inv.name, email: inv.contact?.includes('@') ? inv.contact : undefined }
        if (!existing) dispatch({ type: 'person/upsert', person: p })
        dispatch({
          type: 'trip/upsert',
          trip: { ...t, invites: t.invites.filter((i) => i.id !== inviteId), members: t.members.includes(p.id) ? t.members : [...t.members, p.id] },
        })
      },
      recordPayment: (payment) => {
        const p: Payment = { ...payment, id: uid('pay-') }
        dispatch({ type: 'payment/add', payment: p })
        return p
      },
      deletePayment: (id) => dispatch({ type: 'payment/delete', id }),
      updateMe: (patch) => dispatch({ type: 'person/upsert', person: { ...me, ...patch } }),
      resetDemo: () => dispatch({ type: 'replace', data: createSeed() }),
      clearAll: () =>
        dispatch({
          type: 'replace',
          data: { version: 1, people: [{ ...me }], trips: [], expenses: [], payments: [] },
        }),
    }),
    [data, me, person, patchTrip, trip],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}
