import { useMemo, useState } from 'react'
import { CaretLeft, CaretRight, Check, Plus, Receipt as ReceiptIcon, Scan, X } from '@phosphor-icons/react'
import { CATEGORIES } from '../../data/categories'
import type { CategoryId, ID, Person, Receipt, SplitMethod, Trip } from '../../types'
import { cx } from '../../utils/cx'
import { isoDate, parseDate } from '../../utils/dates'
import { currencySymbol, formatMoney } from '../../utils/money'
import type { computeSplit } from '../../utils/split'
import { CategoryTile } from '../icons/CategoryIcon'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Controls'
import { Field, TextArea, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'

export const METHODS: { value: SplitMethod; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'exact', label: 'Amounts' },
  { value: 'percent', label: 'Percent' },
  { value: 'shares', label: 'Shares' },
]

const you = (p: Person) => (p.isYou ? 'You' : p.name)

/** A flat check row used by the payer and trip lists. */
function CheckRow({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className="press flex min-h-[52px] w-full items-center gap-3.5 border-b border-line py-1 text-left last:border-0">
      <span className={cx('flex size-6 shrink-0 items-center justify-center rounded-full transition-colors', on ? 'bg-accent text-[var(--on-accent)]' : 'shadow-[inset_0_0_0_2px_var(--line-strong)]')}>
        {on ? <Check size={13} weight="bold" aria-hidden /> : null}
      </span>
      <span className={cx('min-w-0 flex-1 truncate text-[16px]', on ? 'font-semibold' : 'font-medium')}>{children}</span>
    </button>
  )
}

export function CategorySheet({ open, onClose, value, auto, onPick, onAuto }: { open: boolean; onClose: () => void; value?: CategoryId; auto: boolean; onPick: (c: CategoryId) => void; onAuto: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Category" headerAction={!auto ? <Button size="sm" variant="secondary" onClick={onAuto} className="mt-0.5">Use suggestion</Button> : undefined}>
      <div role="radiogroup" aria-label="Category" className="grid grid-cols-4 gap-x-1 gap-y-3 pb-2">
        {CATEGORIES.map((c) => {
          const on = value === c.id
          return (
            <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => onPick(c.id)} className="press flex flex-col items-center gap-1 rounded-[18px] py-1 text-center">
              <CategoryTile id={c.id} size={64} selected={on} />
              <span className={cx('max-w-[78px] text-[12px] leading-tight', on ? 'font-semibold text-ink' : 'font-medium text-ink-3')}>{c.short}</span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

export function PayerSheet({ open, onClose, members, value, onPick, addPerson }: { open: boolean; onClose: () => void; members: Person[]; value: ID; onPick: (id: ID) => void; addPerson: React.ReactNode }) {
  const ordered = [...members.filter((m) => m.isYou), ...members.filter((m) => !m.isYou)]
  return (
    <Sheet open={open} onClose={onClose} title="Paid by">
      <div role="radiogroup" aria-label="Paid by">
        {ordered.map((m) => (
          <CheckRow key={m.id} on={value === m.id} onClick={() => (onPick(m.id), onClose())}>
            {you(m)}
          </CheckRow>
        ))}
      </div>
      <div className="mt-2">{addPerson}</div>
    </Sheet>
  )
}

export function TripSheet({ open, onClose, trips, value, onPick }: { open: boolean; onClose: () => void; trips: Trip[]; value: ID; onPick: (id: ID) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Trip">
      <div role="radiogroup" aria-label="Trip">
        {trips.map((t) => (
          <CheckRow key={t.id} on={value === t.id} onClick={() => (onPick(t.id), onClose())}>
            {t.name}
          </CheckRow>
        ))}
      </div>
    </Sheet>
  )
}

export function ShareInput({ method, value, onChange, currency, name }: { method: SplitMethod; value: string; onChange: (v: string) => void; currency: Trip['currency']; name: string }) {
  const suffix = method === 'percent' ? '%' : method === 'shares' ? '×' : ''
  const prefix = method === 'exact' ? currencySymbol(currency).trim() : ''
  return (
    <div className="relative w-[100px] shrink-0">
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

export function SplitSheet(props: {
  open: boolean
  onClose: () => void
  members: Person[]
  participants: ID[]
  method: SplitMethod
  inputs: Record<ID, string>
  split: ReturnType<typeof computeSplit>
  currency: Trip['currency']
  amount: number
  paidBy: Person | undefined
  status: React.ReactNode
  canFinish: boolean
  onMethod: (m: SplitMethod) => void
  onToggle: (id: ID) => void
  onAll: (all: boolean) => void
  onInput: (id: ID, v: string) => void
  onReset: () => void
  showReset: boolean
  onPayer: () => void
  addPerson: React.ReactNode
}) {
  const { members, participants, method, inputs, split, currency } = props
  const all = participants.length === members.length
  return (
    <Sheet
      open={props.open}
      onClose={props.onClose}
      title="Split"
      description={props.amount > 0 ? formatMoney(props.amount, { currency }) : undefined}
      size="lg"
      footer={
        <div>
          <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">{props.status}</div>
            {props.showReset ? (
              <button type="button" onClick={props.onReset} className="press h-8 shrink-0 rounded-full bg-accent-soft px-3.5 text-[13px] font-semibold text-ink">
                Reset to equal
              </button>
            ) : null}
          </div>
          <Button block size="lg" onClick={props.onClose} disabled={!props.canFinish}>
            Done
          </Button>
        </div>
      }
    >
      <button type="button" onClick={props.onPayer} className="press flex min-h-[52px] w-full items-center gap-3 border-b border-line py-2 text-left">
        <span className="flex-1 text-[15px] text-ink-3">Paid by</span>
        <span className="text-[15px] font-semibold">{props.paidBy ? you(props.paidBy) : 'Choose'}</span>
        <CaretRight size={16} weight="bold" className="text-faint" aria-hidden />
      </button>
      <div className="mt-4">
        <Segmented label="Split method" value={method} onChange={props.onMethod} options={METHODS} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="num text-meta font-semibold text-ink-3">
          {participants.length} of {members.length} in
        </p>
        <button type="button" onClick={() => props.onAll(!all)} className="press -my-2 h-10 rounded-full px-2 text-[14px] font-semibold text-ink">
          {all ? 'Select none' : 'Select all'}
        </button>
      </div>
      <ul className="mt-1">
        {members.map((m) => {
          const on = participants.includes(m.id)
          const share = split.shares[m.id] ?? 0
          return (
            <li key={m.id} className="flex min-h-[52px] items-center gap-3.5 border-b border-line last:border-0">
              <button type="button" role="checkbox" aria-checked={on} aria-label={`Include ${m.name}`} onClick={() => props.onToggle(m.id)} className="press flex min-w-0 flex-1 items-center gap-3.5 py-1 text-left">
                <span className={cx('flex size-6 shrink-0 items-center justify-center rounded-full transition-colors', on ? 'bg-accent text-[var(--on-accent)]' : 'shadow-[inset_0_0_0_2px_var(--line-strong)]')}>
                  {on ? <Check size={13} weight="bold" aria-hidden /> : null}
                </span>
                <span className={cx('truncate text-[16px] font-medium', !on && 'text-ink-3')}>{you(m)}</span>
              </button>
              {on && method !== 'equal' ? <ShareInput method={method} value={inputs[m.id] ?? ''} currency={currency} name={m.name} onChange={(v) => props.onInput(m.id, v)} /> : null}
              {on && method === 'exact' ? null : <span className={cx('num w-[84px] shrink-0 text-right', on ? 'font-semibold' : 'text-ink-3')}>{on ? formatMoney(share, { currency }) : '–'}</span>}
            </li>
          )
        })}
      </ul>
      <div className="mt-2">{props.addPerson}</div>
    </Sheet>
  )
}

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function DateSheet({ open, onClose, value, onPick, tripStart, tripEnd }: { open: boolean; onClose: () => void; value: string; onPick: (iso: string) => void; tripStart?: string; tripEnd?: string }) {
  const selected = value.slice(0, 10)
  const start = parseDate(selected)
  const [month, setMonth] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const [seen, setSeen] = useState(selected)
  if (open && seen !== selected) {
    setSeen(selected)
    setMonth({ y: start.getFullYear(), m: start.getMonth() })
  }
  const first = new Date(month.y, month.m, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(month.y, month.m + 1, 0).getDate()
  const todayIso = isoDate(new Date())
  const label = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(first)
  const move = (d: number) => setMonth((x) => {
    const n = new Date(x.y, x.m + d, 1)
    return { y: n.getFullYear(), m: n.getMonth() }
  })
  const cells = useMemo(() => Array.from({ length: days }, (_, i) => isoDate(new Date(month.y, month.m, i + 1))), [days, month])
  return (
    <Sheet open={open} onClose={onClose} title="When was it?">
      <div className="mb-2 flex items-center justify-between">
        <IconBtn label="Previous month" onClick={() => move(-1)}>
          <CaretLeft size={18} weight="bold" aria-hidden />
        </IconBtn>
        <p className="text-[15px] font-semibold">{label}</p>
        <IconBtn label="Next month" onClick={() => move(1)}>
          <CaretRight size={18} weight="bold" aria-hidden />
        </IconBtn>
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-y-1">
        {WEEK.map((w, i) => (
          <span key={i} className="py-1 text-[11px] font-bold text-ink-3">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {cells.map((iso) => {
          const sel = iso === selected
          const inTrip = !!tripStart && !!tripEnd && iso >= tripStart && iso <= tripEnd
          return (
            <button
              key={iso}
              type="button"
              aria-label={iso}
              aria-pressed={sel}
              onClick={() => (onPick(iso), onClose())}
              className={cx('num press flex size-10 items-center justify-center rounded-full text-[14.5px] font-medium', sel ? 'bg-ink text-[var(--on-ink)]' : inTrip ? 'bg-well' : '', !sel && iso === todayIso && 'shadow-[inset_0_0_0_1.5px_var(--line-strong)]')}
            >
              {Number(iso.slice(8))}
            </button>
          )
        })}
      </div>
      {tripStart && tripEnd ? <p className="mt-3 text-caption text-ink-3">Shaded days are the trip.</p> : null}
    </Sheet>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="press flex size-10 items-center justify-center rounded-full bg-well text-ink-2">
      {children}
    </button>
  )
}

export function NoteSheet({ open, onClose, notes, onNotes, receipt, onScan, onRemoveReceipt }: { open: boolean; onClose: () => void; notes: string; onNotes: (v: string) => void; receipt?: Receipt; onScan: () => void; onRemoveReceipt: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Note or receipt" footer={<Button block size="lg" onClick={onClose}>Done</Button>}>
      <div className="flex flex-col gap-4">
        <Field label="Note" optional htmlFor="exp-notes">
          <TextArea id="exp-notes" rows={3} placeholder="Anything the group should know" value={notes} onChange={(e) => onNotes(e.target.value)} />
        </Field>
        {receipt ? (
          <div className="flex h-[54px] items-center gap-2 rounded-[16px] bg-gain-soft pr-1 pl-4">
            <ReceiptIcon size={20} weight="duotone" className="shrink-0 text-gain" aria-hidden />
            <button type="button" onClick={onScan} className="min-w-0 flex-1 truncate text-left text-body font-semibold text-ink">
              {receipt.merchant || 'Receipt attached'}
            </button>
            <button type="button" aria-label="Remove receipt" onClick={onRemoveReceipt} className="press flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-well">
              <X size={16} weight="bold" aria-hidden />
            </button>
          </div>
        ) : (
          <button type="button" onClick={onScan} className="press flex h-[54px] items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-line-strong text-[15px] font-semibold text-ink-2">
            <Scan size={18} aria-hidden />
            Scan a receipt
          </button>
        )}
      </div>
    </Sheet>
  )
}

/** "Add person" row and its panel, shared by Paid by and Split. */
export function AddPersonRow({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <>
      <button type="button" aria-expanded={open} onClick={onToggle} className="press inline-flex h-10 items-center gap-1.5 rounded-full px-1 text-[14px] font-semibold text-ink">
        <Plus size={15} weight="bold" aria-hidden />
        Add person
      </button>
      {open ? children : null}
    </>
  )
}

