import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Paperclip, ReceiptText, ScanLine, X } from 'lucide-react'
import { CATEGORIES } from '../../data/categories'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import type { CategoryId, Expense, ID, Person, Receipt, SplitMethod, Trip } from '../../types'
import { cx } from '../../utils/cx'
import { toLocalInput } from '../../utils/dates'
import { firstName, uid } from '../../utils/id'
import { currencySymbol, formatMoney, parseMoney, toInput } from '../../utils/money'
import { computeSplit, defaultValues } from '../../utils/split'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Controls'
import { Field, TextArea, TextInput, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'
import { ReceiptScanner } from '../receipts/ReceiptScanner'
import { guessCategory } from '../../utils/guessCategory'
import { tripStatus } from '../../hooks/useTrip'

interface Draft {
  tripId: ID
  title: string
  amount: string
  category: CategoryId
  categoryTouched: boolean
  paidBy: ID
  participants: ID[]
  method: SplitMethod
  /** Raw text per person so typing "12." is not lost */
  inputs: Record<ID, string>
  date: string
  notes: string
  receipt?: Receipt
}

const METHODS: { value: SplitMethod; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'exact', label: 'Amounts' },
  { value: 'percent', label: 'Percent' },
  { value: 'shares', label: 'Shares' },
]

function draftFor(trip: Trip | undefined, me: ID, expense?: Expense): Draft {
  if (expense) {
    const inputs: Record<ID, string> = {}
    for (const p of expense.split.participants) {
      const v = expense.split.values[p]
      if (v === undefined) continue
      inputs[p] = expense.split.method === 'exact' ? toInput(v) : String(v)
    }
    return {
      tripId: expense.tripId,
      title: expense.title,
      amount: toInput(expense.amount),
      category: expense.category,
      categoryTouched: true,
      paidBy: expense.paidBy,
      participants: expense.split.participants,
      method: expense.split.method,
      inputs,
      date: toLocalInput(expense.date),
      notes: expense.notes ?? '',
      receipt: expense.receipt,
    }
  }
  const members = trip?.members ?? [me]
  return {
    tripId: trip?.id ?? '',
    title: '',
    amount: '',
    category: 'food',
    categoryTouched: false,
    paidBy: members.includes(me) ? me : members[0],
    participants: members,
    method: 'equal',
    inputs: {},
    date: toLocalInput(new Date().toISOString()),
    notes: '',
  }
}

export function ExpenseSheet() {
  const { expense: state, closeExpense } = useUI()
  const { data, me, person, saveExpense } = useStore()
  const toast = useToast()

  const editing = state.expenseId ? data.expenses.find((e) => e.id === state.expenseId) : undefined
  const openTrips = useMemo(
    () => data.trips.filter((t) => tripStatus(t).phase !== 'completed').sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data.trips],
  )
  const defaultTrip = state.tripId ?? editing?.tripId ?? openTrips[0]?.id ?? data.trips[0]?.id

  const [draft, setDraft] = useState<Draft>(() => draftFor(undefined, me.id))
  const [submitted, setSubmitted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state.open) return
    const t = data.trips.find((x) => x.id === defaultTrip)
    const d = draftFor(t, me.id, editing)
    setDraft(d)
    setSubmitted(false)
    setShowNotes(!!d.notes)
    setScanOpen(!!state.scan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.expenseId, state.tripId])

  const trip = data.trips.find((t) => t.id === draft.tripId)
  const currency = trip?.currency ?? 'INR'
  const members = (trip?.members.map(person).filter(Boolean) as Person[]) ?? []
  const amount = parseMoney(draft.amount) ?? 0

  const values = useMemo(() => {
    const v: Record<ID, number> = {}
    for (const p of draft.participants) {
      const raw = draft.inputs[p]
      if (raw === undefined || raw === '') {
        v[p] = 0
        continue
      }
      v[p] = draft.method === 'exact' ? (parseMoney(raw) ?? 0) : Number(raw) || 0
    }
    return v
  }, [draft.inputs, draft.participants, draft.method])

  const split = useMemo(
    () => computeSplit(amount, { method: draft.method, participants: draft.participants, values }),
    [amount, draft.method, draft.participants, values],
  )

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  function seedInputs(method: SplitMethod, participants: ID[]) {
    const seeded = defaultValues(method, amount, participants)
    const inputs: Record<ID, string> = {}
    for (const [k, v] of Object.entries(seeded)) inputs[k] = method === 'exact' ? toInput(v) : String(v)
    return inputs
  }

  function changeMethod(m: SplitMethod) {
    setDraft((d) => ({ ...d, method: m, inputs: seedInputs(m, d.participants) }))
  }

  function toggleParticipant(id: ID) {
    setDraft((d) => {
      const on = d.participants.includes(id)
      const participants = on ? d.participants.filter((p) => p !== id) : members.map((m) => m.id).filter((m) => m === id || d.participants.includes(m))
      return { ...d, participants, inputs: d.method === 'equal' ? d.inputs : seedInputs(d.method, participants) }
    })
  }

  function changeTrip(id: ID) {
    const t = data.trips.find((x) => x.id === id)
    setDraft((d) => ({ ...draftFor(t, me.id), title: d.title, amount: d.amount, category: d.category, categoryTouched: d.categoryTouched, date: d.date, notes: d.notes, receipt: d.receipt }))
  }

  const errors = {
    trip: !trip ? 'Choose a trip' : undefined,
    amount: amount <= 0 ? 'Enter how much it cost' : undefined,
    title: !draft.title.trim() ? 'Give it a short name' : undefined,
    split: !split.valid ? 'The split does not add up yet' : undefined,
  }
  const valid = !errors.trip && !errors.amount && !errors.title && !errors.split

  function save() {
    setSubmitted(true)
    if (!valid || !trip) {
      if (errors.amount) amountRef.current?.focus()
      return
    }
    const now = new Date().toISOString()
    const expense: Expense = {
      id: editing?.id ?? uid('e-'),
      tripId: trip.id,
      title: draft.title.trim(),
      amount,
      category: draft.category,
      paidBy: draft.paidBy,
      date: new Date(draft.date).toISOString(),
      split: { method: draft.method, participants: draft.participants, values: draft.method === 'equal' ? {} : values },
      notes: draft.notes.trim() || undefined,
      receipt: draft.receipt,
      createdAt: editing?.createdAt ?? now,
    }
    saveExpense(expense)
    closeExpense()
    toast.success(editing ? 'Expense updated' : `${expense.title} added to ${trip.name}`)
  }

  const remaining = draft.method === 'percent' ? 100 - split.assigned : amount - split.assigned

  return (
    <>
      <Sheet
        open={state.open}
        onClose={closeExpense}
        title={editing ? 'Edit expense' : 'Add expense'}
        size="lg"
        footer={
          <div className="flex items-center gap-4">
            <SplitStatus method={draft.method} amount={amount} split={split} remaining={remaining} currency={currency} />
            <Button size="lg" className="min-w-[132px]" onClick={save} disabled={submitted && !valid}>
              {editing ? 'Save' : 'Add expense'}
            </Button>
          </div>
        }
      >
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          {!editing && data.trips.length > 1 ? (
            <Field label="Trip" htmlFor="exp-trip">
              <div className="relative">
                <select id="exp-trip" value={draft.tripId} onChange={(e) => changeTrip(e.target.value)} className={cx(inputClass, 'appearance-none pr-10')}>
                  {[...openTrips, ...data.trips.filter((t) => !openTrips.includes(t))].map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {tripStatus(t).phase === 'completed' ? ' (completed)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-3" aria-hidden />
              </div>
            </Field>
          ) : null}

          {/* Amount and title lead: the two things you always know. */}
          <div className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="exp-amount">
              Amount
            </label>
            <div
              className={cx(
                'flex items-baseline gap-2 border-b-2 pb-2 transition-colors',
                submitted && errors.amount ? 'border-brick' : 'border-line focus-within:border-forest',
              )}
            >
              <span className="text-[28px] font-medium tracking-[-0.02em] text-ink-3">{currencySymbol(currency).trim()}</span>
              <input
                ref={amountRef}
                id="exp-amount"
                data-autofocus
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={draft.amount}
                onChange={(e) => {
                  const v = e.target.value
                  if (/^[\d,]*\.?\d{0,2}$/.test(v)) {
                    set('amount', v)
                  }
                }}
                onBlur={() => {
                  // Only fill exact amounts if none have been typed yet, never overwrite the person's numbers.
                  const typed = Object.values(draft.inputs).some((x) => (parseMoney(x) ?? 0) > 0)
                  if (draft.method === 'exact' && !typed) setDraft((d) => ({ ...d, inputs: seedInputs('exact', d.participants) }))
                }}
                aria-invalid={submitted && !!errors.amount}
                className="num w-full min-w-0 bg-transparent text-[44px] leading-[52px] font-semibold tracking-[-0.035em] outline-none placeholder:text-line"
                style={{ boxShadow: 'none' }}
              />
            </div>
            {submitted && errors.amount ? <p className="text-meta text-brick">{errors.amount}</p> : null}
            <TextInput
              aria-label="What was it for"
              placeholder="What was it for? Dinner, cab, hotel"
              value={draft.title}
              invalid={submitted && !!errors.title}
              maxLength={60}
              onChange={(e) => {
                const title = e.target.value
                setDraft((d) => ({ ...d, title, category: d.categoryTouched ? d.category : (guessCategory(title) ?? d.category) }))
              }}
            />
            {submitted && errors.title ? <p className="-mt-1 text-meta text-brick">{errors.title}</p> : null}
          </div>

          <fieldset>
            <legend className="mb-2 text-meta font-medium text-ink-2">Category</legend>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-6 md:px-6">
              {CATEGORIES.map((c) => {
                const on = draft.category === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft((d) => ({ ...d, category: c.id, categoryTouched: true }))}
                    className={cx(
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-meta font-medium transition-colors',
                      on ? 'bg-forest text-white' : 'bg-surface text-ink-2 hairline hover:text-ink',
                    )}
                  >
                    <c.icon size={16} strokeWidth={1.9} aria-hidden />
                    {c.short}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-meta font-medium text-ink-2">Paid by</legend>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-6 md:px-6">
              {members.map((m) => {
                const on = draft.paidBy === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('paidBy', m.id)}
                    className={cx(
                      'inline-flex h-11 shrink-0 items-center gap-2 rounded-full py-1 pr-4 pl-1 text-meta font-medium transition-colors',
                      on ? 'bg-ink text-white' : 'bg-surface text-ink-2 hairline hover:text-ink',
                    )}
                  >
                    <Avatar person={m} size={32} />
                    {m.isYou ? 'You' : firstName(m.name)}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <legend className="text-meta font-medium text-ink-2">Split</legend>
              <span className="text-meta text-ink-3">
                {draft.participants.length} of {members.length} people
              </span>
            </div>
            <Segmented label="Split method" value={draft.method} onChange={changeMethod} options={METHODS} />
            <ul className="mt-2 divide-y divide-line-soft">
              {members.map((m) => {
                const on = draft.participants.includes(m.id)
                const share = split.shares[m.id] ?? 0
                return (
                  <li key={m.id} className="flex min-h-[60px] items-center gap-3 py-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`Include ${m.name}`}
                      onClick={() => toggleParticipant(m.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={cx(
                          'flex size-[22px] shrink-0 items-center justify-center rounded-[7px] transition-colors',
                          on ? 'bg-forest text-white' : 'bg-surface shadow-[inset_0_0_0_1.5px_var(--color-line)]',
                        )}
                      >
                        {on ? <Check size={14} strokeWidth={3} aria-hidden /> : null}
                      </span>
                      <Avatar person={m} size={32} className={draft.method !== 'equal' ? 'hidden sm:inline-flex' : undefined} />
                      <span className={cx('truncate font-medium', !on && 'text-ink-3')}>{m.isYou ? 'You' : m.name}</span>
                    </button>
                    {on && draft.method !== 'equal' ? (
                      <ShareInput
                        method={draft.method}
                        value={draft.inputs[m.id] ?? ''}
                        currency={currency}
                        name={m.name}
                        onChange={(v) => setDraft((d) => ({ ...d, inputs: { ...d.inputs, [m.id]: v } }))}
                      />
                    ) : null}
                    {on && draft.method === 'exact' ? null : (
                      <span className={cx('num w-[76px] shrink-0 text-right', on ? 'font-medium' : 'text-ink-3')}>
                        {on ? formatMoney(share, { currency }) : 'Not in'}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
            {submitted && errors.split ? <p className="mt-1 text-meta text-brick">{split.message && split.message.length > 6 ? split.message : errors.split}</p> : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="When" htmlFor="exp-date">
              <TextInput id="exp-date" type="datetime-local" value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Receipt" optional htmlFor="exp-receipt">
              {draft.receipt ? (
                <div className="flex h-12 items-center gap-2 rounded-md bg-forest-50 pr-1 pl-3.5">
                  <ReceiptText size={18} className="shrink-0 text-forest" aria-hidden />
                  <button type="button" id="exp-receipt" onClick={() => setScanOpen(true)} className="min-w-0 flex-1 truncate text-left text-body font-medium text-forest-900">
                    {draft.receipt.merchant || 'Receipt attached'}
                  </button>
                  <button type="button" aria-label="Remove receipt" onClick={() => set('receipt', undefined)} className="flex size-10 items-center justify-center rounded-full text-forest-900 hover:bg-forest-100">
                    <X size={17} aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="exp-receipt"
                  onClick={() => setScanOpen(true)}
                  className="flex h-12 items-center gap-2.5 rounded-md bg-surface px-3.5 text-left text-ink-2 hairline hover:bg-ground hover:text-ink"
                >
                  <ScanLine size={18} aria-hidden />
                  Scan or attach
                </button>
              )}
            </Field>
          </div>

          {showNotes ? (
            <Field label="Note" htmlFor="exp-notes">
              <TextArea id="exp-notes" rows={2} placeholder="Anything the group should know" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
            </Field>
          ) : (
            <button type="button" onClick={() => setShowNotes(true)} className="-mt-2 inline-flex h-10 items-center gap-2 self-start rounded-md px-1 text-meta font-medium text-forest hover:underline">
              <Paperclip size={15} aria-hidden />
              Add a note
            </button>
          )}
          <button type="submit" hidden />
        </form>
      </Sheet>

      <ReceiptScanner
        open={scanOpen && state.open}
        onClose={() => setScanOpen(false)}
        initial={draft.receipt}
        currency={currency}
        onUse={(r) => {
          setDraft((d) => ({
            ...d,
            receipt: r,
            title: d.title || r.merchant,
            amount: d.amount || (r.total ? toInput(r.total) : ''),
            category: d.categoryTouched ? d.category : (guessCategory(r.merchant) ?? d.category),
          }))
          setScanOpen(false)
        }}
      />
    </>
  )
}

function ShareInput({ method, value, onChange, currency, name }: { method: SplitMethod; value: string; onChange: (v: string) => void; currency: Trip['currency']; name: string }) {
  const suffix = method === 'percent' ? '%' : method === 'shares' ? '×' : ''
  const prefix = method === 'exact' ? currencySymbol(currency).trim() : ''
  return (
    <div className="relative w-[96px] shrink-0">
      {prefix ? <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-meta text-ink-3">{prefix}</span> : null}
      <input
        inputMode="decimal"
        aria-label={method === 'exact' ? `${name}'s amount` : method === 'percent' ? `${name}'s percentage` : `${name}'s shares`}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          const ok = method === 'shares' ? /^\d{0,3}(\.\d{0,1})?$/.test(v) : /^[\d,]*\.?\d{0,2}$/.test(v)
          if (ok) onChange(v)
        }}
        className={cx(inputClass, 'num h-10 text-right text-meta', prefix ? 'pl-6' : 'pl-2.5', suffix ? 'pr-7' : 'pr-2.5')}
      />
      {suffix ? <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-meta text-ink-3">{suffix}</span> : null}
    </div>
  )
}

/** Live ledger: tells you whether the split adds up before you save. */
function SplitStatus({
  method,
  amount,
  split,
  remaining,
  currency,
}: {
  method: SplitMethod
  amount: number
  split: ReturnType<typeof computeSplit>
  remaining: number
  currency: Trip['currency']
}) {
  let text: string
  let tone: 'ok' | 'warn' | 'muted' = 'muted'
  if (amount <= 0) {
    text = 'Enter an amount to split'
  } else if (Object.keys(split.shares).length === 0) {
    text = 'Choose who shared it'
  } else if (method === 'equal') {
    const n = Object.keys(split.shares).length
    text = n === 0 ? 'Choose who shared it' : `${formatMoney(Math.round(amount / n), { currency })} each, ${n} ${n === 1 ? 'person' : 'people'}`
    tone = n === 0 ? 'warn' : 'ok'
  } else if (method === 'shares') {
    text = split.valid ? `${split.assigned} shares in total` : 'Give at least one share'
    tone = split.valid ? 'ok' : 'warn'
  } else if (split.valid) {
    text = method === 'percent' ? '100% assigned' : `${formatMoney(amount, { currency })} assigned`
    tone = 'ok'
  } else if (method === 'percent') {
    const r = Math.round(remaining * 100) / 100
    text = r > 0 ? `${r}% left to assign` : `${-r}% over`
    tone = 'warn'
  } else {
    text = remaining > 0 ? `${formatMoney(remaining, { currency })} left to assign` : `${formatMoney(-remaining, { currency })} over the total`
    tone = 'warn'
  }
  return (
    <p aria-live="polite" className={cx('num min-w-0 flex-1 text-meta font-medium', tone === 'ok' ? 'text-forest' : tone === 'warn' ? 'text-amber-ink' : 'text-ink-3')}>
      {tone === 'ok' ? <Check size={15} strokeWidth={2.4} className="mr-1 -mt-0.5 inline" aria-hidden /> : null}
      {text}
    </p>
  )
}
