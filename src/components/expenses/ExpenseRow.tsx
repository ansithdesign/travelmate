import { Paperclip } from '@phosphor-icons/react'
import { useStore } from '../../store/store'
import type { CurrencyCode, Expense } from '../../types'
import { cx } from '../../utils/cx'
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

  return (
    <button type="button" onClick={onOpen} className="group flex min-h-[68px] w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-well active:bg-well">
      <CategoryTile id={expense.category} size={36} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{expense.title}</span>
          {expense.receipt ? <Paperclip size={14} weight="bold" className="shrink-0 text-ink-3" aria-label="Receipt attached" /> : null}
        </span>
        <span className="mt-0.5 block truncate text-caption text-ink-3">
          {iPaid ? 'You' : firstName(payer?.name ?? 'Someone')} paid
          {tripName ? ` · ${tripName}` : ''}
        </span>
      </span>
      <span className="shrink-0 pl-2 text-right">
        <span className="num block font-semibold">{formatMoney(expense.amount, { currency })}</span>
        <span className={cx('num block text-caption font-medium', settled ? 'text-ink-3' : position > 0 ? 'text-gain' : position < 0 ? 'text-loss' : 'text-ink-3')}>
          {settled ? 'Settled' : position > 0 ? `you lent ${formatMoney(position, { currency })}` : position < 0 ? `you owe ${formatMoney(-position, { currency })}` : 'not involved'}
        </span>
      </span>
    </button>
  )
}
