import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { formatMoney } from '../../utils/money'

/**
 * Budget drawn as a road: spending is the distance covered, kilometre-stone ticks
 * mark each quarter of the budget. Over budget turns the overrun brick.
 */
export function BudgetRoad({ spent, budget, className, currency }: { spent: Paise; budget: Paise; className?: string; currency?: CurrencyCode }) {
  const ratio = budget > 0 ? spent / budget : 0
  const pct = Math.min(ratio, 1) * 100
  const over = spent > budget
  const left = budget - spent

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-meta">
        <span className="text-ink-2">
          <span className="num font-medium text-ink">{Math.round(ratio * 100)}%</span> of {formatMoney(budget, { currency })} budget
        </span>
        <span className={cx('num font-medium', over ? 'text-brick' : 'text-ink')}>
          {over ? `${formatMoney(-left, { currency })} over` : `${formatMoney(left, { currency })} left`}
        </span>
      </div>
      <div
        className="relative mt-3 h-2.5"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={budget / 100}
        aria-valuenow={spent / 100}
        aria-label="Budget used"
      >
        <div className="absolute inset-0 rounded-full bg-sunken" />
        <div
          className={cx('absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]', over ? 'bg-brick' : 'bg-forest')}
          style={{ width: `${pct}%` }}
        />
        {[25, 50, 75].map((t) => (
          <span
            key={t}
            aria-hidden
            className={cx('absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-t-full rounded-b-[1px]', pct >= t ? 'bg-forest-200' : 'bg-line')}
            style={{ left: `${t}%`, boxShadow: '0 0 0 2px var(--color-surface)' }}
          />
        ))}
      </div>
    </div>
  )
}
