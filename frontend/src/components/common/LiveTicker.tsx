import { cn } from "@/lib/utils"

const SIGNALS = [
  "THREAT BLOCKED · EDGE-02",
  "MTTD 41s",
  "1,284 DEVICES ONLINE",
  "SOAR PLAYBOOK · CONTAINED",
  "ANOMALY · LATERAL MOVEMENT",
  "UPTIME 99.99%",
  "24/7 SOC",
  "NDR · EXFIL ATTEMPT STOPPED",
  "EDR · HOST ISOLATED",
  "SIEM · 3.2B EVENTS/DAY",
]

/**
 * A continuously scrolling strip of live telemetry — gives the platform a
 * "system is alive" feel. Uses the marquee keyframe from index.css; the track
 * is duplicated so the loop is seamless. Pauses under reduced-motion.
 */
export function LiveTicker({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mask-fade-x relative flex h-11 items-center overflow-hidden border-t border-line bg-void/60 backdrop-blur",
        className,
      )}
      aria-hidden="true"
    >
      <div className="animate-marquee flex shrink-0 items-center gap-12 whitespace-nowrap pr-12 font-mono text-xs tracking-wide text-muted motion-reduce:animate-none">
        {[...SIGNALS, ...SIGNALS].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
