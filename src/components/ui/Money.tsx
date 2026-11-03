import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { formatMoney } from '../../utils/money'

/** Amounts are always tabular. Tone is supportive; the words around a balance carry the meaning. */
export function Money({
  value,
  sign,
  tone = 'plain',
  className,
  currency,
}: {
  value: Paise
  currency?: CurrencyCode
  sign?: boolean
  tone?: 'plain' | 'balance' | 'muted'
  className?: string
}) {
  const color =
    tone === 'balance' ? (value > 0 ? 'text-forest' : value < 0 ? 'text-brick' : 'text-ink-3') : tone === 'muted' ? 'text-ink-3' : ''
  return <span className={cx('num whitespace-nowrap', color, className)}>{formatMoney(value, { sign, currency })}</span>
}

/** Large figure: rupees and paise split so the paise sit quieter. */
export function Figure({ value, className, currency }: { value: Paise; className?: string; currency?: CurrencyCode }) {
  const text = formatMoney(value, { currency })
  const [main, frac] = text.split('.')
  return (
    <span className={cx('num text-figure', className)}>
      {main}
      {frac ? <span className="text-ink-3">.{frac}</span> : null}
    </span>
  )
}
