import { useEffect, useRef, useState } from "react"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Reveal } from "@/components/common/Reveal"

interface Clip {
  id: string
  label: string
  caption: string
}

const CLIPS: Clip[] = [
  { id: "showcase1", label: "Global threat intelligence", caption: "Live attack surface, mapped in real time" },
  { id: "showcase2", label: "Autonomous response", caption: "Detect, decide and contain at machine speed" },
]

/**
 * A wall of looping, muted background clips — portrait tiles that read like a
 * live operations feed. Drop files in /public/videos (see the README there);
 * any missing clip degrades to an animated placeholder so the layout is never
 * broken.
 */
export function VideoWall() {
  return (
    <section className="relative scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="In the field"
          title={
            <>
              What your team actually sees
            </>
          }
          description="Threat maps, traffic radar and correlated alerts — the same views your analysts work from."
        />
        <Reveal className="mt-14">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {CLIPS.map((c) => (
              <VideoTile key={c.id} clip={c} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function VideoTile({ clip }: { clip: Clip }) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  // React's `muted` prop is unreliable for autoplay — force the DOM property,
  // and start/stop playback as the tile scrolls in/out of view.
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl border border-line bg-ink">
      {/* animated fallback — always present behind the video */}
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
      <div
        className="absolute inset-0 animate-pulse-slow"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 30%, rgba(77,124,255,0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <span className="animate-scan pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

      {/* the clip (hidden if it fails / is absent) */}
      {!failed && (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/videos/${clip.id}-poster.jpg`}
          src={`/videos/${clip.id}.mp4`}
          onError={() => setFailed(true)}
        />
      )}

      {/* legibility gradient + caption */}
      <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-void/30" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          <span className="eyebrow text-fg/90">Live</span>
        </div>
        <h3 className="mt-2 font-semibold tracking-tight text-fg">{clip.label}</h3>
        <p className="text-xs text-muted">{clip.caption}</p>
      </div>
      <span className="absolute inset-0 ring-0 ring-accent/0 transition group-hover:ring-1 group-hover:ring-accent/40" aria-hidden />
    </div>
  )
}
