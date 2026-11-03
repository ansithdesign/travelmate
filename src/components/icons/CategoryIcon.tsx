import { useId } from 'react'
import type { CategoryId } from '../../types'
import { cx } from '../../utils/cx'

/**
 * Hand-drawn dimensional icons for expense categories. Each object is lit from
 * the top left with a soft contact shadow, so they read as small rendered
 * objects rather than line glyphs.
 */
export function CategoryIcon({ id, size = 40, className }: { id: CategoryId; size?: number; className?: string }) {
  const u = useId().replace(/:/g, '')
  const g = (n: string) => `${u}${n}`
  const url = (n: string) => `url(#${g(n)})`

  const shadow = <ellipse cx="24" cy="43" rx="13" ry="2.6" fill="#0c1736" opacity="0.16" />

  const art: Record<CategoryId, React.ReactNode> = {
    accommodation: (
      <>
        <defs>
          <linearGradient id={g('roof')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff8a6b" />
            <stop offset="1" stopColor="#e2553f" />
          </linearGradient>
          <linearGradient id={g('wall')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fffaf2" />
            <stop offset="1" stopColor="#f0dfc6" />
          </linearGradient>
          <linearGradient id={g('win')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe9a6" />
            <stop offset="1" stopColor="#ffbf47" />
          </linearGradient>
        </defs>
        {shadow}
        <path d="M11 22h26v17a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" fill={url('wall')} />
        <path d="M11 22h26v3H11z" fill="#d9c3a3" opacity="0.5" />
        <path d="M7.5 23.5 22 10.2a3 3 0 0 1 4 0l14.5 13.3c1 .9.3 2.5-1 2.5h-37c-1.3 0-2-1.6-1-2.5z" fill={url('roof')} />
        <path d="M22 10.2a3 3 0 0 1 4 0l3 2.8L13 22l-2.6-.4z" fill="#fff" opacity="0.28" />
        <rect x="15" y="29" width="7" height="6" rx="1.4" fill={url('win')} />
        <path d="M27 42v-9a2.5 2.5 0 0 1 2.5-2.5h0A2.5 2.5 0 0 1 32 33v9z" fill="#7a4a2d" />
        <rect x="30" y="12" width="4" height="7" rx="1" fill="#c94a37" />
      </>
    ),
    food: (
      <>
        <defs>
          <linearGradient id={g('bowl')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c9d6ef" />
          </linearGradient>
          <linearGradient id={g('soup')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffb547" />
            <stop offset="1" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>
        {shadow}
        <path d="M18 9c-1.6 2 1.6 3.6 0 5.6M24 7c-1.6 2.2 1.6 4 0 6.2M30 9c-1.6 2 1.6 3.6 0 5.6" stroke="#9fb6e0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M7 22h34c0 10.5-7.6 19-17 19S7 32.5 7 22z" fill={url('bowl')} />
        <ellipse cx="24" cy="22" rx="17" ry="4.2" fill={url('soup')} />
        <ellipse cx="18" cy="21.3" rx="3" ry="1.2" fill="#fff4c9" opacity="0.8" />
        <circle cx="28" cy="22" r="1.6" fill="#3fa36b" />
        <circle cx="31.5" cy="21" r="1.2" fill="#3fa36b" />
        <path d="M30 6 38 21M34 5l6 15.5" stroke="#9a6438" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11 27c1.5 5 5 9 9.5 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" fill="none" />
      </>
    ),
    transport: (
      <>
        <defs>
          <linearGradient id={g('body')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5ea2ff" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id={g('glass')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8f3ff" />
            <stop offset="1" stopColor="#a9caf2" />
          </linearGradient>
        </defs>
        {shadow}
        <path d="M9 30.5c0-2 1-3.6 2.8-4.3l3.4-7.2A5 5 0 0 1 19.7 16h8.6a5 5 0 0 1 4.5 3l3.4 7.2c1.8.7 2.8 2.3 2.8 4.3V36a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill={url('body')} />
        <path d="M16.6 26 19 20.6a2 2 0 0 1 1.8-1.2h6.4a2 2 0 0 1 1.8 1.2l2.4 5.4z" fill={url('glass')} />
        <path d="M17.5 24.5 19.6 20.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
        <rect x="11.5" y="29" width="5" height="2.6" rx="1.3" fill="#fff3c2" />
        <rect x="31.5" y="29" width="5" height="2.6" rx="1.3" fill="#fff3c2" />
        <circle cx="15.5" cy="38.5" r="3.6" fill="#1b2340" />
        <circle cx="32.5" cy="38.5" r="3.6" fill="#1b2340" />
        <circle cx="15.5" cy="38.5" r="1.4" fill="#8a96b8" />
        <circle cx="32.5" cy="38.5" r="1.4" fill="#8a96b8" />
        <path d="M12 27.5h24" stroke="#fff" strokeWidth="1" opacity="0.35" />
      </>
    ),
    activities: (
      <>
        <defs>
          <linearGradient id={g('bal')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff5d6c" />
            <stop offset="0.5" stopColor="#ff9a4d" />
            <stop offset="1" stopColor="#ffd25e" />
          </linearGradient>
          <radialGradient id={g('shine')} cx="0.35" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {shadow}
        <path d="M24 4c8.3 0 14 5.7 14 13 0 6.4-5 11.3-9 14.6h-10C15 28.3 10 23.4 10 17 10 9.7 15.7 4 24 4z" fill={url('bal')} />
        <path d="M24 4c-3.4 3.4-5 8.4-5 13.2 0 5.3 1.6 10.6 3.4 14.4M24 4c3.4 3.4 5 8.4 5 13.2 0 5.3-1.6 10.6-3.4 14.4" stroke="#fff" strokeWidth="1.3" opacity="0.55" fill="none" />
        <path d="M24 4c8.3 0 14 5.7 14 13 0 6.4-5 11.3-9 14.6h-10C15 28.3 10 23.4 10 17 10 9.7 15.7 4 24 4z" fill={url('shine')} />
        <path d="M19.4 31.6 20.6 36M28.6 31.6 27.4 36" stroke="#8a5a33" strokeWidth="1.2" />
        <rect x="19.5" y="35.5" width="9" height="6" rx="1.6" fill="#b07642" />
        <path d="M19.5 37.5h9" stroke="#8a5a33" strokeWidth="1" />
      </>
    ),
    shopping: (
      <>
        <defs>
          <linearGradient id={g('bag')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff9ec7" />
            <stop offset="1" stopColor="#e5508f" />
          </linearGradient>
          <linearGradient id={g('side')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9437f" />
            <stop offset="1" stopColor="#b8306a" />
          </linearGradient>
        </defs>
        {shadow}
        <path d="M17 16v-2.5a7 7 0 0 1 14 0V16" stroke="#7a2a4d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M34 16h3.2a2 2 0 0 1 2 1.8l2 21A2 2 0 0 1 39.2 41H34z" fill={url('side')} />
        <path d="M11 16h23v25H9a2 2 0 0 1-2-2.2l2-21A2 2 0 0 1 11 16z" fill={url('bag')} />
        <path d="M12 19h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="17" cy="21.5" r="1.6" fill="#7a2a4d" />
        <circle cx="29" cy="21.5" r="1.6" fill="#7a2a4d" />
      </>
    ),
    flights: (
      <>
        <defs>
          <linearGradient id={g('fus')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eef4ff" />
            <stop offset="1" stopColor="#7c95cb" />
          </linearGradient>
          <linearGradient id={g('tail')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5ea2ff" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {shadow}
        <g transform="rotate(-38 24 24)">
          <path d="M22.5 33 10 38.5v-3.2l12.5-9z" fill="#7f97c9" />
          <path d="M25.5 33 38 38.5v-3.2l-12.5-9z" fill="#7f97c9" />
          <path d="M21.5 24 4 31.5v-4L21.5 16z" fill={url('fus')} stroke="#7f97c9" strokeWidth="0.6" />
          <path d="M26.5 24 44 31.5v-4L26.5 16z" fill="#b9c9ea" />
          <path d="M24 3c2 0 3 2.5 3 6v26c0 4-1.3 8-3 8s-3-4-3-8V9c0-3.5 1-6 3-6z" fill={url('fus')} stroke="#5b76b3" strokeWidth="0.8" />
          <path d="M21.6 38 24 43l2.4-5z" fill={url('tail')} />
          <path d="M22.4 8.5c.4-2.4 1-3.6 1.6-3.6" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22.5 13v18" stroke="#fff" strokeWidth="1" opacity="0.9" />
        </g>
      </>
    ),
    other: (
      <>
        <defs>
          <linearGradient id={g('star')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe27a" />
            <stop offset="1" stopColor="#f5a524" />
          </linearGradient>
        </defs>
        {shadow}
        <path
          d="M24 6.5c.9 0 1.7.5 2.1 1.3l4.1 8.3 9.1 1.3c1.9.3 2.7 2.7 1.3 4l-6.6 6.4 1.6 9c.3 1.9-1.7 3.4-3.4 2.5L24 35.1l-8.2 4.3c-1.7.9-3.7-.6-3.4-2.5l1.6-9-6.6-6.4c-1.4-1.3-.6-3.7 1.3-4l9.1-1.3 4.1-8.3c.4-.8 1.2-1.3 2.1-1.3z"
          fill={url('star')}
        />
        <path d="M24 9.5 20.4 17l-6.6 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" fill="none" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={cx('shrink-0', className)} aria-hidden>
      {art[id]}
    </svg>
  )
}

/** Icon on a soft tile, used in lists. */
export function CategoryTile({ id, size = 44, className }: { id: CategoryId; size?: number; className?: string }) {
  return (
    <span
      className={cx('relative flex shrink-0 items-center justify-center rounded-[14px] bg-well ring-line', className)}
      style={{ width: size, height: size }}
    >
      <CategoryIcon id={id} size={Math.round(size * 0.78)} />
    </span>
  )
}
