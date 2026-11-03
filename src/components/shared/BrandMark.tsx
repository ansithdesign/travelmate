/** TripMate mark: a milestone silhouette. */
export function BrandMark({ size = 26, onDark = true }: { size?: number; onDark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M6 30V14a10 10 0 0 1 20 0v16z" fill={onDark ? '#fff' : '#fff'} stroke={onDark ? 'none' : '#1b201d'} strokeWidth="1.5" />
      <path d="M6.5 14a9.5 9.5 0 0 1 19 0z" fill="#c98a1e" />
      <rect x="11" y="19" width="10" height="2.2" rx="1.1" fill="#12372a" />
      <rect x="13" y="23.5" width="6" height="2.2" rx="1.1" fill="#12372a" opacity="0.5" />
    </svg>
  )
}
