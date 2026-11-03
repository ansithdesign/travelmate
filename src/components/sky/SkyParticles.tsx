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

interface Star {
  x: number
  y: number
  r: number
  ph: number
  hz: number
  a: number
}
interface Shoot {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  len: number
}

/**
 * Life in the sky: soft drifting snow by day; at night, twinkling stars with
 * the odd shooting star. A few dozen soft dots that dissolve toward the bottom
 * of the band, so the sky feels alive without competing with the content.
 * Paused when the tab is hidden and drawn once, still, for people who prefer
 * reduced motion.
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
    let stars: Star[] = []
    let shoots: Shoot[] = []
    let nextShoot = 2 + Math.random() * 3
    let clock = 0

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
      flakes = night ? [] : Array.from({ length: n }, () => make(true))
      const m = Math.round(Math.min(90, (w * h) / (soft ? 3200 : 2600)))
      stars = night
        ? Array.from({ length: m }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.78, r: 0.5 + Math.random() * 1.3, ph: Math.random() * 6.28, hz: 0.6 + Math.random() * 1.8, a: 0.35 + Math.random() * 0.6 }))
        : []
    }

    const drawNight = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const st of stars) {
        const fade = Math.max(0, 1 - st.y / (h * 0.82))
        const tw = 0.55 + 0.45 * Math.sin(t * st.hz + st.ph)
        const alpha = st.a * tw * fade
        if (alpha < 0.02) continue
        ctx.fillStyle = `rgba(240,232,255,${alpha})`
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
        if (st.r > 1.4) {
          ctx.strokeStyle = `rgba(240,232,255,${alpha * 0.45})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(st.x - st.r * 3, st.y)
          ctx.lineTo(st.x + st.r * 3, st.y)
          ctx.moveTo(st.x, st.y - st.r * 3)
          ctx.lineTo(st.x, st.y + st.r * 3)
          ctx.stroke()
        }
      }
      for (const sh of shoots) {
        const p = sh.life
        const a = Math.sin(Math.min(1, p) * Math.PI)
        const tx = sh.x - sh.vx * 0.12
        const ty = sh.y - sh.vy * 0.12
        const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty)
        g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`)
        g.addColorStop(1, 'rgba(200,170,255,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(sh.x, sh.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.beginPath()
        ctx.arc(sh.x, sh.y, 1.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const draw = (t: number) => {
      if (night) return drawNight(t)
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
      if (night) {
        clock += dt
        if (clock > nextShoot) {
          clock = 0
          nextShoot = 4 + Math.random() * 6
          const fromLeft = Math.random() > 0.35
          const sp = 420 + Math.random() * 220
          const ang = (18 + Math.random() * 18) * (Math.PI / 180)
          shoots.push({ x: fromLeft ? Math.random() * w * 0.5 : w * (0.5 + Math.random() * 0.5), y: 20 + Math.random() * h * 0.28, vx: Math.cos(ang) * sp * (fromLeft ? 1 : -1), vy: Math.sin(ang) * sp, life: 0, len: 0 })
        }
        for (const sh of shoots) {
          sh.x += sh.vx * dt
          sh.y += sh.vy * dt
          sh.life += dt / 0.9
        }
        shoots = shoots.filter((sh) => sh.life < 1)
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
