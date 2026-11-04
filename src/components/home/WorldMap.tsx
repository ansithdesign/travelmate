import { memo } from 'react'
import { WORLD, WORLD_DOTS } from '../../data/worldDots'

export interface MapView {
  s: number
  cx: number
  cy: number
  w: number
  h: number
}

/** A view that frames the given places, never tighter than `minSpan` degrees of longitude. */
export function fitView(pts: { lat: number; lon: number }[], w: number, h: number, pad = 16, minSpan = 110): MapView {
  if (pts.length === 0) return { s: w / 360, cx: 10, cy: 20, w, h }
  const lons = pts.map((p) => p.lon)
  const lats = pts.map((p) => p.lat)
  const minL = Math.min(...lons)
  const maxL = Math.max(...lons)
  const minA = Math.min(...lats)
  const maxA = Math.max(...lats)
  const spanL = Math.max(maxL - minL + pad * 2, minSpan)
  const spanA = Math.max(maxA - minA + pad * 1.6, (minSpan * h) / w)
  return { s: Math.min(w / spanL, h / spanA), cx: (minL + maxL) / 2, cy: (minA + maxA) / 2, w, h }
}

export function project(v: MapView, lon: number, lat: number): [number, number] {
  return [(lon - v.cx) * v.s + v.w / 2, (v.cy - lat) * v.s + v.h / 2]
}

/** The land of the world as a field of small dots, framed to the view. */
export const DotMap = memo(function DotMap({ view }: { view: MapView }) {
  const r = Math.max(1.2, Math.min(3.4, WORLD.step * view.s * 0.36))
  const dots: React.ReactNode[] = []
  for (let i = 0; i < WORLD_DOTS.length; i++) {
    const [x, y] = project(view, WORLD_DOTS[i][0], WORLD_DOTS[i][1])
    if (x < -3 || x > view.w + 3 || y < -3 || y > view.h + 3) continue
    dots.push(<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} />)
  }
  return (
    <svg aria-hidden width={view.w} height={view.h} className="absolute inset-0" fill="white" fillOpacity="0.55">
      {dots}
    </svg>
  )
})
