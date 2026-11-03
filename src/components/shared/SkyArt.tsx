import { CloudShape } from '../sky/CloudShape'
import { cx } from '../../utils/cx'

/** A small sun resting behind a cloud. Used for empty and error states. */
export function SkyArt({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <div className={cx('relative', className)} style={{ width: size, height: size * 0.72 }} aria-hidden>
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          left: size * 0.46,
          top: size * 0.02,
          background: 'radial-gradient(circle at 40% 38%, #fff8e1 0%, #ffd77a 55%, #ffb547 100%)',
          boxShadow: '0 0 40px 10px rgb(255 200 110 / 0.45)',
        }}
      />
      <span className="absolute" style={{ left: -size * 0.04, top: size * 0.2, animation: 'bob 7s ease-in-out infinite' }}>
        <CloudShape width={size * 0.95} variant={1} />
      </span>
    </div>
  )
}
