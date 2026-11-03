import { useEffect, useState } from 'react'
import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { formatCompact, formatMoney } from '../../utils/money'

/**
 * Budget drawn as a road. Spending is the distance covered; small kilometre
 * stones stand at each quarter of the budget with the amount they mark, and an
 * amber stone shows where the group is now. Overrun turns the road brick.
 */
export function BudgetRoad({ spent, budget, className, currency }: { spent: Paise; budget: Paise; className?: string; currency?: CurrencyCode }) {
  const ratio = budget > 0 ? spent / budget : 0
  const pct = Math.min(ratio, 1) * 100
  const over = spent > budget
  const left = budget - spent
  const stones = [25, 50, 75]
  // The one authored motion: the road fills and the amber stone travels to today's spend when the trip opens.
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(pct))
    return () => cancelAnimationFrame(r)
  }, [pct])

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
        className="relative mt-3 pt-[18px] pb-5"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={budget / 100}
        aria-valuenow={spent / 100}
        aria-label={`Budget used: ${formatMoney(spent, { currency })} of ${formatMoney(budget, { currency })}`}
      >
        {/* Road surface with its centre line */}
        <div className="relative h-3 overflow-hidden rounded-[3px] bg-[#dcd7cc]">
          <div
            className={cx('absolute inset-y-0 left-0 transition-[width] duration-[900ms] ease-[var(--ease-out-expo)]', over ? 'bg-brick' : 'bg-forest')}
            style={{ width: `${shown}%` }}
          />
          <div
            aria-hidden
            className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 opacity-80"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 8px, transparent 8px 16px)' }}
          />
        </div>

        {/* Kilometre stones at each quarter */}
        {stones.map((t) => (
          <span key={t} aria-hidden className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${t}%` }}>
            <span className="flex h-[13px] w-[10px] flex-col overflow-hidden rounded-t-full rounded-b-[2px] bg-surface shadow-[0_0_0_1px_rgb(27_32_29/0.25)]">
              <span className={cx('h-[5px] transition-colors delay-300 duration-300', shown >= t ? 'bg-forest' : 'bg-ink-3/50')} />
            </span>
            <span className="num mt-[19px] text-[10px] leading-3 text-ink-3">{formatCompact(Math.round((budget * t) / 100), currency)}</span>
          </span>
        ))}

        {/* Where the group is now */}
        <span
          aria-hidden
          className="absolute top-[1px] flex -translate-x-1/2 flex-col items-center transition-[left] duration-[900ms] ease-[var(--ease-out-expo)]"
          style={{ left: `${Math.max(shown, 1.5)}%` }}
        >
          <span className="flex h-[15px] w-3 flex-col overflow-hidden rounded-t-full rounded-b-[2px] bg-surface shadow-[0_0_0_1.5px_var(--color-ink)]">
            <span className="h-[6px] bg-amber" />
          </span>
        </span>
      </div>
    </div>
  )
}
