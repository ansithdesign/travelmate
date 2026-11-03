import { useId } from 'react'
import type { SkyPhase } from '../../store/sky'

const SKY: Record<SkyPhase, string[][]> = {
  day: [['#3a5aa6', '#7897d6', '#c4d4f1'], ['#4363b0', '#86a2dc', '#cfdcf4'], ['#34539c', '#6f8ccc', '#bccdee']],
  night: [['#0b1433', '#1d2f66', '#4a5f9c'], ['#0d1738', '#243a78', '#6a6fa8'], ['#091029', '#16285c', '#3a5594']],
}
const RIDGE: Record<SkyPhase, string[]> = {
  day: ['#9fb6e8', '#8199d8', '#5f7ac0'],
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

/** A soft rolling ridgeline across a 200 x 100 box: smooth waves, no sharp peaks. */
function ridge(r: () => number, base: number, amp: number) {
  const n = 4
  const pts = Array.from({ length: n + 1 }, (_, i) => [(i / n) * 200, base - r() * amp])
  let d = `M0 100 L0 ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dx = (x1 - x0) / 2
    d += ` C${x0 + dx} ${y0.toFixed(1)} ${x1 - dx} ${y1.toFixed(1)} ${x1} ${y1.toFixed(1)}`
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
          <stop offset="1" stopColor={night ? '#7f93d6' : '#fff'} stopOpacity={night ? 0.3 : 0.6} />
        </linearGradient>
        <filter id={`${u}b`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>
      <rect width="200" height="100" fill={`url(#${u}s)`} />
      {Array.from({ length: night ? 16 : 9 }, (_, i) => <circle key={i} cx={r() * 200} cy={r() * 55} r={0.35 + r() * 0.5} fill="#fff" opacity={(night ? 0.5 : 0.35) + r() * 0.4} />)}
      {night ? <circle cx={ox * 2} cy={oy} r="22" fill={`url(#${u}o)`} /> : null}
      <g filter={`url(#${u}b)`}>
        <path d={ridge(r, 66, 22)} fill={far} opacity="0.8" />
        <path d={ridge(r, 78, 18)} fill={mid} opacity="0.85" />
        <path d={ridge(r, 90, 12)} fill={near} opacity="0.9" />
      </g>
      <rect y="48" width="200" height="52" fill={`url(#${u}m)`} />
    </svg>
  )
}
