import { useState } from 'react'
import type { Photo } from '../../types'
import { cx } from '../../utils/cx'
import { CloudShape } from '../sky/Sky'

const SKIES = [
  'linear-gradient(180deg,#2f78e6 0%,#7ab6f6 60%,#d5ebff 100%)',
  'linear-gradient(180deg,#5c5fc6 0%,#d590b4 60%,#ffc89a 100%)',
  'linear-gradient(180deg,#1f63d6 0%,#5aa0f0 55%,#bfe0ff 100%)',
  'linear-gradient(180deg,#4b66bd 0%,#c79ad0 60%,#ffd9b8 100%)',
]

/**
 * A photo with a sky fallback. If the image is missing or fails, you see what a
 * window seat shows anyway: open sky and a passing cloud. Never a broken icon.
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
  const show = !!photo?.src && !failed
  // Derive the fallback sky from the photo id so each window shows its own clouds.
  let h = seed * 7919
  for (const c of photo?.id ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  const r = (n: number) => ((h >>> (n * 3)) % 1000) / 1000
  const skyIdx = (h + seed) % SKIES.length
  const a = { top: 8 + r(1) * 30, left: -18 + r(2) * 30, w: 120 + r(3) * 70, v: h % 3 }
  const b = { bottom: 4 + r(4) * 26, right: -26 + r(5) * 28, w: 150 + r(6) * 80, v: (h >>> 2) % 3 }

  return (
    <div className={cx('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className={cx('absolute inset-0 transition-opacity duration-700', show && loaded ? 'opacity-0' : 'opacity-100')}
        style={{ background: SKIES[skyIdx] }}
      >
        <div className="absolute" style={{ top: `${a.top}%`, left: `${a.left}%`, animation: `bob ${6 + r(7) * 4}s ease-in-out ${-r(8) * 6}s infinite` }}>
          <CloudShape width={a.w} variant={a.v} />
        </div>
        <div className="absolute opacity-85" style={{ bottom: `${b.bottom}%`, right: `${b.right}%`, animation: `bob ${8 + r(9) * 4}s ease-in-out ${-r(10) * 6}s infinite` }}>
          <CloudShape width={b.w} variant={b.v} />
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

/**
 * The signature frame: an aircraft cabin window. Moulded bezel, inner reveal
 * shadow, a glint on the acrylic and a half-drawn shade that slides down on mount.
 */
export function Window({
  photo,
  className,
  seed = 0,
  eager,
  shade = 0.16,
  children,
}: {
  photo?: Photo
  className?: string
  seed?: number
  eager?: boolean
  /** How far the shade is drawn, 0 to 1 */
  shade?: number
  children?: React.ReactNode
}) {
  return (
    <div
      className={cx(
        'relative rounded-[42%/32%]',
        'bg-[linear-gradient(160deg,#ffffff_0%,#edf1f9_45%,#cfd8ea_100%)]',
        'shadow-[inset_0_2px_0_rgb(255_255_255/0.95),inset_0_-3px_6px_rgb(12_23_54/0.12),0_22px_44px_-20px_rgb(8_20_60/0.6),0_2px_6px_rgb(8_20_60/0.12)]',
        className,
      )}
    >
      {/* Inset is relative to the window itself, so the bezel scales with any size */}
      <div className="absolute inset-x-[8%] inset-y-[6.4%] overflow-hidden rounded-[40%/30%] shadow-[inset_0_0_0_2px_rgb(12_23_54/0.08)]">
        <Cover photo={photo} seed={seed} eager={eager} className="absolute inset-0" />
        {shade > 0 ? (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#f6f8fc_0%,#e6ebf4_85%,#cdd5e5_100%)] shadow-[0_3px_8px_rgb(12_23_54/0.2)] [animation:shade_1100ms_var(--ease-out-expo)_both]"
            style={{ height: `${shade * 100}%` }}
          >
            <span className="absolute bottom-[22%] left-1/2 h-[3px] w-[22%] -translate-x-1/2 rounded-full bg-[#b8c2d6]" />
          </div>
        ) : null}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[40%/30%] shadow-[inset_0_8px_18px_rgb(12_23_54/0.3),inset_0_-2px_10px_rgb(255_255_255/0.2)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.24)_41%,transparent_52%)]" />
        {children}
      </div>
    </div>
  )
}
