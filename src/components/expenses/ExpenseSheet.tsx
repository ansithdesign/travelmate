import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown, Check, CheckCircle, NotePencil, Receipt as ReceiptIcon, Scan, WarningCircle, X } from '@phosphor-icons/react'
import { CategoryIcon } from '../icons/CategoryIcon'
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
    date: !draft.date || Number.isNaN(new Date(draft.date).getTime()) ? 'Pick when it happened' : undefined,
  }
  const valid = !errors.trip && !errors.amount && !errors.title && !errors.split && !errors.date

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
        title={editing ? 'Edit expense' : 'New expense'}
        description={trip && !(!editing && data.trips.length > 1) ? trip.name : undefined}
        size="lg"
        footer={
          <div className="flex items-center gap-4">
            <SplitStatus method={draft.method} amount={amount} split={split} remaining={remaining} currency={currency} />
            <Button size="lg" className="min-w-[140px]" onClick={save} disabled={submitted && !valid}>
              {editing ? 'Save' : 'Add expense'}
            </Button>
          </div>
        }
      >
        <form
          className="flex flex-col gap-7"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          {!editing && data.trips.length > 1 ? (
            <Field label="Trip" htmlFor="exp-trip">
              <div className="relative">
                <select id="exp-trip" value={draft.tripId} onChange={(e) => changeTrip(e.target.value)} className={cx(inputClass, 'appearance-none pr-11 font-semibold')}>
                  {[...openTrips, ...data.trips.filter((t) => !openTrips.includes(t))].map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {tripStatus(t).phase === 'completed' ? ' (completed)' : ''}
                    </option>
                  ))}
                </select>
                <CaretDown size={18} weight="bold" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-3" aria-hidden />
              </div>
            </Field>
          ) : null}

          {/* Amount and title lead: the two things you always know. */}
          <div className="flex flex-col items-center gap-4">
            <label className="sr-only" htmlFor="exp-amount">
              Amount
            </label>
            <div className={cx('flex w-full items-start justify-center rounded-[28px] px-4 pt-4 pb-3 transition-shadow', submitted && errors.amount ? 'bg-loss-soft' : 'bg-well focus-within:bg-accent-soft')}>
              <span className="mt-3 mr-1 text-[28px] font-light text-ink-3">{currencySymbol(currency).trim()}</span>
  {/* Mirror sizes the field to its digits so the symbol sits right beside the number */}
              <span className="inline-grid max-w-[calc(100%-40px)]">
                <span aria-hidden className="num invisible col-start-1 row-start-1 overflow-hidden pr-1 text-[60px] leading-[68px] font-extralight tracking-[-0.05em] whitespace-pre">
                  {draft.amount || '0'}
                </span>
              <input
                  ref={amountRef}
                  id="exp-amount"
                  size={1}
                  data-autofocus
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={draft.amount}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^[\d,]*\.?\d{0,2}$/.test(v)) set('amount', v)
                  }}
                  onBlur={() => {
                    // Only fill exact amounts if none have been typed yet, never overwrite the person's numbers.
                    const typed = Object.values(draft.inputs).some((x) => (parseMoney(x) ?? 0) > 0)
                    if (draft.method === 'exact' && !typed) setDraft((d) => ({ ...d, inputs: seedInputs('exact', d.participants) }))
                  }}
                  aria-invalid={submitted && !!errors.amount}
                  className="num col-start-1 row-start-1 w-full min-w-0 bg-transparent text-left text-[60px] leading-[68px] font-extralight tracking-[-0.05em] text-ink caret-accent outline-none placeholder:text-ink/25"
                />
              </span>
            </div>
            {submitted && errors.amount ? <p className="-mt-2 text-meta text-loss">{errors.amount}</p> : null}
            <TextInput
              aria-label="What was it for"
              placeholder="What was it for? Dinner, cab, hotel"
              value={draft.title}
              invalid={submitted && !!errors.title}
              maxLength={60}
              className="text-center font-semibold"
              onChange={(e) => {
                const title = e.target.value
                setDraft((d) => ({ ...d, title, category: d.categoryTouched ? d.category : (guessCategory(title) ?? d.category) }))
              }}
            />
            {submitted && errors.title ? <p className="-mt-2 text-meta text-loss">{errors.title}</p> : null}
          </div>

          <fieldset>
            <legend className="mb-2.5 pl-1 text-meta font-medium text-ink-2">Category</legend>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-7 md:px-0">
              {CATEGORIES.map((c) => {
                const on = draft.category === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft((d) => ({ ...d, category: c.id, categoryTouched: true }))}
                    className={cx(
                      'press flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-[20px] pt-2.5 pb-2 text-caption font-semibold md:w-auto',
                      on ? 'bg-panel-strong text-ink shadow-[inset_0_0_0_2px_var(--color-accent),0_10px_22px_-12px_rgb(37_99_235/0.55)]' : 'text-ink-3 hover:bg-well',
                    )}
                  >
                    <span className={cx('transition-transform duration-500 ease-[var(--ease-glide)]', on && 'scale-110 -translate-y-0.5')}>
                      <CategoryIcon id={c.id} size={40} />
                    </span>
                    {c.short}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 pl-1 text-meta font-medium text-ink-2">Paid by</legend>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
              {members.map((m) => {
                const on = draft.paidBy === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('paidBy', m.id)}
                    className={cx(
                      'press inline-flex h-12 shrink-0 items-center gap-2 rounded-full py-1 pr-4 pl-1 text-meta font-semibold',
                      on ? 'bg-ink text-ink-inverse shadow-[0_10px_20px_-12px_rgb(var(--t-shadow)/0.7)]' : 'bg-panel-strong text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink',
                    )}
                  >
                    <Avatar person={m} size={38} />
                    {m.isYou ? 'You' : firstName(m.name)}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-2.5 flex items-baseline justify-between gap-3 pl-1">
              <legend className="text-meta font-medium text-ink-2">Split between</legend>
              <span className="text-meta text-ink-3">
                {draft.participants.length} of {members.length}
              </span>
            </div>
            <Segmented label="Split method" value={draft.method} onChange={changeMethod} options={METHODS} />
            <ul className="panel mt-3 divide-y divide-line overflow-hidden rounded-[24px]">
              {members.map((m) => {
                const on = draft.participants.includes(m.id)
                const share = split.shares[m.id] ?? 0
                return (
                  <li key={m.id} className={cx('flex min-h-[62px] items-center gap-3 px-3.5 py-2 transition-colors', !on && 'bg-well/60')}>
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
                          'flex size-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[var(--ease-glide)]',
                          on ? 'luminous scale-100' : 'scale-90 shadow-[inset_0_0_0_2px_var(--color-line-strong)]',
                        )}
                      >
                        {on ? <Check size={13} weight="bold" aria-hidden /> : null}
                      </span>
                      <Avatar person={m} size={32} className={cx(draft.method !== 'equal' && 'hidden sm:inline-flex', !on && 'opacity-50 grayscale')} />
                      <span className={cx('truncate font-semibold', !on && 'text-ink-3')}>{m.isYou ? 'You' : m.name}</span>
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
                      <span className={cx('num w-[78px] shrink-0 text-right', on ? 'font-semibold' : 'text-meta text-ink-3')}>{on ? formatMoney(share, { currency }) : 'Not in'}</span>
                    )}
                  </li>
                )
              })}
            </ul>
            {submitted && errors.split ? <p className="mt-2 pl-1 text-meta text-loss">{split.message && split.message.length > 6 ? split.message : errors.split}</p> : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="When" htmlFor="exp-date" error={submitted ? errors.date : undefined}>
              <TextInput id="exp-date" type="datetime-local" value={draft.date} invalid={submitted && !!errors.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Receipt" optional htmlFor="exp-receipt">
              {draft.receipt ? (
                <div className="flex h-[52px] items-center gap-2 rounded-[16px] bg-gain-soft pr-1 pl-4">
                  <ReceiptIcon size={20} weight="duotone" className="shrink-0 text-gain" aria-hidden />
                  <button type="button" id="exp-receipt" onClick={() => setScanOpen(true)} className="min-w-0 flex-1 truncate text-left text-body font-semibold text-ink">
                    {draft.receipt.merchant || 'Receipt attached'}
                  </button>
                  <button type="button" aria-label="Remove receipt" onClick={() => set('receipt', undefined)} className="press flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-well">
                    <X size={16} weight="bold" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="exp-receipt"
                  onClick={() => setScanOpen(true)}
                  className="press flex h-[52px] items-center gap-2.5 rounded-[16px] px-4 text-left font-semibold text-accent shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-accent)_40%,transparent)] hover:bg-accent-soft"
                >
                  <Scan size={20} weight="bold" aria-hidden />
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
            <button type="button" onClick={() => setShowNotes(true)} className="press -mt-2 inline-flex h-10 items-center gap-2 self-start rounded-full px-3 text-meta font-semibold text-accent hover:bg-accent-soft">
              <NotePencil size={17} weight="duotone" aria-hidden />
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
        className={cx(inputClass, 'num h-11 rounded-[14px] text-right text-meta font-semibold', prefix ? 'pl-7' : 'pl-3', suffix ? 'pr-7' : 'pr-3')}
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
    <p aria-live="polite" className={cx('num min-w-0 flex-1 text-meta font-semibold', tone === 'ok' ? 'text-gain' : tone === 'warn' ? 'text-sun' : 'text-ink-3')}>
      {tone === 'ok' ? <CheckCircle size={17} weight="fill" className="mr-1 -mt-0.5 inline" aria-hidden /> : tone === 'warn' ? <WarningCircle size={17} weight="fill" className="mr-1 -mt-0.5 inline" aria-hidden /> : null}
      {text}
    </p>
  )
}
