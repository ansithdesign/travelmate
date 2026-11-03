import { useState } from 'react'
import type { Photo } from '../../types'
import { cx } from '../../utils/cx'

/**
 * Photo with a designed fallback. If the image is missing or fails to load,
 * the destination name is set on a stone field so the layout never shows a
 * broken-image icon.
 */
export function Cover({
  photo,
  fallbackLabel,
  className,
  imgClassName,
  sizes,
  eager,
  showCredit,
}: {
  showCredit?: boolean
  photo?: Photo
  fallbackLabel: string
  className?: string
  imgClassName?: string
  sizes?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const show = photo?.src && !failed

  return (
    <div className={cx('relative overflow-hidden bg-[#dcd6c9]', className)}>
      {/* Fallback layer, visible until the photo has loaded */}
      <div
        aria-hidden
        className={cx(
          'absolute inset-0 flex items-end justify-end bg-[linear-gradient(160deg,#e5e0d4_0%,#d2cab9_100%)] p-4 transition-opacity duration-500',
          show && loaded ? 'opacity-0' : 'opacity-100',
        )}
      >
        <svg className="absolute inset-0 h-full w-full opacity-[0.22]" preserveAspectRatio="none" viewBox="0 0 400 200">
          <path d="M0 150 C 80 120, 140 170, 220 135 S 340 110, 400 128" fill="none" stroke="#1f5a43" strokeWidth="1.2" />
          <path d="M0 168 C 90 140, 150 188, 230 155 S 340 132, 400 148" fill="none" stroke="#1f5a43" strokeWidth="1" />
          <path d="M0 186 C 100 160, 160 200, 240 175 S 350 155, 400 168" fill="none" stroke="#1f5a43" strokeWidth="0.8" />
        </svg>
        <span className="relative line-clamp-2 text-right text-[clamp(1.25rem,6cqw,2rem)] leading-tight font-semibold tracking-[-0.03em] text-forest-900/55">
          {fallbackLabel}
        </span>
      </div>
      {show ? (
        <img
          src={photo.src}
          alt={photo.alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cx(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      ) : null}
      {showCredit && loaded && !failed && photo?.credit ? (
        <span className="absolute right-2 bottom-2 rounded-[6px] bg-black/45 px-1.5 py-0.5 text-[10px] text-white/90">{photo.credit}</span>
      ) : null}
    </div>
  )
}
