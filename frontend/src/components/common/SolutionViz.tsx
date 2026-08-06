import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export type VizKind = "obs" | "nms" | "siem" | "ndr" | "edr" | "soar"

/** Slugs → viz variant. Only solutions have a bespoke animation. */
export const VIZ_FOR: Record<string, VizKind> = {
  observability: "obs",
  nms: "nms",
  siem: "siem",
  ndr: "ndr",
  edr: "edr",
  soar: "soar",
}

const AC = "#4d7cff"
const ACS = "rgba(77,124,255,"
const MU = "rgba(150,175,230,"
const DANGER = "#ff5c7a"

/**
 * A compact, product-specific animation that reads like a "live" thumbnail —
 * always drifting subtly, and speeding up / brightening while `active` (card
 * hover). Pure canvas, self-contained, respects reduced-motion.
 */
export function SolutionViz({
  kind,
  active = false,
  className,
}: {
  kind: VizKind
  active?: boolean
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const g = canvas.getContext("2d")
    if (!g) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    let t = 0
    let raf = 0

    const size = () => {
      const r = canvas.getBoundingClientRect()
      W = canvas.width = Math.max(1, Math.floor(r.width * DPR))
      H = canvas.height = Math.max(1, Math.floor(r.height * DPR))
    }
    size()
    window.addEventListener("resize", size)

    const frame = () => {
      const on = activeRef.current
      t += on ? 2.2 : 1
      const sp = on ? 1.6 : 1
      const w = W
      const h = H
      g.clearRect(0, 0, w, h)

      if (kind === "obs") {
        for (let s = 0; s < 3; s++) {
          g.beginPath()
          for (let x = 0; x <= w; x += 6 * DPR) {
            const y =
              h * (0.28 + s * 0.24) +
              Math.sin(x * 0.02 / DPR + t * 0.05 * sp + s * 2) * h * 0.09 * (on ? 1.4 : 1)
            if (x === 0) g.moveTo(x, y)
            else g.lineTo(x, y)
          }
          g.strokeStyle = ACS + (0.35 + s * 0.2) + ")"
          g.lineWidth = 1.6 * DPR
          g.stroke()
        }
      } else if (kind === "nms") {
        const cx = w / 2
        const cy = h / 2
        const ring = 5
        const nodes: number[][] = [[cx, cy]]
        for (let i = 0; i < ring; i++) {
          const an = (i / ring) * Math.PI * 2 + t * 0.004
          nodes.push([cx + Math.cos(an) * w * 0.3, cy + Math.sin(an) * h * 0.34])
        }
        for (let i = 1; i < nodes.length; i++) {
          g.strokeStyle = ACS + "0.28)"
          g.lineWidth = 1.2 * DPR
          g.beginPath()
          g.moveTo(nodes[0][0], nodes[0][1])
          g.lineTo(nodes[i][0], nodes[i][1])
          g.stroke()
          const pt = (t * 0.01 * sp + i * 0.2) % 1
          const px = nodes[0][0] + (nodes[i][0] - nodes[0][0]) * pt
          const py = nodes[0][1] + (nodes[i][1] - nodes[0][1]) * pt
          g.fillStyle = AC
          g.beginPath()
          g.arc(px, py, 2 * DPR, 0, Math.PI * 2)
          g.fill()
        }
        nodes.forEach((n, idx) => {
          g.fillStyle = idx === 0 ? AC : MU + "0.8)"
          g.beginPath()
          g.arc(n[0], n[1], (idx === 0 ? 4 : 3) * DPR, 0, Math.PI * 2)
          g.fill()
        })
      } else if (kind === "siem") {
        const rows = 6
        const rh = h / rows
        for (let r = 0; r < rows; r++) {
          const yy = (r * rh + ((t * 0.6 * sp * DPR) % h)) % (h + rh) - rh
          const alert = r === 2
          g.fillStyle = alert ? ACS + "0.5)" : "rgba(255,255,255,0.06)"
          g.fillRect(w * 0.08, yy, w * 0.5 * (0.5 + ((r * 37) % 5) / 8), rh * 0.4)
          g.fillStyle = "rgba(255,255,255,0.10)"
          g.fillRect(w * 0.62, yy, w * 0.28, rh * 0.4)
          if (alert) {
            g.fillStyle = AC
            g.beginPath()
            g.arc(w * 0.04, yy + rh * 0.2, 2 * DPR, 0, Math.PI * 2)
            g.fill()
          }
        }
      } else if (kind === "ndr") {
        const lanes = 4
        for (let l = 0; l < lanes; l++) {
          const ly = h * (0.2 + l * 0.2)
          g.strokeStyle = "rgba(255,255,255,0.05)"
          g.beginPath()
          g.moveTo(0, ly)
          g.lineTo(w, ly)
          g.stroke()
          for (let pk = 0; pk < 4; pk++) {
            const anomaly = l === 2 && pk === 1
            const px = ((t * (anomaly ? 3 : 1.6) * sp * DPR) + pk * w * 0.28 + l * 40) % w
            g.fillStyle = anomaly ? DANGER : ACS + "0.8)"
            g.shadowColor = anomaly ? DANGER : AC
            g.shadowBlur = anomaly ? 10 : 5
            g.beginPath()
            g.arc(px, ly, (anomaly ? 3 : 2) * DPR, 0, Math.PI * 2)
            g.fill()
            g.shadowBlur = 0
          }
        }
      } else if (kind === "edr") {
        const cols = 8
        const rows2 = 4
        const gx = w / (cols + 1)
        const gy = h / (rows2 + 1)
        const flashI = Math.floor(t * 0.03) % (cols * rows2)
        for (let r = 0; r < rows2; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c
            const x = gx * (c + 1)
            const y = gy * (r + 1)
            const flash = idx === flashI
            g.fillStyle = flash ? DANGER : MU + "0.5)"
            g.beginPath()
            g.arc(x, y, (flash ? 3.4 : 2.2) * DPR, 0, Math.PI * 2)
            g.fill()
            if (flash) {
              g.strokeStyle = "rgba(255,92,122,0.7)"
              g.lineWidth = 1.2 * DPR
              g.beginPath()
              g.arc(x, y, (5 + ((t * 0.4 * sp) % 6)) * DPR, 0, Math.PI * 2)
              g.stroke()
            }
          }
        }
      } else if (kind === "soar") {
        const steps = [
          [0.12, 0.5],
          [0.36, 0.28],
          [0.6, 0.5],
          [0.84, 0.72],
        ]
        const pts = steps.map((s) => [w * s[0], h * s[1]])
        g.strokeStyle = ACS + "0.3)"
        g.lineWidth = 1.4 * DPR
        g.beginPath()
        g.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1])
        g.stroke()
        pts.forEach((p) => {
          g.fillStyle = AC
          g.beginPath()
          g.arc(p[0], p[1], 3.4 * DPR, 0, Math.PI * 2)
          g.fill()
        })
        const seg = (t * 0.008 * sp) % (pts.length - 1)
        const i = Math.floor(seg)
        const f = seg - i
        const a = pts[i]
        const b = pts[i + 1] || pts[i]
        const tx = a[0] + (b[0] - a[0]) * f
        const ty = a[1] + (b[1] - a[1]) * f
        g.fillStyle = "#7ca0ff"
        g.shadowColor = AC
        g.shadowBlur = 12
        g.beginPath()
        g.arc(tx, ty, 4 * DPR, 0, Math.PI * 2)
        g.fill()
        g.shadowBlur = 0
      }

      if (!reduced) raf = requestAnimationFrame(frame)
    }

    if (reduced) frame()
    else raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", size)
    }
  }, [kind])

  return <canvas ref={ref} className={cn("h-full w-full", className)} aria-hidden="true" />
}
