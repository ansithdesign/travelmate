import { useEffect, useRef } from 'react'

interface Flake {
  x: number
  y: number
  r: number
  v: number
  amp: number
  ph: number
  hz: number
  a: number
}

/**
 * Slow drifting particles over the sky: soft snow by day, faint violet stardust
 * at night. A few dozen soft dots, fading out as they near the bottom of the
 * band, so the sky feels alive without competing with the content. Paused when
 * the tab is hidden and drawn once, still, for people who prefer reduced motion.
 */
export function SkyParticles({ night, soft }: { night: boolean; soft: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()
    let flakes: Flake[] = []

    const make = (fresh: boolean): Flake => ({
      x: Math.random() * w,
      y: fresh ? Math.random() * h : -10,
      r: 0.8 + Math.random() * (night ? 1.6 : 2.4),
      v: (night ? 5 : 9) + Math.random() * (night ? 10 : 20),
      amp: 6 + Math.random() * 16,
      ph: Math.random() * Math.PI * 2,
      hz: 0.25 + Math.random() * 0.45,
      a: (night ? 0.25 : 0.4) + Math.random() * (night ? 0.45 : 0.5),
    })

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(70, (w * h) / (soft ? 7000 : 5200)) * (night ? 0.7 : 1))
      flakes = Array.from({ length: n }, () => make(true))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const f of flakes) {
        const x = f.x + Math.sin(t * f.hz + f.ph) * f.amp
        // fade in at the top, dissolve toward the bottom of the band
        const edge = Math.min(1, f.y / 40) * Math.max(0, 1 - f.y / (h * 0.92))
        const alpha = f.a * edge
        if (alpha <= 0.01) continue
        if (f.r > 1.8) {
          const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r * 2.2)
          g.addColorStop(0, night ? `rgba(236,222,255,${alpha})` : `rgba(255,255,255,${alpha})`)
          g.addColorStop(1, night ? 'rgba(236,222,255,0)' : 'rgba(255,255,255,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, f.y, f.r * 2.2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = night ? `rgba(236,222,255,${alpha})` : `rgba(255,255,255,${alpha})`
          ctx.beginPath()
          ctx.arc(x, f.y, f.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      for (const f of flakes) {
        f.y += f.v * dt
        if (f.y > h) Object.assign(f, make(false), { x: Math.random() * w })
      }
      draw(now / 1000)
      raf = requestAnimationFrame(tick)
    }

    resize()
    if (still) {
      draw(0)
    } else {
      raf = requestAnimationFrame(tick)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !still) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
    }
  }, [night, soft])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />
}
