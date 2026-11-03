import { memo, useEffect, useId, useRef } from 'react'
import { useSky, type SkyPhase } from '../../store/sky'
import { cx } from '../../utils/cx'

const GRADIENTS: Record<SkyPhase, string> = {
  dawn: 'linear-gradient(180deg, #4560b8 0%, #7280cc 30%, #a98dcc 55%, #d895b0 78%, #f0b39c 100%)',
  day: 'linear-gradient(180deg, #1452c6 0%, #2a72e2 34%, #4f97ee 64%, #82b8f5 86%, #b9dafc 100%)',
  golden: 'linear-gradient(180deg, #2c3fa3 0%, #5459c0 28%, #9a76c4 52%, #d4829f 74%, #eda07f 100%)',
  night: 'linear-gradient(180deg, #040820 0%, #0a1338 38%, #17215a 70%, #2b2f6e 100%)',
}

/** Cloud tint per phase: [top, belly] */
const CLOUD_TINT: Record<SkyPhase, [string, string, number]> = {
  dawn: ['#fff7f6', '#e6c3d6', 0.9],
  day: ['#ffffff', '#cfe0f5', 0.95],
  golden: ['#fff2ea', '#e6a7b4', 0.88],
  night: ['#5a6497', '#262f63', 0.38],
}

const CLOUDS = [
  { top: 6, w: 260, dur: 190, delay: -40, o: 1, blur: 0 },
  { top: 16, w: 170, dur: 150, delay: -110, o: 0.85, blur: 0.5 },
  { top: 27, w: 320, dur: 240, delay: -170, o: 0.9, blur: 0 },
  { top: 2, w: 120, dur: 130, delay: -20, o: 0.6, blur: 1.5 },
  { top: 38, w: 220, dur: 210, delay: -80, o: 0.75, blur: 1 },
  { top: 48, w: 380, dur: 280, delay: -230, o: 0.7, blur: 2 },
]

// Deterministic star field so it does not jump between renders.
const STARS = Array.from({ length: 90 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 9301 + n * 49297) * 233280
    return x - Math.floor(x)
  }
  return { x: r(1) * 100, y: r(2) * 62, s: r(3) > 0.88 ? 2.2 : r(3) > 0.6 ? 1.5 : 1, d: 2 + r(4) * 4, delay: -r(5) * 6 }
})

/**
 * The living sky. A fixed layer behind the whole app whose light follows the
 * time of day. Gradients crossfade between phases; clouds drift and lift a
 * little as you scroll; stars come out at night.
 */
export const Sky = memo(function Sky() {
  const { phase } = useSky()
  const cloudsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 1200)
        if (cloudsRef.current) cloudsRef.current.style.transform = `translate3d(0, ${-y * 0.18}px, 0)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const [top, belly, cloudOpacity] = CLOUD_TINT[phase]

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {(Object.keys(GRADIENTS) as SkyPhase[]).map((p) => (
        <div
          key={p}
          className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
          style={{ background: GRADIENTS[p], opacity: p === phase ? 1 : 0 }}
        />
      ))}

      {/* Sun or moon */}
      <Luminary phase={phase} />

      {/* Stars */}
      <div className={cx('absolute inset-0 transition-opacity duration-[2000ms]', phase === 'night' ? 'opacity-100' : 'opacity-0')}>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              boxShadow: s.s > 2 ? '0 0 6px 1px rgb(200 215 255 / 0.8)' : undefined,
              animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Clouds */}
      <div ref={cloudsRef} className="absolute inset-0 will-change-transform" style={{ opacity: cloudOpacity, transition: 'opacity 1.8s' }}>
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{
              top: `${c.top}%`,
              animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
              opacity: c.o,
              filter: c.blur ? `blur(${c.blur}px)` : undefined,
            }}
          >
            <CloudShape width={c.w} top={top} belly={belly} variant={i % 3} />
          </div>
        ))}
      </div>

      {/* Low haze where the horizon would be */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background:
            phase === 'night'
              ? 'linear-gradient(180deg, transparent, rgb(60 50 120 / 0.35))'
              : 'linear-gradient(180deg, transparent, rgb(255 255 255 / 0.22))',
        }}
      />
    </div>
  )
})

function Luminary({ phase }: { phase: SkyPhase }) {
  const pos: Record<SkyPhase, { x: string; y: string; size: number; core: string; glow: string }> = {
    dawn: { x: '88%', y: '7%', size: 60, core: '#fff1d6', glow: 'rgb(255 200 170 / 0.55)' },
    day: { x: '90%', y: '2%', size: 76, core: '#fffbe8', glow: 'rgb(255 244 200 / 0.6)' },
    golden: { x: '89%', y: '9%', size: 70, core: '#ffe2b8', glow: 'rgb(255 170 120 / 0.6)' },
    night: { x: '91%', y: '3.5%', size: 40, core: '#f4f6ff', glow: 'rgb(170 190 255 / 0.4)' },
  }
  const p = pos[phase]
  return (
    <div
      className="absolute transition-all duration-[1800ms] ease-in-out"
      style={{ left: p.x, top: p.y, width: p.size, height: p.size, transform: 'translate(-50%, -50%)' }}
    >
      <div
        className="absolute inset-[-180%] rounded-full transition-[background] duration-[1800ms]"
        style={{ background: `radial-gradient(circle, ${p.glow} 0%, transparent 60%)` }}
      />
      <div
        className="absolute inset-0 rounded-full transition-[background,box-shadow] duration-[1800ms]"
        style={{
          background: `radial-gradient(circle at 40% 38%, #fff 0%, ${p.core} 55%, ${p.core} 100%)`,
          boxShadow: `0 0 40px 10px ${p.glow}`,
        }}
      />
      {/* Moon shadow makes a crescent at night */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-[1800ms]"
        style={{
          opacity: phase === 'night' ? 1 : 0,
          background: 'radial-gradient(circle at 70% 35%, #0a1338 0 52%, transparent 53%)',
        }}
      />
    </div>
  )
}

/** A soft, volumetric cloud: overlapping puffs with a lit top and a tinted belly. */
export function CloudShape({ width, top = '#fff', belly = '#cfe0f5', variant = 0 }: { width: number; top?: string; belly?: string; variant?: number }) {
  const id = `c${useId().replace(/:/g, '')}`
  const puffs = [
    [
      [60, 62, 34],
      [100, 46, 40],
      [146, 56, 32],
      [178, 70, 22],
      [30, 74, 20],
    ],
    [
      [50, 60, 28],
      [90, 44, 36],
      [134, 52, 30],
      [168, 66, 22],
    ],
    [
      [44, 66, 24],
      [80, 52, 32],
      [122, 42, 38],
      [166, 58, 28],
      [196, 72, 18],
    ],
  ][variant]
  return (
    <svg width={width} height={width * 0.45} viewBox="0 0 220 100" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.25" stopColor={top} />
          <stop offset="1" stopColor={belly} />
        </linearGradient>
        <filter id={`${id}-f`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <g filter={`url(#${id}-f)`} fill={`url(#${id}-g)`}>
        {puffs.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
        <rect x="18" y="62" width="190" height="30" rx="15" />
      </g>
    </svg>
  )
}
