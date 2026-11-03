import { Paperclip } from 'lucide-react'
import { categoryById } from '../../data/categories'
import { useStore } from '../../store/store'
import type { CurrencyCode, Expense } from '../../types'
import { cx } from '../../utils/cx'
import { fmt } from '../../utils/dates'
import { firstName } from '../../utils/id'
import { formatMoney } from '../../utils/money'
import { computeSplit } from '../../utils/split'

/** One expense. Left: what and who. Right: the amount and your position on it. */
export function ExpenseRow({
  expense,
  currency,
  onOpen,
  settled,
  tripName,
}: {
  expense: Expense
  currency: CurrencyCode
  onOpen: () => void
  settled?: boolean
  tripName?: string
}) {
  const { me, person } = useStore()
  const cat = categoryById[expense.category]
  const payer = person(expense.paidBy)
  const { shares } = computeSplit(expense.amount, expense.split)
  const myShare = shares[me.id] ?? 0
  const iPaid = expense.paidBy === me.id
  const position = iPaid ? expense.amount - myShare : -myShare
  const n = expense.split.participants.length

  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-center gap-3.5 py-3 text-left">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-sunken text-ink-2 transition-colors group-hover:bg-forest-50 group-hover:text-forest">
        <cat.icon size={19} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium">{expense.title}</span>
          {expense.receipt ? <Paperclip size={13} className="shrink-0 text-ink-3" aria-label="Receipt attached" /> : null}
        </span>
        <span className="block truncate text-meta text-ink-3">
          {iPaid ? 'You' : firstName(payer?.name ?? 'Someone')} paid · {n === 1 ? 'for 1' : `split ${n} ways`}
          {tripName ? ` · ${tripName}` : ` · ${fmt.time(expense.date)}`}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="num block font-medium">{formatMoney(expense.amount, { currency })}</span>
        <span
          className={cx(
            'num block text-meta',
            settled ? 'text-ink-3' : position > 0 ? 'text-forest' : position < 0 ? 'text-brick' : 'text-ink-3',
          )}
        >
          {settled
            ? 'Settled'
            : position > 0
              ? `you lent ${formatMoney(position, { currency })}`
              : position < 0
                ? `you owe ${formatMoney(-position, { currency })}`
                : 'not involved'}
        </span>
      </span>
    </button>
  )
}
