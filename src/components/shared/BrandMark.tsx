import { useId } from 'react'

/** TripMate mark: a cabin window holding a small sky with the sun setting into a cloud. */
export function BrandMark({ size = 30 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f78e6" />
          <stop offset="0.65" stopColor="#c493d2" />
          <stop offset="1" stopColor="#ffc187" />
        </linearGradient>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6deee" />
        </linearGradient>
      </defs>
      <rect x="4" y="1.5" width="24" height="29" rx="11" fill={`url(#${u}b)`} />
      <rect x="7" y="4.5" width="18" height="23" rx="8.5" fill={`url(#${u}s)`} />
      <circle cx="19.5" cy="18" r="3.4" fill="#fff4d6" />
      <path d="M8.5 23.5c0-2 1.6-3.4 3.4-3.2.6-1.8 2.3-3 4.2-2.6 1.6.3 2.7 1.6 2.9 3.1 1.6-.2 3 .9 3.2 2.5v.2c0 1.6-1.3 2.7-2.9 2.7H11c-1.4 0-2.5-1.2-2.5-2.7z" fill="#fff" />
      <rect x="7" y="4.5" width="18" height="4.5" rx="2.25" fill="#eef2fa" />
    </svg>
  )
}
