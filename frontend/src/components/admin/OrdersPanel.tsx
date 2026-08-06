import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2, Mail, Building2 } from "lucide-react"
import { adminListOrders, setOrderStatus, deleteOrder, orderKeys, type Order } from "@/lib/orders"
import { Spinner, ErrorState } from "@/components/common/States"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUSES = ["new", "contacted", "won", "lost"] as const
const STATUS_STYLE: Record<string, string> = {
  new: "text-accent border-accent/40 bg-accent/10",
  contacted: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  won: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  lost: "text-faint border-line bg-white/5",
}

export function OrdersPanel() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: orderKeys.all, queryFn: adminListOrders })
  const statusM = useMutation({
    mutationFn: (v: { id: string; status: string }) => setOrderStatus(v.id, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  })
  const delM = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  })

  if (isLoading) return <div className="mt-10 grid place-items-center"><Spinner /></div>
  if (isError) return <div className="mt-10"><ErrorState /></div>
  const orders = data ?? []

  if (!orders.length) {
    return (
      <div className="mt-10 rounded-lg border border-line bg-panel/40 p-10 text-center text-sm text-muted">
        No order requests yet. They'll appear here when a visitor configures a product and submits.
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {orders.map((o) => (
        <OrderRow
          key={o.id}
          order={o}
          onStatus={(status) => statusM.mutate({ id: o.id, status })}
          onDelete={() => delM.mutate(o.id)}
        />
      ))}
    </div>
  )
}

function summarize(o: Order): string[] {
  const d = o.details || ({} as Order["details"])
  const out: string[] = []
  if (d.metricLabel || d.quantity)
    out.push(`${d.metricLabel || d.metric}: ${Number(d.quantity || 0).toLocaleString("en-US")}`)
  if (d.sensors) out.push(`Sensors: ${d.sensors}`)
  if (d.deployment === "cloud" && d.region) out.push(`Region: ${d.region}`)
  if (d.deployment === "cloud" && d.term) out.push(`Term: ${d.term}`)
  out.push(`AIOps: ${d.aiops ? `Yes${d.aiopsTerm ? ` (${d.aiopsTerm})` : ""}` : "No"}`)
  out.push(`Multi-tenant: ${d.multiTenant ? (d.tenants ? `Yes (${d.tenants})` : "Yes") : "No"}`)
  out.push(
    `Language pack: ${
      d.languagePack ? (d.languages && d.languages.length ? `Yes (${d.languages.join(", ")})` : "Yes") : "No"
    }`,
  )
  return out
}

function OrderRow({
  order,
  onStatus,
  onDelete,
}: {
  order: Order
  onStatus: (status: string) => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-fg">{order.product}</span>
            <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
              {order.deployment}
            </span>
            <span className={cn("rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase", STATUS_STYLE[order.status] ?? STATUS_STYLE.new)}>
              {order.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <a href={`mailto:${order.email}`} className="inline-flex items-center gap-1.5 text-accent hover:underline">
              <Mail className="size-3.5" />
              {order.email}
            </a>
            {order.name && <span>{order.name}</span>}
            {order.details?.role && <span className="text-faint">· {order.details.role}</span>}
            {order.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                {order.company}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatus(e.target.value)}
            className="rounded-md border border-line bg-ink/60 px-2.5 py-1.5 text-xs text-fg focus:border-accent focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={onDelete}
            aria-label="Delete order"
            className="grid size-8 place-items-center rounded-md text-faint hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
        {summarize(order).map((s, i) => (
          <span key={i}>{s}</span>
        ))}
        {order.details?.notes && (
          <span className="w-full text-faint">Notes: {order.details.notes}</span>
        )}
        <span className="ml-auto text-faint">{formatDate(order.createdAt)}</span>
      </div>
    </div>
  )
}
