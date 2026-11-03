import { useId } from 'react'

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
