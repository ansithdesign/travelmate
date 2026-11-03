import { useEffect, useState } from 'react'
import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { formatMoney } from '../../utils/money'

/**
 * Budget as a thin bar: accent fill for what is spent, the amount left on the
 * right. Over budget, the bar and the words turn to the act colour.
 */
export function BudgetBar({ spent, budget, className, currency }: { spent: Paise; budget: Paise; className?: string; currency?: CurrencyCode }) {
  const ratio = budget > 0 ? spent / budget : 0
  const pct = Math.min(ratio, 1) * 100
  const over = spent > budget
  const left = budget - spent
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(pct))
    return () => cancelAnimationFrame(r)
  }, [pct])

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-meta">
        <span className="text-ink-2">
          <span className="num font-semibold text-ink">{Math.round(ratio * 100)}%</span> of {formatMoney(budget, { currency })} budget
        </span>
        <span className={cx('num font-semibold', over ? 'text-loss' : 'text-gain')}>
          {over ? `${formatMoney(-left, { currency })} over` : `${formatMoney(left, { currency })} left`}
        </span>
      </div>
      <div
        className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-accent-soft"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={budget / 100}
        aria-valuenow={spent / 100}
        aria-label={`Budget used: ${formatMoney(spent, { currency })} of ${formatMoney(budget, { currency })}`}
      >
        <div
          className={cx(
            'absolute inset-y-0 left-0 rounded-full transition-[width] duration-[1100ms] ease-[var(--ease-out-expo)]',
            over ? 'bg-act' : 'bg-accent',
          )}
          style={{ width: `${shown}%` }}
        />
      </div>
    </div>
  )
}
