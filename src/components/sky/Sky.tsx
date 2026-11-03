import { memo } from 'react'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'
import { SkyParticles } from './SkyParticles'

/** Two soft ridgelines that melt into the mist at the foot of the sky band. */
function Ridges({ soft }: { soft: boolean }) {
  return (
    <svg aria-hidden className={cx('ridges', soft && 'soft')} viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice">
      <path className="ridge-back" d="M0 130 C90 100 150 96 230 112 C310 128 360 82 450 84 C540 86 600 118 690 104 C740 96 780 100 800 104 V260 H0Z" />
      <path className="ridge-far" d="M0 160 C80 138 140 126 220 142 C300 158 370 112 460 116 C550 120 620 150 700 138 C750 130 780 134 800 138 V260 H0Z" />
      <path className="ridge-near" d="M0 198 C90 182 160 170 250 184 C340 198 420 160 510 166 C600 172 680 196 800 180 V260 H0Z" />
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
          <span className="aurora a1" />
          <span className="aurora a2" />
          {!soft ? <span className="aurora a3" /> : null}
          <span className="stars" />
          <span className="stars s2" />
          {!soft ? <span className="shoot" /> : null}
        </>
      ) : null}
      <SkyParticles night={phase === 'night'} soft={soft} />
      <Ridges soft={soft} />
      <span className="mist" />
    </div>
  )
})
