import { useId } from 'react'
import type { SkyPhase } from '../../store/sky'

const SKY: Record<SkyPhase, string[][]> = {
  day: [['#7f9bd6', '#c3d0ee', '#f6e4dc'], ['#8aa7e0', '#cddcf3', '#fbefe3'], ['#7a90cf', '#bcc4e8', '#f3d9d6']],
  night: [['#0b1433', '#1d2f66', '#4a5f9c'], ['#0d1738', '#243a78', '#6a6fa8'], ['#091029', '#16285c', '#3a5594']],
}
const RIDGE: Record<SkyPhase, string[]> = {
  day: ['#9db1dc', '#7d94c9', '#5f79b4'],
  night: ['#34508f', '#253c7c', '#16245a'],
}

function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >> 17
    s ^= s << 5
    s >>>= 0
    return (s % 10000) / 10000
  }
}

/** A soft ridgeline across a 200 x 100 box, peaks seeded so each scene differs. */
function ridge(r: () => number, base: number, amp: number) {
  const n = 6
  const pts = Array.from({ length: n + 1 }, (_, i) => [(i / n) * 200, base - r() * amp])
  let d = `M0 100 L0 ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` Q${x0 + (x1 - x0) * 0.35} ${(Math.min(y0, y1) - 6 * r()).toFixed(1)} ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} T${x1} ${y1.toFixed(1)}`
  }
  return d + ' L200 100 Z'
}

/**
 * A painted scene: dusk or day sky, a sun or moon, three misty ridgelines.
 * It fills any box and stands in for a trip photo until one loads.
 */
export function Scene({ phase, seed = 0 }: { phase: SkyPhase; seed?: number }) {
  const u = useId().replace(/:/g, '')
  const r = rng(seed + 3)
  const [a, b, c] = SKY[phase][seed % 3]
  const [far, mid, near] = RIDGE[phase]
  const ox = 22 + r() * 56
  const oy = 16 + r() * 22
  const night = phase === 'night'
  return (
    <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.6" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${u}o`}>
          <stop offset="0" stopColor={night ? '#fff7e4' : '#fff8e6'} stopOpacity="1" />
          <stop offset="0.28" stopColor={night ? '#f6e8c8' : '#fff1cf'} stopOpacity="1" />
          <stop offset="0.3" stopColor={night ? '#cdd8ff' : '#ffe9bd'} stopOpacity="0.35" />
          <stop offset="1" stopColor={night ? '#8da2ee' : '#ffd9a0'} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor={night ? '#7f93d6' : '#fff'} stopOpacity={night ? 0.35 : 0.8} />
        </linearGradient>
      </defs>
      <rect width="200" height="100" fill={`url(#${u}s)`} />
      {night
        ? Array.from({ length: 16 }, (_, i) => <circle key={i} cx={r() * 200} cy={r() * 55} r={0.35 + r() * 0.5} fill="#fff" opacity={0.5 + r() * 0.5} />)
        : null}
      <circle cx={ox * 2} cy={oy} r="24" fill={`url(#${u}o)`} />
      <path d={ridge(r, 70, 26)} fill={far} opacity="0.85" />
      <path d={ridge(r, 80, 22)} fill={mid} opacity="0.9" />
      <path d={ridge(r, 92, 16)} fill={near} />
      <rect y="55" width="200" height="45" fill={`url(#${u}m)`} />
    </svg>
  )
}
