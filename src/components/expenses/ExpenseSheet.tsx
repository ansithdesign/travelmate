import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown, CheckCircle, Tag, WarningCircle } from '@phosphor-icons/react'
import { CategoryIcon } from '../icons/CategoryIcon'
import { categoryById } from '../../data/categories'
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
import { TextInput } from '../ui/Field'
import { FullScreen } from '../ui/FullScreen'
import { useToast } from '../ui/Toast'
import { ReceiptScanner } from '../receipts/ReceiptScanner'
import { guessCategory } from '../../utils/guessCategory'
import { tripStatus } from '../../hooks/useTrip'
import { AddPersonRow, CategorySheet, DateSheet, NoteSheet, PayerSheet, SplitSheet, TripSheet } from './ExpenseSubSheets'

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
      amount: groupDigits(toInput(expense.amount)),
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
    category: 'other',
    categoryTouched: false,
    paidBy: members.includes(me) ? me : members[0],
    participants: members,
    method: 'equal',
    inputs: {},
    date: toLocalInput(new Date().toISOString()),
    notes: '',
  }
}

/** The category a title points to. Anything typed that matches nothing is filed under Other. */
function autoCategory(title: string): CategoryId | undefined {
  return guessCategory(title) ?? (title.trim().length >= 3 ? 'other' : undefined)
}

const dateLabel = (local: string) => {
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return 'Pick a date'
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const n = new Date()
  const diff = Math.round((a - new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (diff === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
}

/** 12000 becomes 12,000 as you type (Indian grouping), decimals untouched */
function groupDigits(v: string) {
  const raw = v.replace(/,/g, '')
  if (!raw) return ''
  const [int, dec] = raw.split('.')
  const grouped = int ? Number(int).toLocaleString('en-IN') : '0'
  return dec === undefined ? grouped : `${grouped}.${dec}`
}

type Panel = null | 'category' | 'date' | 'note' | 'split' | 'payer' | 'trip'

export function ExpenseSheet() {
  const { expense: state, closeExpense } = useUI()
  const { data, me, person, saveExpense, addMember, addExistingMember } = useStore()
  const toast = useToast()

  const editing = state.expenseId ? data.expenses.find((e) => e.id === state.expenseId) : undefined
  const openTrips = useMemo(
    () => data.trips.filter((t) => tripStatus(t).phase !== 'completed').sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data.trips],
  )
  const defaultTrip = state.tripId ?? editing?.tripId ?? openTrips[0]?.id ?? data.trips[0]?.id

  const [draft, setDraft] = useState<Draft>(() => draftFor(undefined, me.id))
  const [submitted, setSubmitted] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state.open) return
    const t = data.trips.find((x) => x.id === defaultTrip)
    const d = draftFor(t, me.id, editing)
    if (state.category && !editing) {
      d.category = state.category
      d.categoryTouched = true
    }
    setDraft(d)
    setSubmitted(false)
    setPanel(null)
    setAddOpen(false)
    setNewName('')
    setScanOpen(!!state.scan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.expenseId, state.tripId, state.category])

  const trip = data.trips.find((t) => t.id === draft.tripId)
  const currency = trip?.currency ?? 'INR'
  const members = (trip?.members.map(person).filter(Boolean) as Person[]) ?? []
  const amount = parseMoney(draft.amount) ?? 0
  const payer = members.find((m) => m.id === draft.paidBy)

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

  function seedInputs(method: SplitMethod, participants: ID[], amt = amount) {
    const seeded = defaultValues(method, amt, participants)
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

  function selectAll(all: boolean) {
    setDraft((d) => {
      const participants = all ? members.map((m) => m.id) : []
      return { ...d, participants, inputs: d.method === 'equal' ? d.inputs : seedInputs(d.method, participants) }
    })
  }

  /** A person joined the trip from this form: include them in the split, and make them the payer when added from Paid by. */
  function joined(id: ID, asPayer: boolean) {
    setDraft((d) => {
      const participants = d.participants.includes(id) ? d.participants : [...d.participants, id]
      return { ...d, participants, paidBy: asPayer ? id : d.paidBy, inputs: d.method === 'equal' ? d.inputs : seedInputs(d.method, participants) }
    })
    setAddOpen(false)
    setNewName('')
  }
  function addNew(asPayer: boolean) {
    const n = newName.trim()
    if (!n || !trip) return
    if (members.some((m) => m.name.toLowerCase() === n.toLowerCase())) {
      toast.error(`${n} is already on this trip`)
      return
    }
    joined(addMember(trip.id, n).id, asPayer)
  }
  const known = data.people.filter((p) => !(trip?.members ?? []).includes(p.id))
  const addPerson = (asPayer: boolean) => (
    <AddPersonRow open={addOpen} onToggle={() => setAddOpen((o) => !o)}>
      <AddPersonPanel known={known} newName={newName} setNewName={setNewName} onPick={(p) => { if (trip) { addExistingMember(trip.id, p.id); joined(p.id, asPayer) } }} onAdd={() => addNew(asPayer)} />
    </AddPersonRow>
  )

  function changeTrip(id: ID) {
    const t = data.trips.find((x) => x.id === id)
    setDraft((d) => ({ ...draftFor(t, me.id), title: d.title, amount: d.amount, category: d.category, categoryTouched: d.categoryTouched, date: d.date, notes: d.notes, receipt: d.receipt }))
  }

  const shownCategory: CategoryId | undefined = draft.categoryTouched ? draft.category : autoCategory(draft.title)

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
      if (errors.split) setPanel('split')
      return
    }
    const now = new Date().toISOString()
    const expense: Expense = {
      id: editing?.id ?? uid('e-'),
      tripId: trip.id,
      title: draft.title.trim(),
      amount,
      category: shownCategory ?? 'other',
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
  const n = draft.participants.length
  const methodWord = { equal: 'equally', exact: 'by amounts', percent: 'by percent', shares: 'by shares' }[draft.method]
  const tripChoices = [...openTrips, ...data.trips.filter((t) => !openTrips.includes(t))]
  const noteState = draft.notes.trim() && draft.receipt ? 'Note and receipt added' : draft.notes.trim() ? 'Note added' : draft.receipt ? 'Receipt added' : 'Add note or receipt'

  let summary: React.ReactNode
  if (amount <= 0) summary = <span className="text-ink-3">Add an amount</span>
  else if (n === 0) summary = <span className="text-loss">No one selected</span>
  else if (!split.valid && draft.method !== 'equal') {
    const r = Math.round(remaining * 100) / 100
    summary = <span className="text-loss">{draft.method === 'percent' ? `${Math.abs(r)}%` : formatMoney(Math.abs(r), { currency })}{r > 0 ? ' left' : ' over'}</span>
  } else {
    summary = (
      <>
        <span className="font-semibold">{draft.method === 'equal' ? `${formatMoney(Math.round(amount / n), { currency })} each` : 'Custom split'}</span>
        <span className="font-medium text-ink-3"> · {n === members.length ? `${n} people` : `${n} of ${members.length}`}</span>
      </>
    )
  }

  return (
    <>
      <FullScreen
        open={state.open}
        onClose={closeExpense}
        title={editing ? 'Edit expense' : 'New expense'}
        wash
        subtitle={
          trip && !editing && data.trips.length > 1 ? (
            <button type="button" onClick={() => setPanel('trip')} className="press inline-flex items-center gap-1 rounded-full px-1 text-[12.5px] font-medium text-ink-3">
              {trip.name}
              <CaretDown size={12} weight="bold" aria-hidden />
            </button>
          ) : (
            trip?.name
          )
        }
        footer={
          <div>
            <button type="button" onClick={() => setPanel('split')} aria-label="Paid by and split, edit" className="press mb-3.5 flex w-full items-center gap-4 rounded-[24px] bg-panel-strong px-[18px] py-5 text-left shadow-[inset_0_0_0_1px_var(--line)]">
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[12.5px] leading-none text-ink-3">Paid by</span>
                <span className="truncate text-[15.5px] leading-tight font-semibold">{payer ? (payer.isYou ? 'You' : firstName(payer.name)) : 'Choose'}</span>
              </span>
              <span aria-hidden className="h-10 w-px shrink-0 bg-line" />
              <span className="num flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-[12.5px] leading-none text-ink-3">Split {methodWord}</span>
                <span className="truncate text-[15.5px] leading-tight">{summary}</span>
              </span>
              <span aria-hidden className="text-faint">›</span>
            </button>
            <Button size="lg" block onClick={save} disabled={submitted && !valid}>
              {editing ? 'Save' : amount > 0 ? <span><span className="font-semibold">Add </span><span className="font-extrabold">{formatMoney(amount, { currency })}</span></span> : 'Add expense'}
            </Button>
          </div>
        }
      >
        <form
          className="relative pt-10 pb-6"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="relative flex flex-col items-center">
            <label className="sr-only" htmlFor="exp-amount">
              Amount
            </label>
            <div className="flex items-start justify-center">
              <span className="mt-[7px] mr-0.5 text-[20px] font-semibold text-ink-3">{currencySymbol(currency).trim()}</span>
              {/* Mirror sizes the field to its digits so the symbol sits right beside the number */}
              <span className="inline-grid max-w-[260px]">
                <span aria-hidden className="num invisible col-start-1 row-start-1 overflow-hidden text-[44px] leading-[52px] font-[640] tracking-[-0.045em] whitespace-pre">
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
                    if (/^[\d,]*\.?\d{0,2}$/.test(v)) set('amount', groupDigits(v))
                  }}
                  onBlur={() => {
                    // Only fill exact amounts if none have been typed yet, never overwrite the person's numbers.
                    const typed = Object.values(draft.inputs).some((x) => (parseMoney(x) ?? 0) > 0)
                    if (draft.method === 'exact' && !typed) setDraft((d) => ({ ...d, inputs: seedInputs('exact', d.participants) }))
                  }}
                  aria-invalid={submitted && !!errors.amount}
                  className="num col-start-1 row-start-1 w-full min-w-0 bg-transparent text-left text-[44px] leading-[52px] font-[640] tracking-[-0.045em] text-ink caret-accent outline-none placeholder:text-faint"
                />
              </span>
            </div>
            {submitted && errors.amount ? <p className="mt-1 text-meta text-loss">{errors.amount}</p> : null}
          </div>

          <div className="relative mt-7">
            <div className="panel-strong rounded-[24px] transition-shadow focus-within:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_45%,transparent),0_0_0_5px_var(--accent-soft)]">
              <div className="relative flex min-h-[64px] items-center">
                <button
                  type="button"
                  onClick={() => setPanel('category')}
                  aria-label={shownCategory ? `Category ${categoryById[shownCategory].short}. Change` : 'Choose a category'}
                  className="press absolute top-1/2 left-2.5 flex size-[46px] -translate-y-1/2 items-center justify-center rounded-[16px] bg-well"
                >
                  {shownCategory ? <CategoryIcon id={shownCategory} size={30} /> : <Tag size={24} weight="regular" className="text-ink-3" aria-hidden />}
                </button>
                <input
                  aria-label="What was it for"
                  placeholder="What was it for?"
                  value={draft.title}
                  maxLength={60}
                  aria-invalid={submitted && !!errors.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setDraft((d) => ({ ...d, title, category: d.categoryTouched ? d.category : (autoCategory(title) ?? d.category) }))
                  }}
                  className="h-16 w-full bg-transparent px-[58px] text-center text-[19px] font-medium text-ink caret-accent outline-none placeholder:font-normal placeholder:text-faint"
                />
              </div>
            </div>
            {submitted && errors.title ? <p className="mt-2 text-center text-meta text-loss">{errors.title}</p> : null}
          </div>

          <div className="relative mt-6 flex items-center justify-center gap-0.5 text-[13px]">
            <button type="button" onClick={() => setPanel('date')} aria-label={`Date: ${dateLabel(draft.date)}. Change`} className="press rounded-full px-1.5 py-2 font-semibold text-ink">
              {dateLabel(draft.date)}
            </button>
            <span aria-hidden className="text-faint">·</span>
            <button type="button" onClick={() => setPanel('note')} className="press rounded-full px-1.5 py-2 font-semibold text-ink">
              {noteState}
            </button>
          </div>
          <button type="submit" hidden />
        </form>
      </FullScreen>

      <CategorySheet
        open={panel === 'category' && state.open}
        onClose={() => setPanel(null)}
        value={shownCategory}
        auto={!draft.categoryTouched}
        onPick={(c) => (setDraft((d) => ({ ...d, category: c, categoryTouched: true })), setPanel(null))}
        onAuto={() => (setDraft((d) => ({ ...d, categoryTouched: false, category: autoCategory(d.title) ?? 'other' })), setPanel(null))}
      />
      <DateSheet
        open={panel === 'date' && state.open}
        onClose={() => setPanel(null)}
        value={draft.date}
        tripStart={trip?.startDate}
        tripEnd={trip?.endDate}
        onPick={(iso) => set('date', `${iso}T${draft.date.slice(11, 16) || '12:00'}`)}
      />
      <NoteSheet
        open={panel === 'note' && state.open}
        onClose={() => setPanel(null)}
        notes={draft.notes}
        onNotes={(v) => set('notes', v)}
        receipt={draft.receipt}
        onScan={() => setScanOpen(true)}
        onRemoveReceipt={() => set('receipt', undefined)}
      />
      <TripSheet open={panel === 'trip' && state.open} onClose={() => setPanel(null)} trips={tripChoices} value={draft.tripId} onPick={changeTrip} />
      <PayerSheet
        open={panel === 'payer' && state.open}
        onClose={() => setPanel('split')}
        members={members}
        value={draft.paidBy}
        onPick={(id) => set('paidBy', id)}
        addPerson={addPerson(true)}
      />
      <SplitSheet
        open={(panel === 'split' || panel === 'payer') && state.open}
        onClose={() => setPanel(null)}
        members={members}
        participants={draft.participants}
        method={draft.method}
        inputs={draft.inputs}
        split={split}
        currency={currency}
        amount={amount}
        paidBy={payer}
        canFinish={split.valid}
        showReset={draft.method !== 'equal' && !split.valid}
        onReset={() => setDraft((d) => ({ ...d, inputs: seedInputs(d.method, d.participants) }))}
        onMethod={changeMethod}
        onToggle={toggleParticipant}
        onAll={selectAll}
        onInput={(id, v) => setDraft((d) => ({ ...d, inputs: { ...d.inputs, [id]: v } }))}
        onPayer={() => setPanel('payer')}
        status={<SplitStatus method={draft.method} amount={amount} split={split} remaining={remaining} currency={currency} />}
        addPerson={addPerson(false)}
      />

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
            amount: d.amount || (r.total ? groupDigits(toInput(r.total)) : ''),
            category: d.categoryTouched ? d.category : (autoCategory(r.merchant) ?? d.category),
          }))
          setScanOpen(false)
        }}
      />
    </>
  )
}

/** Live ledger: tells you whether the split adds up before you finish. */
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
    text = 'Pick at least one person'
    tone = 'warn'
  } else if (method === 'equal') {
    const n = Object.keys(split.shares).length
    text = `${formatMoney(Math.round(amount / n), { currency })} each, ${n} ${n === 1 ? 'person' : 'people'}`
    tone = 'ok'
  } else if (method === 'shares') {
    text = split.valid ? `${split.assigned} shares in total` : 'Give at least one share'
    tone = split.valid ? 'ok' : 'warn'
  } else if (split.valid) {
    text = method === 'percent' ? 'Adds up to 100%' : `Adds up to ${formatMoney(amount, { currency })}`
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
    <p aria-live="polite" className={cx('num text-meta font-semibold', tone === 'ok' ? 'text-ink' : tone === 'warn' ? 'text-loss' : 'text-ink-3')}>
      {tone === 'ok' ? <CheckCircle size={17} weight="fill" className="mr-1 -mt-0.5 inline text-gain" aria-hidden /> : tone === 'warn' ? <WarningCircle size={17} weight="fill" className="mr-1 -mt-0.5 inline" aria-hidden /> : null}
      {text}
    </p>
  )
}

/** Add someone to the trip without leaving the expense: pick a known person or type a new name. */
function AddPersonPanel({ known, newName, setNewName, onPick, onAdd }: { known: Person[]; newName: string; setNewName: (v: string) => void; onPick: (p: Person) => void; onAdd: () => void }) {
  return (
    <div className="panel-strong mt-3 rounded-[24px] p-4">
      {known.length ? (
        <>
          <p className="text-caption font-semibold text-ink-3">From your other trips</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {known.map((p) => (
              <button key={p.id} type="button" onClick={() => onPick(p)} className="glass-control press inline-flex h-10 items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-[14px] font-medium">
                <Avatar person={p} size={32} />
                {firstName(p.name)}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <p className={cx('text-caption font-semibold text-ink-3', known.length && 'mt-4')}>New person</p>
      <div className="mt-2 flex gap-2">
        <TextInput
          aria-label="Name of the new person"
          placeholder="Name"
          value={newName}
          maxLength={40}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          className="h-12"
        />
        <Button type="button" onClick={onAdd} disabled={!newName.trim()} className="shrink-0">
          Add
        </Button>
      </div>
    </div>
  )
}
