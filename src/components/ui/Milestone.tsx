import { cx } from '../../utils/cx'

/**
 * The signature shape: an Indian highway kilometre stone. A domed white stone with
 * a coloured cap. The cap carries a short word, the face carries a figure.
 *   amber cap  -> upcoming (countdown)
 *   forest cap -> on the road / completed (day count, year)
 *   ink cap    -> needs attention from you (ended, not marked complete)
 */
export function Milestone({
  cap,
  value,
  unit,
  tone = 'forest',
  size = 'md',
  className,
  label,
}: {
  cap: string
  value: string | number
  unit?: string
  tone?: 'forest' | 'amber' | 'ink'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Full sentence for assistive tech, e.g. "Starts in 39 days" */
  label: string
}) {
  const dims = {
    sm: { w: 'w-11', cap: 'h-[18px] text-[9px]', face: 'pt-0.5 pb-1.5', v: 'text-[17px] leading-5', u: 'text-[9px]' },
    md: { w: 'w-[58px]', cap: 'h-[22px] text-[10px]', face: 'pt-1 pb-2', v: 'text-[22px] leading-6', u: 'text-[10px]' },
    lg: { w: 'w-[72px]', cap: 'h-[26px] text-[11px]', face: 'pt-1 pb-2.5', v: 'text-[28px] leading-8', u: 'text-[11px]' },
  }[size]
  const capColor = { forest: 'bg-forest text-white', amber: 'bg-amber text-[#2b1d05]', ink: 'bg-ink text-white' }[tone]

  return (
    <span className={cx('leading-none', className)}>
    <span
      role="img"
      aria-label={label}
      className={cx(
        'inline-flex flex-col overflow-hidden rounded-t-full rounded-b-[6px] bg-surface text-center align-bottom shadow-[0_0_0_1px_rgb(27_32_29/0.12),0_2px_8px_-4px_rgb(27_32_29/0.25)]',
        dims.w,
      )}
    >
      <span className={cx('flex items-end justify-center pb-[3px] font-semibold uppercase tracking-[0.08em]', dims.cap, capColor)}>
        {cap}
      </span>
      <span className={cx('flex flex-col items-center', dims.face)}>
        <span className={cx('num font-semibold tracking-[-0.03em] text-ink', dims.v)}>{value}</span>
        {unit ? <span className={cx('font-medium uppercase tracking-[0.06em] text-ink-3', dims.u)}>{unit}</span> : null}
      </span>
    </span>
    </span>
  )
}
