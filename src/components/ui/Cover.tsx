import { useState } from 'react'
import type { Photo } from '../../types'
import { cx } from '../../utils/cx'
import { CloudShape } from '../sky/CloudShape'
import { useSky, type SkyPhase } from '../../store/sky'

// What you see through the window follows the sky you are under.
const SKIES: Record<SkyPhase, string[]> = {
  dawn: ['linear-gradient(180deg,#6fa6e3 0%,#b9d3f0 55%,#f7d7c0 100%)', 'linear-gradient(180deg,#7aaee6 0%,#c5daf2 60%,#fbe2cf 100%)'],
  day: ['linear-gradient(180deg,#3f95e6 0%,#8cc6f3 60%,#d6ebfa 100%)', 'linear-gradient(180deg,#4a9be6 0%,#a6d3f6 60%,#e2f0fb 100%)'],
  golden: ['linear-gradient(180deg,#646fcf 0%,#b79ad8 55%,#f4bfb0 100%)', 'linear-gradient(180deg,#6f78d3 0%,#c3a6dc 60%,#f6c9b8 100%)'],
  night: ['linear-gradient(180deg,#070f26 0%,#0e1d42 60%,#15295a 100%)', 'linear-gradient(180deg,#0a1430 0%,#13244f 60%,#1d3266 100%)'],
}
const CLOUD: Record<SkyPhase, [string, string, number]> = {
  dawn: ['#fff6f4', '#e6c3d6', 0.95],
  day: ['#ffffff', '#cfe0f5', 1],
  golden: ['#fff0e8', '#e6a7b4', 0.95],
  night: ['#6a73a6', '#2b3468', 0.55],
}

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
  // Derive the fallback sky from the photo id so each window shows its own clouds.
  let h = seed * 7919
  for (const c of photo?.id ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  const r = (n: number) => ((h >>> (n * 3)) % 1000) / 1000
  const skies = SKIES[phase]
  const skyIdx = (h + seed) % skies.length
  const [ct, cb, co] = CLOUD[phase]
  const a = { top: 8 + r(1) * 30, left: -18 + r(2) * 30, w: 120 + r(3) * 70, v: h % 3 }
  const b = { bottom: 4 + r(4) * 26, right: -26 + r(5) * 28, w: 150 + r(6) * 80, v: (h >>> 2) % 3 }

  return (
    <div className={cx('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className={cx('absolute inset-0 transition-opacity duration-700', show && loaded ? 'opacity-0' : 'opacity-100')}
        style={{ background: skies[skyIdx] }}
      >
        {phase === 'night'
          ? Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className="absolute size-[2px] rounded-full bg-white"
                style={{ left: `${(r(i + 11) * 100 + i * 37) % 100}%`, top: `${(r(i + 3) * 70 + i * 13) % 70}%`, animation: `twinkle ${2 + (i % 4)}s ease-in-out ${-i * 0.7}s infinite` }}
              />
            ))
          : null}
        <div className="absolute" style={{ opacity: co, top: `${a.top}%`, left: `${a.left}%`, animation: `bob ${6 + r(7) * 4}s ease-in-out ${-r(8) * 6}s infinite` }}>
          <CloudShape width={a.w} variant={a.v} top={ct} belly={cb} />
        </div>
        <div className="absolute" style={{ opacity: co * 0.85, bottom: `${b.bottom}%`, right: `${b.right}%`, animation: `bob ${8 + r(9) * 4}s ease-in-out ${-r(10) * 6}s infinite` }}>
          <CloudShape width={b.w} variant={b.v} top={ct} belly={cb} />
        </div>
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
