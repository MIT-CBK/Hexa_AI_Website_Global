import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Eye,
  Users,
  UserCheck,
  CalendarDays,
  RefreshCw,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  Mail,
  ShoppingCart,
  Info,
} from "lucide-react"
import {
  analyticsKeys,
  getAnalytics,
  getVisitorJourney,
  type AnalyticsReport,
  type VisitorRow,
} from "@/lib/analytics"
import { Spinner, ErrorState } from "@/components/common/States"
import { cn } from "@/lib/utils"

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const

type ContactFilter = "all" | "yes" | "no"

/* ------------------------------ helpers ------------------------------ */

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" })
  } catch {
    return null
  }
})()

function countryName(cc: string | null): string {
  if (!cc) return "Unknown"
  try {
    return regionNames?.of(cc) ?? cc
  } catch {
    return cc
  }
}

function flag(cc: string | null): string {
  if (!cc || !/^[A-Z]{2}$/.test(cc)) return "🌐"
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

function location(v: Pick<VisitorRow, "city" | "region" | "country">): string {
  const parts = [v.city, v.region && v.region !== v.city ? v.region : null, countryName(v.country)]
  return parts.filter(Boolean).join(", ")
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const pct = (n: number) => `${(n * 100).toFixed(n > 0 && n < 0.1 ? 1 : 0)}%`

/* ------------------------------ panel ------------------------------ */

export function AnalyticsPanel() {
  const [days, setDays] = useState<number>(30)
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: analyticsKeys.report(days),
    queryFn: () => getAnalytics(days),
    refetchInterval: 60_000,
  })

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Visitor analytics</h2>
          <p className="text-sm text-muted">Who visits the site, from where, and whether they left their contact.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  days === r.days ? "bg-accent/15 text-white" : "text-muted hover:text-white",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Report data={data} />
      )}
    </div>
  )
}

function Report({ data }: { data: AnalyticsReport }) {
  const t = data.totals
  const missingCity = data.visitors.some((v) => v.country && !v.city)
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Eye className="size-4" />} label="Page views" value={t.pageviews.toLocaleString("en-US")} />
        <Stat icon={<Users className="size-4" />} label="Unique visitors" value={t.visitors.toLocaleString("en-US")} />
        <Stat
          icon={<UserCheck className="size-4" />}
          label="Left contact"
          value={t.leads.toLocaleString("en-US")}
          hint={`${pct(t.conversion)} of visitors`}
        />
        <Stat
          icon={<CalendarDays className="size-4" />}
          label="Today"
          value={t.todayVisitors.toLocaleString("en-US")}
          hint={`${t.todayPageviews.toLocaleString("en-US")} page views`}
        />
      </div>

      {data.days > 1 && <TrafficChart series={data.series} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <TopList
          title="Countries"
          rows={data.topCountries.map((c) => ({
            label: `${flag(c.key)}  ${countryName(c.key)}`,
            count: c.count,
          }))}
          unit="visitors"
        />
        <TopList title="Top pages" rows={data.topPages.map((p) => ({ label: p.key, count: p.count, mono: true }))} unit="views" />
        <TopList title="Referrers" rows={data.topReferrers.map((r) => ({ label: r.key, count: r.count }))} unit="visits" empty="Direct traffic only" />
      </div>

      {(t.visitors > t.locatedVisitors || missingCity) && (
        <div className="flex gap-3 rounded-lg border border-line bg-panel/40 p-4 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            Location comes from Cloudflare. Country is automatic; to also get <b className="text-fg">city & region</b>, enable
            Cloudflare → <b className="text-fg">Rules → Transform Rules → Managed Transforms → “Add visitor location headers”</b>.
            Visits made directly to the server (not via Cloudflare) show as Unknown.
          </p>
        </div>
      )}

      <VisitorsTable visitors={data.visitors} />
    </>
  )
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-4">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-faint">{hint}</div>}
    </div>
  )
}

function TrafficChart({ series }: { series: AnalyticsReport["series"] }) {
  const max = Math.max(1, ...series.map((s) => s.pageviews))
  const label = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1]
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-5">
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span className="font-medium text-fg">Daily traffic</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-accent/35" /> Page views
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-accent" /> Visitors
          </span>
        </span>
      </div>
      <div className="flex h-40 items-end gap-[3px]">
        {series.map((s) => (
          <div
            key={s.date}
            className="group relative flex h-full flex-1 items-end"
            title={`${label(s.date)}: ${s.pageviews} views · ${s.visitors} visitors`}
          >
            <div className="relative w-full rounded-t-sm bg-accent/35" style={{ height: `${(s.pageviews / max) * 100}%` }}>
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm bg-accent"
                style={{ height: s.pageviews ? `${(s.visitors / s.pageviews) * 100}%` : 0 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
        {ticks.map((i) => (
          <span key={i}>{series[i] ? label(series[i].date) : ""}</span>
        ))}
      </div>
    </div>
  )
}

function TopList({
  title,
  rows,
  unit,
  empty = "No data yet",
}: {
  title: string
  rows: { label: string; count: number; mono?: boolean }[]
  unit: string
  empty?: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-5">
      <div className="mb-3 text-sm font-medium">{title}</div>
      {rows.length === 0 ? (
        <p className="text-xs text-faint">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="relative overflow-hidden rounded-md px-2.5 py-1.5 text-sm" title={`${r.count} ${unit}`}>
              <span className="absolute inset-y-0 left-0 bg-accent/10" style={{ width: `${(r.count / max) * 100}%` }} />
              <span className="relative flex items-center justify-between gap-3">
                <span className={cn("truncate text-muted", r.mono && "font-mono text-xs")}>{r.label}</span>
                <span className="tabular-nums text-fg">{r.count}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------ visitors ------------------------------ */

function VisitorsTable({ visitors }: { visitors: VisitorRow[] }) {
  const [filter, setFilter] = useState<ContactFilter>("all")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<string | null>(null)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return visitors.filter((v) => {
      if (filter === "yes" && !v.leftContact) return false
      if (filter === "no" && v.leftContact) return false
      if (!needle) return true
      const hay = [v.ip, ...v.otherIps, location(v), v.landing, v.lastPath, ...v.leads.map((l) => l.email)]
        .join(" ")
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [visitors, filter, q])

  const withContact = visitors.filter((v) => v.leftContact).length

  return (
    <div className="rounded-lg border border-line bg-panel/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div className="flex rounded-lg border border-line p-0.5">
          {(
            [
              ["all", `All (${visitors.length})`],
              ["yes", `Left contact (${withContact})`],
              ["no", `No contact (${visitors.length - withContact})`],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key ? "bg-accent/15 text-white" : "text-muted hover:text-white",
              )}
            >
              {text}
            </button>
          ))}
        </div>
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search IP, location, page, email…"
            className="w-64 rounded-lg border border-line bg-ink/60 py-2 pr-3 pl-8 text-xs text-fg placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted">
          {visitors.length === 0 ? "No visits recorded in this period yet." : "No visitors match this filter."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-line font-mono text-[10px] tracking-wider text-faint uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 text-right font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Entry page</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <VisitorRowView
                  key={v.visitorId}
                  v={v}
                  open={open === v.visitorId}
                  onToggle={() => setOpen((o) => (o === v.visitorId ? null : v.visitorId))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DeviceIcon({ device }: { device: string }) {
  const cls = "size-3.5 text-faint"
  if (device === "Mobile") return <Smartphone className={cls} />
  if (device === "Tablet") return <Tablet className={cls} />
  return <Monitor className={cls} />
}

function VisitorRowView({ v, open, onToggle }: { v: VisitorRow; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr onClick={onToggle} className={cn("cursor-pointer border-b border-line/60 hover:bg-white/[0.03]", open && "bg-white/[0.03]")}>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-fg">{ago(v.lastSeen)}</div>
          <div className="text-[11px] text-faint">{dateTime(v.lastSeen)}</div>
        </td>
        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-fg">
          {v.ip}
          {v.otherIps.length > 0 && <span className="ml-1 text-faint">+{v.otherIps.length}</span>}
        </td>
        <td className="px-4 py-3">
          <span className="mr-1.5">{flag(v.country)}</span>
          <span className="text-muted">{location(v)}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-muted">
          <span className="inline-flex items-center gap-1.5">
            <DeviceIcon device={v.device} />
            {v.browser} · {v.os}
          </span>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-fg">{v.pageviews}</td>
        <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-muted" title={v.landing}>
          {v.landing}
        </td>
        <td className="px-4 py-3">
          {v.leftContact ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
              <UserCheck className="size-3" />
              Yes
            </span>
          ) : (
            <span className="rounded-md border border-line px-2 py-0.5 text-xs text-faint">No</span>
          )}
        </td>
        <td className="pr-4">
          <ChevronDown className={cn("size-4 text-faint transition-transform", open && "rotate-180")} />
        </td>
      </tr>
      {open && (
        <tr className="border-b border-line/60 bg-ink/40">
          <td colSpan={8} className="px-4 py-4">
            <VisitorDetail v={v} />
          </td>
        </tr>
      )}
    </>
  )
}

function VisitorDetail({ v }: { v: VisitorRow }) {
  const { data, isLoading } = useQuery({
    queryKey: analyticsKeys.visitor(v.visitorId),
    queryFn: () => getVisitorJourney(v.visitorId),
  })
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3 text-sm">
        <Field label="First seen" value={dateTime(v.firstSeen)} />
        <Field label="Last seen" value={dateTime(v.lastSeen)} />
        <Field label="Came from" value={v.referrer ?? "Direct / unknown"} />
        <Field label="Pages visited" value={`${v.pages} distinct · ${v.pageviews} views`} />
        {v.otherIps.length > 0 && <Field label="Other IPs" value={v.otherIps.join(", ")} mono />}
        <Field label="Visitor ID" value={v.visitorId} mono />
        {v.leads.length > 0 && (
          <div>
            <div className="mb-2 text-xs text-faint">Contact left</div>
            <ul className="flex flex-col gap-2">
              {v.leads.map((l, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-line px-3 py-2">
                  {l.type === "order" ? <ShoppingCart className="size-3.5 text-accent" /> : <Mail className="size-3.5 text-accent" />}
                  <a href={`mailto:${l.email}`} className="text-accent hover:underline">
                    {l.email}
                  </a>
                  {l.name && <span className="text-muted">{l.name}</span>}
                  <span className="text-faint">
                    · {l.type === "order" ? `Buy-now ${l.detail ?? ""}` : (l.detail ?? "Contact form")} · {dateTime(l.at)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <div className="mb-2 text-xs text-faint">Page journey (latest first)</div>
        {isLoading ? (
          <Spinner />
        ) : (
          <ol className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-2">
            {(data ?? []).map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded px-2 py-1 text-xs hover:bg-white/[0.03]">
                <span className="truncate font-mono text-muted">{p.path}</span>
                <span className="shrink-0 text-faint">{dateTime(p.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="w-28 shrink-0 text-xs text-faint">{label}</span>
      <span className={cn("break-all text-fg", mono && "font-mono text-xs")}>{value}</span>
    </div>
  )
}
