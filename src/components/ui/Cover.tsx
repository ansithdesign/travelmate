import { useState } from 'react'
import type { Photo } from '../../types'
import { cx } from '../../utils/cx'
import { Scene } from '../sky/Scene'
import { useSky } from '../../store/sky'

// What you see through the window follows the sky you are under.
/**
 * A photo with a sky fallback. If the image is missing or fails, you see what a
 * soft sky with a passing cloud instead. Never a broken icon.
 */
export function Cover({
  photo,
  className,
  imgClassName,
  eager,
  showCredit,
  seed = 0,
}: {
  photo?: Photo
  className?: string
  imgClassName?: string
  eager?: boolean
  showCredit?: boolean
  /** Varies the fallback sky so neighbouring tiles differ */
  seed?: number
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { phase } = useSky()
  const show = !!photo?.src && !failed
  // Each photo id paints its own scene, so neighbouring tiles differ.
  let h = seed * 7919
  for (const c of photo?.id ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  const sceneSeed = (h % 997) + seed

  return (
    <div className={cx('relative overflow-hidden', className)}>
      <div aria-hidden className={cx('absolute inset-0 transition-opacity duration-700', show && loaded ? 'opacity-0' : 'opacity-100')}>
        <Scene phase={phase} seed={sceneSeed} />
      </div>
      {show ? (
        <img
          src={photo.src}
          alt={photo.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cx('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      ) : null}
      {showCredit && loaded && !failed && photo?.credit ? (
        <span className="absolute right-2 bottom-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">{photo.credit}</span>
      ) : null}
    </div>
  )
}

/** A trip photo as a clean rounded card with a hairline edge and soft depth. */
export function PhotoCard({
  photo,
  className,
  seed = 0,
  eager,
  radius = 24,
  children,
}: {
  photo?: Photo
  className?: string
  seed?: number
  eager?: boolean
  radius?: number
  children?: React.ReactNode
}) {
  return (
    <div
      className={cx('relative overflow-hidden shadow-[var(--shadow-soft)]', className)}
      style={{ borderRadius: radius }}
    >
      <Cover photo={photo} seed={seed} eager={eager} className="absolute inset-0" />
      {children}
    </div>
  )
}
