import { useId } from 'react'

/** TripMate mark: a small square of evening sky with the sun behind a cloud. */
export function BrandMark({ size = 30 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b6fe0" />
          <stop offset="0.6" stopColor="#b48ad8" />
          <stop offset="1" stopColor="#ffbe8a" />
        </linearGradient>
        <radialGradient id={`${u}u`} cx="0.4" cy="0.38" r="0.6">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#ffc861" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${u}s)`} />
      <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="#fff" strokeOpacity="0.35" />
      <circle cx="19.5" cy="12.5" r="5" fill={`url(#${u}u)`} />
      <path d="M7 22.4c0-2.3 1.8-4 4-3.8.7-2.1 2.7-3.5 5-3.1 1.9.3 3.3 1.9 3.5 3.7 1.9-.2 3.6 1.1 3.8 3v.2c0 1.9-1.6 3.3-3.5 3.3H10c-1.7 0-3-1.5-3-3.3z" fill="#fff" />
    </svg>
  )
}
