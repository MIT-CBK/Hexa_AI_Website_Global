import { Sparkles, Wifi, Activity, ShieldCheck, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang } from "@/i18n"

interface NodeT {
  id: string
  x: number
  y: number
  label: string
  alert?: boolean
}

const CORE: NodeT = { id: "core", x: 200, y: 92, label: "CORE" }
const NODES: NodeT[] = [
  { id: "fw", x: 200, y: 24, label: "FW" },
  { id: "sw1", x: 96, y: 56, label: "SW-01" },
  { id: "sw2", x: 96, y: 132, label: "SW-02" },
  { id: "edge", x: 308, y: 52, label: "EDGE-02", alert: true },
  { id: "dc", x: 312, y: 134, label: "DC-APP" },
]

/** Animated network-operations dashboard — the hero's flagship NMS visual. */
export function NmsDashboard({ className }: { className?: string }) {
  const { t } = useLang()
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border border-line bg-ink shadow-card",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-line bg-panel/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-accent/70" />
          <span className="size-2.5 rounded-full bg-[#ffb020]/70" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="ml-3 font-mono text-xs text-muted">hexa-nms · network ops</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* topology */}
        <div className="relative overflow-hidden rounded-xl border border-line bg-panel/40">
          <div className="bg-grid absolute inset-0 opacity-[0.18]" />
          {/* HUD radar sweep */}
          <span className="animate-scan pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_12px_var(--color-accent)]" />
          {/* HUD corner brackets */}
          <span className="pointer-events-none absolute left-1.5 top-1.5 size-3 border-l border-t border-accent/40" />
          <span className="pointer-events-none absolute right-1.5 top-1.5 size-3 border-r border-t border-accent/40" />
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 size-3 border-b border-l border-accent/40" />
          <span className="pointer-events-none absolute right-1.5 bottom-1.5 size-3 border-r border-b border-accent/40" />
          <span className="absolute left-3 top-2.5 font-mono text-[10px] tracking-wide text-faint uppercase">
            {t("nms.topology")}
          </span>
          <svg viewBox="0 0 400 180" className="relative w-full">
            {/* links */}
            {NODES.map((n) => {
              const d = `M ${CORE.x} ${CORE.y} L ${n.x} ${n.y}`
              return (
                <g key={n.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={n.alert ? "rgba(255,59,59,0.5)" : "rgba(255,255,255,0.12)"}
                    strokeWidth="1.2"
                  />
                  {/* travelling traffic packet */}
                  <circle r={n.alert ? 2.6 : 2} fill={n.alert ? "#ff3b3b" : "rgba(255,255,255,0.65)"}>
                    <animateMotion
                      dur={n.alert ? "1.4s" : `${2 + (n.x % 3) * 0.4}s`}
                      repeatCount="indefinite"
                      path={d}
                    />
                  </circle>
                </g>
              )
            })}
            {/* nodes */}
            {[CORE, ...NODES].map((n) => (
              <g key={n.id}>
                {n.alert && (
                  <circle cx={n.x} cy={n.y} r="11" fill="none" stroke="#ff3b3b" strokeWidth="1">
                    <animate attributeName="r" values="7;15" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.id === "core" ? 7 : 5}
                  fill={n.alert ? "#ff3b3b" : n.id === "core" ? "#f5f5f7" : "#cfd3dc"}
                />
                <text
                  x={n.x}
                  y={n.y + (n.y > 100 ? 18 : -10)}
                  textAnchor="middle"
                  className="fill-faint font-mono"
                  fontSize="8"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-4 gap-2.5">
          <Metric icon={<Wifi className="size-3.5" />} value="1,284" label={t("nms.devices")} />
          <Metric icon={<ShieldCheck className="size-3.5" />} value="99.99%" label={t("nms.uptime")} />
          <Metric icon={<Activity className="size-3.5" />} value="84 Gbps" label={t("nms.throughput")} />
          <Metric icon={<Cpu className="size-3.5" />} value="2" label={t("nms.anomalies")} accent />
        </div>

        {/* AI Copilot insight */}
        <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] p-3">
          <span className="icon-tile size-8 shrink-0">
            <Sparkles className="size-4" />
          </span>
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-fg">
            <span className="font-semibold text-accent">AI Copilot:</span> {t("nms.copilotPre")}
            <span className="font-mono">EDGE-02</span>
            {t("nms.copilotPost")}
          </p>
          <span className="hidden shrink-0 rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] text-muted sm:block">
            auto
          </span>
        </div>
      </div>
    </div>
  )
}

function Metric({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-line bg-panel/40 px-2.5 py-2">
      <div className="text-faint">{icon}</div>
      <div className={cn("mt-1 font-mono text-base font-semibold", accent ? "text-accent" : "text-fg")}>
        {value}
      </div>
      <div className="text-[10px] text-faint">{label}</div>
    </div>
  )
}
