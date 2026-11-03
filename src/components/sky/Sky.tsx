import { memo, useEffect, useId, useRef, useState } from 'react'
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

      {/* Zenith: the sky deepens overhead, which also keeps type on the sky legible over passing clouds */}
      <div className="absolute inset-x-0 top-0 h-[42%]" style={{ background: 'linear-gradient(180deg, rgb(6 18 64 / 0.26) 0%, rgb(6 18 64 / 0.1) 55%, transparent 100%)' }} />

      {/* Sun or moon, above the zenith wash so it stays luminous */}
      <Luminary phase={phase} />

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

function useWide() {
  const q = '(min-width: 1024px)'
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(q).matches)
  useEffect(() => {
    const m = window.matchMedia?.(q)
    if (!m) return
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

/**
 * Sun or moon. Phones have controls and titles across the whole top edge, so the
 * disc sits above the frame and only its glow spills into the sky. Desktop keeps the disc
 * whole in the open sky right of centre, clear of the header actions.
 */
function Luminary({ phase }: { phase: SkyPhase }) {
  const wide = useWide()
  const pos: Record<SkyPhase, { x: string; y: string; size: number; core: string; glow: string }> = wide
    ? {
        dawn: { x: '70%', y: '8%', size: 64, core: '#fff1d6', glow: 'rgb(255 200 170 / 0.55)' },
        day: { x: '70%', y: '6.5%', size: 78, core: '#fffbe8', glow: 'rgb(255 244 200 / 0.6)' },
        golden: { x: '70%', y: '9%', size: 72, core: '#ffe2b8', glow: 'rgb(255 170 120 / 0.6)' },
        night: { x: '71%', y: '7.5%', size: 44, core: '#f4f6ff', glow: 'rgb(170 190 255 / 0.4)' },
      }
    : {
        dawn: { x: '58%', y: '-9%', size: 76, core: '#fff1d6', glow: 'rgb(255 200 170 / 0.55)' },
        day: { x: '58%', y: '-9.5%', size: 84, core: '#fffbe8', glow: 'rgb(255 244 200 / 0.6)' },
        golden: { x: '58%', y: '-9%', size: 80, core: '#ffe2b8', glow: 'rgb(255 170 120 / 0.6)' },
        night: { x: '58%', y: '-6%', size: 46, core: '#f4f6ff', glow: 'rgb(170 190 255 / 0.4)' },
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

// Cumulus layouts: [cx, cy, rx, ry]. Bigger puffs on top, a flatter base below.
const PUFFS: number[][][] = [
  [
    [62, 70, 34, 28],
    [98, 52, 40, 36],
    [140, 58, 36, 32],
    [176, 74, 26, 20],
    [34, 82, 22, 16],
    [118, 84, 70, 18],
    [72, 86, 44, 14],
  ],
  [
    [56, 72, 30, 24],
    [92, 56, 36, 32],
    [128, 50, 30, 30],
    [160, 66, 28, 22],
    [110, 84, 64, 16],
    [190, 80, 18, 12],
  ],
  [
    [48, 76, 26, 20],
    [84, 62, 34, 30],
    [124, 46, 40, 38],
    [166, 60, 32, 28],
    [198, 78, 20, 14],
    [128, 86, 78, 16],
  ],
]

/**
 * A volumetric cumulus. Puffs are pushed through fractal noise so the outline
 * billows instead of reading as circles, lit from the top with a shaded belly,
 * and a soft halo behind gives it depth.
 */
export function CloudShape({ width, top = '#fff', belly = '#cfe0f5', variant = 0 }: { width: number; top?: string; belly?: string; variant?: number }) {
  const id = `c${useId().replace(/:/g, '')}`
  const puffs = PUFFS[((Math.trunc(variant) % PUFFS.length) + PUFFS.length) % PUFFS.length]
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 240 120" style={{ overflow: 'visible' }} aria-hidden>
      <defs>
        <radialGradient id={`${id}-p`} cx="0.42" cy="0.3" r="0.75">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={top} />
          <stop offset="1" stopColor={belly} />
        </radialGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={belly} />
        </linearGradient>
        <filter id={`${id}-f`} x="-25%" y="-45%" width="150%" height="190%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="3" seed={variant * 11 + 4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.1" />
        </filter>
        <filter id={`${id}-h`} x="-40%" y="-60%" width="180%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {/* Halo */}
      <g filter={`url(#${id}-h)`} opacity="0.55" fill={top}>
        {puffs.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx * 1.05} ry={ry * 1.05} />
        ))}
      </g>
      {/* Body */}
      <g filter={`url(#${id}-f)`}>
        {puffs.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={ry < 20 ? `url(#${id}-b)` : `url(#${id}-p)`} />
        ))}
      </g>
    </svg>
  )
}
