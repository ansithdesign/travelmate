import { useId } from 'react'
import type { CategoryId } from '../../types'
import { cx } from '../../utils/cx'

/**
 * Soft 3D category icons: rounded objects lit from the top left, a gloss
 * highlight and a gentle ground shadow, drawn as SVG so they stay crisp at any
 * size and follow the app's blue world.
 */
function Art({ id, u }: { id: CategoryId; u: string }) {
  const g = (n: string) => `url(#${u}${n})`
  const grad = (n: string, a: string, b: string) => (
    <linearGradient id={`${u}${n}`} x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  )
  const shadow = <ellipse cx="24" cy="42.5" rx="14" ry="2.2" fill="#0d1b2a" opacity="0.16" />
  switch (id) {
    case 'accommodation':
      return (
        <>
          <defs>
            {grad('a', '#6f9bff', '#3563d6')}
            {grad('b', '#ffffff', '#dbe6ff')}
            {grad('c', '#ff9a8a', '#ee5f73')}
          </defs>
          {shadow}
          <rect x="5" y="11" width="7" height="27" rx="3.5" fill={g('a')} />
          <rect x="5" y="27" width="38" height="11" rx="4" fill={g('a')} />
          <rect x="9" y="19" width="32" height="11" rx="4.5" fill={g('b')} />
          <rect x="12" y="15" width="11" height="8" rx="4" fill="#fff" />
          <rect x="22" y="21" width="19" height="9" rx="3.5" fill={g('c')} />
          <rect x="7" y="36" width="5" height="4" rx="2" fill="#2a4aa8" />
          <rect x="36" y="36" width="5" height="4" rx="2" fill="#2a4aa8" />
          <ellipse cx="16" cy="17" rx="3.5" ry="1.4" fill="#fff" opacity="0.7" />
        </>
      )
    case 'food':
      return (
        <>
          <defs>
            {grad('a', '#ffe08a', '#f5a524')}
            {grad('b', '#ffffff', '#c9d4ea')}
          </defs>
          {shadow}
          <path d="M6 32 C6 18 14 10 24 10 C34 10 42 18 42 32 Z" fill={g('a')} />
          <rect x="3" y="31" width="42" height="6" rx="3" fill={g('b')} />
          <circle cx="24" cy="8.5" r="3" fill={g('b')} />
          <path d="M11 27 C11 20 15 15 21 13.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </>
      )
    case 'transport':
      return (
        <>
          <defs>
            {grad('a', '#7aa6ff', '#3563d6')}
            {grad('b', '#ffffff', '#cfe0ff')}
          </defs>
          {shadow}
          <path d="M5 30 C5 26 7 24 10 23 L14 15 C15 13 17 12 19 12 H30 C32 12 34 13 35 15 L39 23 C42 24 43 26 43 30 V34 H5 Z" fill={g('a')} />
          <path d="M16 16 H31 L34.5 23 H12.5 Z" fill={g('b')} />
          <rect x="22.5" y="16" width="2" height="7" fill="#7aa6ff" opacity="0.7" />
          <circle cx="13" cy="35" r="5" fill="#243553" />
          <circle cx="35" cy="35" r="5" fill="#243553" />
          <circle cx="13" cy="35" r="2" fill="#aab8d4" />
          <circle cx="35" cy="35" r="2" fill="#aab8d4" />
          <rect x="39" y="26" width="4" height="3" rx="1.5" fill="#ffe08a" />
          <ellipse cx="15" cy="27" rx="5" ry="1.4" fill="#fff" opacity="0.5" />
        </>
      )
    case 'activities':
      return (
        <>
          <defs>{grad('a', '#ffd666', '#ff9533')}</defs>
          {shadow}
          <g transform="rotate(-10 24 24)">
            <path d="M6 12 H42 V19 A4 4 0 0 0 42 27 V34 H6 V27 A4 4 0 0 0 6 19 Z" fill={g('a')} />
            <line x1="32" y1="13" x2="32" y2="33" stroke="#fff" strokeWidth="1.6" strokeDasharray="2.4 2.4" opacity="0.85" />
            <path d="M19 17.5 L21 21.5 L25.4 22 L22.2 25 L23 29.4 L19 27.2 L15 29.4 L15.8 25 L12.6 22 L17 21.5 Z" fill="#fff" />
            <rect x="9" y="13.5" width="14" height="2.4" rx="1.2" fill="#fff" opacity="0.5" />
          </g>
        </>
      )
    case 'shopping':
      return (
        <>
          <defs>{grad('a', '#ff9cc2', '#e5457f')}</defs>
          {shadow}
          <path d="M16 17 C16 11 19.5 8 24 8 C28.5 8 32 11 32 17" fill="none" stroke="#c63468" strokeWidth="3" strokeLinecap="round" />
          <path d="M9 17 H39 L41.5 37 C41.7 39.5 40 41 37.5 41 H10.5 C8 41 6.3 39.5 6.5 37 Z" fill={g('a')} />
          <circle cx="17" cy="23" r="2" fill="#fff" opacity="0.9" />
          <circle cx="31" cy="23" r="2" fill="#fff" opacity="0.9" />
          <path d="M12 22 C12 29 14 33 17 35" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        </>
      )
    case 'flights':
      return (
        <>
          <defs>
            {grad('a', '#7fe3f0', '#1fa7c9')}
            {grad('b', '#d9fbff', '#8edcea')}
          </defs>
          <ellipse cx="26" cy="43" rx="11" ry="1.8" fill="#0d1b2a" opacity="0.14" />
          <path d="M5 21 L43 7 L31 40 L22 29 Z" fill={g('b')} />
          <path d="M22 29 L43 7 L25 33 Z" fill={g('a')} />
          <path d="M22 29 L25 33 L24 40 Z" fill="#1688a6" />
          <path d="M9 21 L33 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        </>
      )
    default:
      return (
        <>
          <defs>
            {grad('a', '#b8a6ff', '#6a55e0')}
            {grad('b', '#ffe08a', '#f5a524')}
          </defs>
          {shadow}
          <path d="M22 5 C23 15 26 19 38 21 C26 23 23 27 22 38 C21 27 18 23 6 21 C18 19 21 15 22 5 Z" fill={g('a')} />
          <path d="M37 27 C37.4 31 38.6 32.4 42 33 C38.6 33.6 37.4 35 37 39 C36.6 35 35.4 33.6 32 33 C35.4 32.4 36.6 31 37 27 Z" fill={g('b')} />
          <path d="M20 12 C20.6 16 22 18 26 19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </>
      )
  }
}

/** A 3D category icon with no container. */
export function CategoryIcon({ id, size = 24, className }: { id: CategoryId; size?: number; className?: string }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={cx('shrink-0', className)}>
      <Art id={id} u={u} />
    </svg>
  )
}

/**
 * The 3D icon at list size. Unselected it stands free; selected it sits in a
 * soft accent pad so the choice is clear without a heavy outline.
 */
export function CategoryTile({ id, size = 36, className, selected }: { id: CategoryId; size?: number; className?: string; selected?: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-[28%] transition-[background-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)]',
        selected ? 'scale-105 bg-accent-soft shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_45%,transparent)]' : 'bg-well',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <CategoryIcon id={id} size={Math.round(size * 0.86)} />
    </span>
  )
}
