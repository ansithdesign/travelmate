import { useEffect, useId, useRef, useState } from 'react'
import type { CurrencyCode, Paise } from '../../types'
import { cx } from '../../utils/cx'
import { formatMoney } from '../../utils/money'

const PATH = 'M 18 78 Q 160 -18 302 78'

/**
 * Budget as a flight path. The plane takes off from zero and flies along the arc
 * to how much of the budget has been spent. The destination pin is the budget.
 * Over budget, the plane lands past the pin and the trail turns coral.
 */
export function FlightPath({ spent, budget, className, currency }: { spent: Paise; budget: Paise; className?: string; currency?: CurrencyCode }) {
  const ratio = budget > 0 ? spent / budget : 0
  const target = Math.min(ratio, 1)
  const over = spent > budget
  const left = budget - spent
  const pathRef = useRef<SVGPathElement>(null)
  const [p, setP] = useState(0)
  const [pt, setPt] = useState({ x: 18, y: 78, a: -50 })
  const [len, setLen] = useState(400)
  const u = useId().replace(/:/g, '')

  // Fly the plane to the target with an exponential ease.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setP(target)
      return
    }
    const start = performance.now()
    let raf = 0
    const from = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1600)
      const e = 1 - Math.pow(2, -10 * k)
      setP(from + (target - from) * (k >= 1 ? 1 : e))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const L = path.getTotalLength()
    setLen(L)
    const at = Math.max(0.001, Math.min(p, 0.999)) * L
    const a = path.getPointAtLength(at)
    const b = path.getPointAtLength(Math.min(L, at + 1))
    setPt({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI })
  }, [p])

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-meta">
        <span className="text-ink-2">
          <span className="num font-semibold text-ink">{Math.round(ratio * 100)}%</span> of the {formatMoney(budget, { currency })} budget
        </span>
        <span className={cx('num font-semibold', over ? 'text-loss' : 'text-gain')}>
          {over ? `${formatMoney(-left, { currency })} over` : `${formatMoney(left, { currency })} left`}
        </span>
      </div>
      <svg
        viewBox="0 0 320 92"
        className="mx-auto mt-1 block w-full max-w-[440px] overflow-visible"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={budget / 100}
        aria-valuenow={spent / 100}
        aria-label={`Budget used: ${formatMoney(spent, { currency })} of ${formatMoney(budget, { currency })}`}
      >
        <defs>
          <linearGradient id={`${u}t`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={over ? '#ff8a8a' : '#60a5fa'} />
            <stop offset="1" stopColor={over ? '#e5484d' : '#2563eb'} />
          </linearGradient>
        </defs>
        {/* Planned route */}
        <path d={PATH} fill="none" stroke="currentColor" className="text-ink/15" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
        {/* Flown */}
        <path
          ref={pathRef}
          d={PATH}
          fill="none"
          stroke={`url(#${u}t)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray={`${len * p} ${len}`}
        />
        {/* Origin */}
        <circle cx="18" cy="78" r="5" className="fill-panel-strong" stroke="currentColor" strokeWidth="2" style={{ color: over ? '#e5484d' : '#2563eb' }} />
        {/* Destination pin */}
        <g transform="translate(302 78)">
          <circle r="11" fill={over ? 'rgb(229 72 77 / 0.15)' : 'rgb(37 99 235 / 0.12)'} />
          <path d="M0 -9c-3.6 0-6.2 2.7-6.2 6 0 4.4 6.2 9.6 6.2 9.6s6.2-5.2 6.2-9.6c0-3.3-2.6-6-6.2-6z" fill={over ? '#e5484d' : '#ff8a5c'} />
          <circle cy="-3" r="2.2" fill="#fff" />
        </g>
        {/* Plane */}
        <g transform={`translate(${pt.x} ${pt.y}) rotate(${pt.a})`}>
          <circle r="13" className="fill-panel-strong" style={{ filter: 'drop-shadow(0 4px 8px rgb(12 23 54 / 0.25))' }} />
          <path
            d="M7.2 0c0-.8-.7-1.4-1.6-1.4H1.6L-2.8-7.4h-2l2 6H-6l-1.6-2H-9l1 3.4L-9 3.4h1.4L-6 1.4h3.2l-2 6h2L1.6 1.4h4c.9 0 1.6-.6 1.6-1.4z"
            fill={over ? '#e5484d' : '#2563eb'}
          />
        </g>
      </svg>
      <div className="mx-auto -mt-1 flex max-w-[440px] justify-between text-caption text-ink-3">
        <span className="num">Spent {formatMoney(spent, { currency })}</span>
        <span>Budget</span>
      </div>
    </div>
  )
}
