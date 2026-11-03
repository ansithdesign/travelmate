import { useEffect, useId, useRef, useState } from 'react'
import { AirplaneLanding, AirplaneTakeoff } from '@phosphor-icons/react'

/**
 * The places of a trip drawn as a winding flight route. Stops run left to right,
 * turn at the edge and come back, like a path on a map, with take-off and
 * landing at the ends and a contrail that draws itself in.
 */
export function RouteMap({ places }: { places: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(340)
  const u = useId().replace(/:/g, '')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cols = w < 420 ? 3 : w < 640 ? 4 : 5
  const rowH = 96
  const padX = 40
  const top = 26
  const pts = places.map((_, i) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    const step = (w - padX * 2) / (cols - 1)
    const x = r % 2 === 0 ? padX + c * step : w - padX - c * step
    return { x, y: top + r * rowH }
  })
  const rows = Math.ceil(places.length / cols)
  const h = top + (rows - 1) * rowH + 64

  let d = ''
  pts.forEach((p, i) => {
    if (i === 0) {
      d = `M ${p.x} ${p.y}`
      return
    }
    const a = pts[i - 1]
    if (a.y === p.y) {
      // Gentle wave between stops on the same row
      const mx = (a.x + p.x) / 2
      d += ` Q ${mx} ${p.y + (i % 2 ? -16 : 16)} ${p.x} ${p.y}`
    } else {
      // U-turn at the edge
      const out = a.x > w / 2 ? 30 : -30
      d += ` C ${a.x + out} ${a.y} ${p.x + out} ${p.y} ${p.x} ${p.y}`
    }
  })

  return (
    <div ref={ref} className="panel relative overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,rgb(96_165_250/0.12),rgb(255_190_150/0.12))]" style={{ height: h }}>
      <svg width={w} height={h} className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id={`${u}c`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#f59e8b" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke={`url(#${u}c)`} strokeWidth="6" strokeLinecap="round" opacity="0.18" />
        <path
          d={d}
          fill="none"
          stroke={`url(#${u}c)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="5 7"
          pathLength={1000}
          style={{ animation: 'fade-in 900ms var(--ease-out-expo) both' }}
        />
        {pts.slice(1, -1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="6" className="fill-panel-strong" stroke="#3b82f6" strokeWidth="3" />
        ))}
      </svg>
      {pts.length ? (
        <>
          <Badge x={pts[0].x} y={pts[0].y} icon="takeoff" />
          {pts.length > 1 ? <Badge x={pts[pts.length - 1].x} y={pts[pts.length - 1].y} icon="landing" /> : null}
        </>
      ) : null}
      <ol className="absolute inset-0">
        {places.map((p, i) => {
          const lw = Math.min(110, (w - padX * 2) / (cols - 1) - 6)
          // Keep every label inside the card, even at the turns.
          const left = Math.min(Math.max(pts[i].x, lw / 2 + 10), w - lw / 2 - 10)
          return (
          <li
            key={p + i}
            className="absolute -translate-x-1/2 text-center text-caption leading-[15px] font-semibold text-ink"
            style={{ left, top: pts[i].y + 18, width: lw }}
          >
            <span className="line-clamp-2">{p}</span>
          </li>
          )
        })}
      </ol>
    </div>
  )
}

function Badge({ x, y, icon }: { x: number; y: number; icon: 'takeoff' | 'landing' }) {
  return (
    <span
      aria-hidden
      className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4f8dff,#2563eb)] text-white shadow-[0_6px_14px_-6px_rgb(37_99_235/0.9),inset_0_1px_0_rgb(255_255_255/0.35)]"
      style={{ left: x, top: y }}
    >
      {icon === 'takeoff' ? <AirplaneTakeoff size={17} weight="fill" /> : <AirplaneLanding size={17} weight="fill" />}
    </span>
  )
}
