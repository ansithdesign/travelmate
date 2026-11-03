import { useId } from 'react'

/** TripMate mark: a small square of dusk with a moon over two ridgelines. */
export function BrandMark({ size = 30 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a4690" />
          <stop offset="0.65" stopColor="#6f8fd6" />
          <stop offset="1" stopColor="#e4ebfa" />
        </linearGradient>
        <clipPath id={`${u}c`}>
          <rect x="0" y="0" width="32" height="32" rx="9" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${u}c)`}>
        <rect width="32" height="32" fill={`url(#${u}s)`} />
        <circle cx="21.5" cy="10.5" r="4" fill="#fff6dc" />
        <path d="M0 24 L8 15 L13 20 L19 12 L32 25 V32 H0Z" fill="#5a72b8" opacity="0.85" />
        <path d="M0 28 L9 20 L16 26 L23 19 L32 27 V32 H0Z" fill="#2c4488" />
      </g>
    </svg>
  )
}
