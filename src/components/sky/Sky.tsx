import { memo } from 'react'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'

/** Two soft ridgelines that melt into the mist at the foot of the sky band. */
function Ridges({ soft }: { soft: boolean }) {
  return (
    <svg aria-hidden className={cx('ridges', soft && 'soft')} viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice">
      <path className="ridge-far" d="M0 150 C60 120 90 100 140 110 C190 120 220 80 280 60 C330 44 360 70 410 96 C460 120 500 84 560 66 C620 50 660 90 720 108 C760 118 780 112 800 104 V260 H0Z" />
      <path className="ridge-near" d="M0 190 C70 170 120 150 180 160 C250 172 290 130 350 120 C420 110 450 150 520 152 C590 154 640 118 700 124 C750 130 780 150 800 156 V260 H0Z" />
    </svg>
  )
}

/**
 * The sky band: a painted gradient with a glowing sun (a moon at night),
 * soft drifting clouds, layered mountain ridges and mist that dissolve into
 * the haze the content sits on. Sub-screens use the shorter cloudless band.
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
      {phase === 'night' ? (
        <>
          <span className="stars" />
          <span className="stars s2" />
          {!soft ? <span className="shoot" /> : null}
        </>
      ) : null}
      <Ridges soft={soft} />
      <span className="mist" />
    </div>
  )
})
