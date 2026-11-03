import { memo } from 'react'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'

/**
 * The sky. A band of light at the top of every screen that fades into the
 * haze the content sits on. Its colour follows the time of day through the
 * phase tokens on <html data-sky>: a sun glow, three soft drifting clouds,
 * and a few stars at night. Sub-screens use the shorter, cloudless `soft` band.
 */
export const Sky = memo(function Sky({ soft = false }: { soft?: boolean }) {
  const { phase } = useSky()
  return (
    <div aria-hidden className={cx('sky-layer', soft && 'soft')}>
      {!soft ? (
        <>
          <span className="cloud c1" />
          <span className="cloud c2" />
          <span className="cloud c3" />
        </>
      ) : null}
      {phase === 'night' ? <span className="stars" /> : null}
    </div>
  )
})
