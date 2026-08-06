import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

type V3 = [number, number, number]

/**
 * HUD threat globe — the hero centerpiece. A rotating dotted sphere wrapped in
 * a heads-up display: a radar sweep, an outer tick ring, rotating dashed arcs
 * (blue + a red segment), pulsing red threat blips and live attack arcs with
 * traveling pulses. Pure canvas, sized to its container. Under reduced-motion
 * it renders a single static frame (no rotation, sweep or arcs).
 */
export function ThreatGlobe({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const g = canvas.getContext("2d")
    if (!g) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    let W = 0
    let H = 0
    let raf = 0
    let rot = 0
    let sweep = 0

    const N = 760
    const pts: V3[] = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const th = Math.PI * (3 - Math.sqrt(5)) * i
      pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad])
    }
    const reds: V3[] = Array.from({ length: 7 }, () => pts[(Math.random() * N) | 0])

    const rotY = (p: V3, a: number): V3 => {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
    }
    const tilt = (p: V3, a: number): V3 => {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
    }
    const slerp = (a: V3, b: V3, t: number): V3 => {
      let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
      d = Math.max(-1, Math.min(1, d))
      const om = Math.acos(d)
      if (om < 1e-4) return a
      const so = Math.sin(om)
      const s0 = Math.sin((1 - t) * om) / so
      const s1 = Math.sin(t * om) / so
      return [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1]
    }

    interface Arc {
      a: V3
      b: V3
      t: number
    }
    const arcs: Arc[] = []
    const spawn = () =>
      arcs.push({ a: pts[(Math.random() * N) | 0], b: pts[(Math.random() * N) | 0], t: 0 })
    for (let k = 0; k < 5; k++) spawn()

    const TILT = -0.42
    const LIFT = 0.45

    const size = () => {
      const r = canvas.getBoundingClientRect()
      W = canvas.width = Math.max(1, Math.floor(r.width * DPR))
      H = canvas.height = Math.max(1, Math.floor(r.height * DPR))
      if (reduced) draw()
    }

    const ring = (
      cx: number,
      cy: number,
      rr: number,
      a0: number,
      a1: number,
      col: string,
      lw: number,
      dash: number[] | null,
    ) => {
      g.save()
      if (dash) g.setLineDash(dash)
      g.strokeStyle = col
      g.lineWidth = lw * DPR
      g.beginPath()
      g.arc(cx, cy, rr, a0, a1)
      g.stroke()
      g.restore()
    }

    const draw = () => {
      const CX = W / 2
      const CY = H / 2
      const R = Math.min(W, H) * 0.3
      g.clearRect(0, 0, W, H)
      if (!reduced) {
        rot += 0.0018
        sweep += 0.02
      }

      // radar sweep wedge, clipped to the globe
      if (!reduced && g.createConicGradient) {
        g.save()
        g.beginPath()
        g.arc(CX, CY, R * 0.99, 0, Math.PI * 2)
        g.clip()
        const cg = g.createConicGradient(sweep, CX, CY)
        cg.addColorStop(0, "rgba(77,124,255,0.22)")
        cg.addColorStop(0.08, "rgba(77,124,255,0)")
        cg.addColorStop(1, "rgba(77,124,255,0)")
        g.fillStyle = cg
        g.beginPath()
        g.arc(CX, CY, R, 0, Math.PI * 2)
        g.fill()
        g.restore()
      }

      // sphere dots
      for (let i = 0; i < N; i++) {
        const p = tilt(rotY(pts[i], rot), TILT)
        const z = p[2]
        const front = z > 0
        const al = front ? 0.22 + z * 0.5 : 0.05 + (z + 1) * 0.045
        const sz = (front ? 1.0 + z * 1.0 : 0.7) * DPR
        g.fillStyle = `rgba(150,180,240,${al})`
        g.beginPath()
        g.arc(CX + p[0] * R, CY - p[1] * R, sz, 0, Math.PI * 2)
        g.fill()
      }

      // rim glow
      const gr = g.createRadialGradient(CX, CY, R * 0.6, CX, CY, R * 1.12)
      gr.addColorStop(0, "rgba(77,124,255,0)")
      gr.addColorStop(1, "rgba(77,124,255,0.1)")
      g.fillStyle = gr
      g.beginPath()
      g.arc(CX, CY, R * 1.12, 0, Math.PI * 2)
      g.fill()

      // red threat blips
      for (let m = 0; m < reds.length; m++) {
        const pe = tilt(rotY(reds[m], rot), TILT)
        if (pe[2] >= 0) {
          const ex = CX + pe[0] * R
          const ey = CY - pe[1] * R
          const pulse = Math.sin(sweep * 2 + m) * 0.5 + 0.5
          g.fillStyle = "#ff5c7a"
          g.beginPath()
          g.arc(ex, ey, 2.2 * DPR, 0, Math.PI * 2)
          g.fill()
          g.strokeStyle = `rgba(255,92,122,${0.5 * (1 - pulse)})`
          g.lineWidth = DPR
          g.beginPath()
          g.arc(ex, ey, (3 + pulse * 7) * DPR, 0, Math.PI * 2)
          g.stroke()
        }
      }

      // attack arcs
      if (!reduced) {
        for (let mm = arcs.length - 1; mm >= 0; mm--) {
          const ar = arcs[mm]
          ar.t += 0.006
          if (ar.t >= 1) {
            arcs.splice(mm, 1)
            spawn()
            continue
          }
          const st = 40
          let pv: [number, number] | null = null
          let drew = false
          g.beginPath()
          for (let s = 0; s <= st; s++) {
            const tt = s / st
            const q = slerp(ar.a, ar.b, tt)
            const h2 = 1 + LIFT * Math.sin(Math.PI * tt)
            const pp = tilt(rotY([q[0] * h2, q[1] * h2, q[2] * h2], rot), TILT)
            if (pp[2] < -0.15) {
              pv = null
              continue
            }
            const x = CX + pp[0] * R
            const y = CY - pp[1] * R
            if (pv) {
              g.moveTo(pv[0], pv[1])
              g.lineTo(x, y)
              drew = true
            }
            pv = [x, y]
          }
          if (drew) {
            g.strokeStyle = `rgba(124,160,255,${0.6 * Math.sin(Math.PI * ar.t)})`
            g.lineWidth = 1.4 * DPR
            g.stroke()
          }
          const tp = slerp(ar.a, ar.b, ar.t)
          const hh = 1 + LIFT * Math.sin(Math.PI * ar.t)
          const p2 = tilt(rotY([tp[0] * hh, tp[1] * hh, tp[2] * hh], rot), TILT)
          if (p2[2] >= -0.15) {
            g.fillStyle = "#7ca0ff"
            g.shadowColor = "#4d7cff"
            g.shadowBlur = 10 * DPR
            g.beginPath()
            g.arc(CX + p2[0] * R, CY - p2[1] * R, 2.4 * DPR, 0, Math.PI * 2)
            g.fill()
            g.shadowBlur = 0
          }
        }
      }

      // ===== HUD overlay =====
      const tickR = R * 1.3
      const ticks = 72
      for (let tI = 0; tI < ticks; tI++) {
        const an = (tI / ticks) * Math.PI * 2 + rot * 0.4
        const long = tI % 6 === 0
        const r2 = tickR + (long ? 10 : 5) * DPR
        g.strokeStyle = tI % 18 === 3 ? "rgba(255,92,122,0.7)" : "rgba(120,160,255,0.5)"
        g.lineWidth = (long ? 1.6 : 1) * DPR
        g.beginPath()
        g.moveTo(CX + Math.cos(an) * tickR, CY + Math.sin(an) * tickR)
        g.lineTo(CX + Math.cos(an) * r2, CY + Math.sin(an) * r2)
        g.stroke()
      }
      ring(CX, CY, R * 1.16, sweep * 0.6, sweep * 0.6 + Math.PI * 1.4, "rgba(77,124,255,0.55)", 2, [
        14 * DPR,
        10 * DPR,
      ])
      ring(CX, CY, R * 1.22, -sweep * 0.5, -sweep * 0.5 + Math.PI * 0.7, "rgba(255,92,122,0.5)", 2, null)
      ring(CX, CY, R * 1.42, sweep * 0.3, sweep * 0.3 + Math.PI * 0.5, "rgba(124,160,255,0.5)", 1.5, [
        4 * DPR,
        8 * DPR,
      ])
      ring(
        CX,
        CY,
        R * 1.42,
        sweep * 0.3 + Math.PI,
        sweep * 0.3 + Math.PI + Math.PI * 0.35,
        "rgba(124,160,255,0.5)",
        1.5,
        [4 * DPR, 8 * DPR],
      )
      for (let e = 0; e < 3; e++) {
        const an2 = sweep * 0.6 + e * 2.1
        g.fillStyle = "#7ca0ff"
        g.beginPath()
        g.arc(CX + Math.cos(an2) * R * 1.16, CY + Math.sin(an2) * R * 1.16, 2.4 * DPR, 0, Math.PI * 2)
        g.fill()
      }

      if (!reduced) raf = requestAnimationFrame(draw)
    }

    size()
    if (!reduced) raf = requestAnimationFrame(draw)
    window.addEventListener("resize", size)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", size)
    }
  }, [])

  return <canvas ref={ref} className={cn("h-full w-full", className)} aria-hidden="true" />
}
