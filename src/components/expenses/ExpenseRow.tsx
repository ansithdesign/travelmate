import { Paperclip } from '@phosphor-icons/react'
import { useStore } from '../../store/store'
import type { CurrencyCode, Expense } from '../../types'
import { cx } from '../../utils/cx'
import { fmt } from '../../utils/dates'
import { firstName } from '../../utils/id'
import { formatMoney } from '../../utils/money'
import { computeSplit } from '../../utils/split'
import { CategoryTile } from '../icons/CategoryIcon'

/** One expense. Left: the object and who paid. Right: the amount and your position on it. */
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
  const payer = person(expense.paidBy)
  const { shares } = computeSplit(expense.amount, expense.split)
  const myShare = shares[me.id] ?? 0
  const iPaid = expense.paidBy === me.id
  const position = iPaid ? expense.amount - myShare : -myShare
  const n = expense.split.participants.length

  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-well">
      <CategoryTile id={expense.category} size={46} className="transition-transform duration-500 ease-[var(--ease-glide)] group-hover:scale-105" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{expense.title}</span>
          {expense.receipt ? <Paperclip size={14} weight="bold" className="shrink-0 text-ink-3" aria-label="Receipt attached" /> : null}
        </span>
        <span className="block truncate text-meta text-ink-3">
          {iPaid ? 'You' : firstName(payer?.name ?? 'Someone')} paid · {n === 1 ? 'for 1' : `${n} ways`}
          {tripName ? ` · ${tripName}` : <span className="hidden sm:inline"> · {fmt.time(expense.date)}</span>}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="num block font-semibold">{formatMoney(expense.amount, { currency })}</span>
        <span className={cx('num block text-caption font-medium', settled ? 'text-ink-3' : position > 0 ? 'text-gain' : position < 0 ? 'text-loss' : 'text-ink-3')}>
          {settled ? 'Settled' : position > 0 ? `you lent ${formatMoney(position, { currency })}` : position < 0 ? `you owe ${formatMoney(-position, { currency })}` : 'not involved'}
        </span>
      </span>
    </button>
  )
}
