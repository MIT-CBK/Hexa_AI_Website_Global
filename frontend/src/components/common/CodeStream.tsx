import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const GLYPHS =
  "01{}<>[]/\\=+*#$;:ABCDEF0123456789·SOARNDREDRSIEMOBSNMS".split("")

/**
 * A refined "data wall" — monochrome-blue code rain for use as a section
 * backdrop. Deliberately low-contrast so foreground text stays readable.
 * Under reduced-motion it paints a single static scatter (no loop).
 */
export function CodeStream({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const g = canvas.getContext("2d")
    if (!g) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    let cols = 0
    let drops: number[] = []
    let fs = 14
    let raf = 0

    const size = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(r.width * DPR))
      canvas.height = Math.max(1, Math.floor(r.height * DPR))
      fs = 14 * DPR
      cols = Math.max(1, Math.floor(canvas.width / fs))
      drops = Array.from({ length: cols }, () => (Math.random() * canvas.height) / fs)
      g.textBaseline = "top"
    }
    size()

    const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

    const frame = () => {
      g.fillStyle = "rgba(19,21,25,0.12)"
      g.fillRect(0, 0, canvas.width, canvas.height)
      g.font = `${fs}px ui-monospace, monospace`
      for (let i = 0; i < cols; i++) {
        const x = i * fs
        const y = drops[i] * fs
        g.fillStyle = "rgba(124,160,255,0.9)"
        g.fillText(glyph(), x, y)
        g.fillStyle = "rgba(77,124,255,0.25)"
        g.fillText(glyph(), x, y - fs)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5
      }
      raf = requestAnimationFrame(frame)
    }

    const staticScatter = () => {
      g.clearRect(0, 0, canvas.width, canvas.height)
      g.font = `${fs}px ui-monospace, monospace`
      g.fillStyle = "rgba(124,160,255,0.35)"
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < canvas.height / fs; j += 3) {
          if (Math.random() > 0.6) g.fillText(glyph(), i * fs, j * fs)
        }
      }
    }

    if (reduced) staticScatter()
    else raf = requestAnimationFrame(frame)
    window.addEventListener("resize", reduced ? staticScatter : size)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", reduced ? staticScatter : size)
    }
  }, [])

  return <canvas ref={ref} className={cn("h-full w-full", className)} aria-hidden="true" />
}
