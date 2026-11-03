import { useEffect, useRef, useState } from 'react'
import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { currencySymbol, formatMoney } from '../../utils/money'

/** Amounts are always tabular. Tone is supportive; the words around a balance carry the meaning. */
export function Money({
  value,
  sign,
  tone = 'plain',
  className,
  currency,
  round,
}: {
  value: Paise
  currency?: CurrencyCode
  sign?: boolean
  tone?: 'plain' | 'balance' | 'muted'
  className?: string
  round?: boolean
}) {
  const color = tone === 'balance' ? (value > 0 ? 'text-gain' : value < 0 ? 'text-loss' : 'text-ink-3') : tone === 'muted' ? 'text-ink-3' : ''
  return <span className={cx('num whitespace-nowrap', color, className)}>{formatMoney(value, { sign, currency, round })}</span>
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Counts from the previous value to the new one with an exponential ease. */
export function useCountUp(target: number, ms = 1100): number {
  const [v, setV] = useState(() => (prefersReducedMotion() ? target : 0))
  const from = useRef(v)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setV(target)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(2, -10 * p)
      const next = p >= 1 ? target : a + (target - a) * e
      from.current = next
      setV(next)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

/**
 * Large figure: Figtree 650, tabular, tight. The currency symbol sits
 * smaller and raised; paise sit quieter. Counts up when it first appears.
 */
export function Figure({
  value,
  className,
  currency,
  animate = false,
  size = 'lg',
}: {
  value: Paise
  className?: string
  currency?: CurrencyCode
  animate?: boolean
  size?: 'md' | 'lg' | 'xl'
}) {
  const counted = useCountUp(value)
  const shown = animate ? Math.round(counted) : value
  const text = formatMoney(shown, { currency, symbol: false })
  const [main, frac] = text.split('.')
  const sym = currencySymbol(currency).trim()
  const sizes = {
    md: 'text-[28px] leading-[32px] tracking-[-0.03em]',
    lg: 'text-[40px] leading-[42px] tracking-[-0.035em]',
    xl: 'text-[60px] leading-[58px] tracking-[-0.045em]',
  }
  return (
    <span className={cx('num inline-flex items-start font-[650]', sizes[size], className)} aria-label={formatMoney(value, { currency })}>
      <span aria-hidden className="mt-[0.12em] mr-[0.05em] text-[0.55em] leading-none font-semibold tracking-normal text-ink-3">
        {sym}
      </span>
      <span aria-hidden>{main}</span>
      {frac && value % 100 !== 0 ? (
        <span aria-hidden className="text-ink-3">
          .{frac}
        </span>
      ) : null}
    </span>
  )
}
