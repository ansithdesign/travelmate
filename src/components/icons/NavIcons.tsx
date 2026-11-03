import { useId } from 'react'

interface P {
  active?: boolean
  size?: number
}

function useGrad(active?: boolean) {
  const id = useId().replace(/:/g, '')
  const defs = (
    <defs>
      <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6aa2ff" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bfe0ff" />
        <stop offset="1" stopColor="#ffd2b0" />
      </linearGradient>
    </defs>
  )
  return { defs, fill: active ? `url(#${id}g)` : 'none', sky: `url(#${id}s)` }
}

/** Trips: a cabin window with a sliver of sky. */
export function TripsIcon({ active, size = 24 }: P) {
  const { defs, fill, sky } = useGrad(active)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {defs}
      <rect x="4.5" y="2" width="15" height="20" rx="7" fill={fill} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.8" />
      <rect x="7.5" y="5" width="9" height="14" rx="4.5" fill={active ? sky : 'currentColor'} opacity={active ? 1 : 0.16} />
      <rect x="7.5" y="5" width="9" height="3" rx="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 0.95 : 0.5} />
      <path d="M8.6 16.2c0-1 .8-1.7 1.7-1.6.3-.9 1.1-1.5 2.1-1.3.8.1 1.4.8 1.5 1.6.8-.1 1.5.5 1.5 1.3 0 .8-.6 1.4-1.4 1.4H9.9c-.7 0-1.3-.6-1.3-1.4z" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.55} />
    </svg>
  )
}

/** Expenses: a torn receipt. */
export function ExpensesIcon({ active, size = 24 }: P) {
  const { defs, fill } = useGrad(active)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {defs}
      <path
        d="M5.5 3.5A1.5 1.5 0 0 1 7 2h10a1.5 1.5 0 0 1 1.5 1.5V21l-2.1-1.4-2.1 1.4-2.3-1.4-2.3 1.4-2.1-1.4L5.5 21z"
        fill={active ? fill : 'currentColor'}
        fillOpacity={active ? 1 : 0.12}
        stroke={active ? 'none' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 7.5h6M9 11h6M9 14.5h3.5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/** Profile: a passport with its globe. */
export function ProfileIcon({ active, size = 24 }: P) {
  const { defs, fill } = useGrad(active)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {defs}
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.6" fill={active ? fill : 'currentColor'} fillOpacity={active ? 1 : 0.12} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3.6" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" />
      <path d="M8.4 10h7.2M12 6.4c-1.4 1.6-1.4 5.6 0 7.2M12 6.4c1.4 1.6 1.4 5.6 0 7.2" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.1" fill="none" />
      <path d="M9 17.5h6" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
