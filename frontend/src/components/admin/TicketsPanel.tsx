import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calendar, Paperclip, User } from "lucide-react"
import {
  adminListTickets,
  adminSetTicketStatus,
  supportKeys,
  type Severity,
  type Ticket,
  type TicketStatus,
} from "@/lib/support"
import { assetUrl } from "@/lib/api-client"
import { Spinner, ErrorState } from "@/components/common/States"
import { useLang } from "@/i18n"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const sevStyle: Record<Severity, string> = {
  low: "bg-white/8 text-muted",
  medium: "bg-sky-400/12 text-sky-300",
  high: "bg-[#ffb020]/12 text-[#ffb020]",
  critical: "bg-accent/15 text-accent",
}
const STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"]

export function TicketsPanel() {
  const { t, lang } = useLang()
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: supportKeys.adminTickets(),
    queryFn: adminListTickets,
  })
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: TicketStatus }) => adminSetTicketStatus(v.id, v.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supportKeys.adminTickets() }),
  })

  if (isPending) return <Spinner label="Loading…" />
  if (isError)
    return (
      <div className="mt-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )

  const tickets = data ?? []
  const openCount = tickets.filter((t) => t.status === "open").length

  if (tickets.length === 0)
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-20 text-center">
        <Paperclip className="size-10 text-faint" />
        <p className="text-muted">No support tickets yet.</p>
      </div>
    )

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm text-muted">
        {tickets.length} tickets · <span className="text-accent">{openCount} new</span>
      </p>
      {tickets.map((ticket) => (
        <AdminTicketCard
          key={ticket.id}
          ticket={ticket}
          lang={lang}
          sevLabel={t(`sev.${ticket.severity}`)}
          onStatus={(status) => statusMut.mutate({ id: ticket.id, status })}
          pending={statusMut.isPending}
        />
      ))}
    </div>
  )
}

function AdminTicketCard({
  ticket,
  lang,
  sevLabel,
  onStatus,
  pending,
}: {
  ticket: Ticket
  lang: "vi" | "en"
  sevLabel: string
  onStatus: (s: TicketStatus) => void
  pending: boolean
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-faint">#{ticket.id.slice(-6)}</span>
            <span className="font-medium text-fg">{ticket.subject}</span>
            <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", sevStyle[ticket.severity])}>
              {sevLabel}
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-muted">{ticket.product}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              {ticket.customer?.name} · {ticket.customer?.email}
              {ticket.customer?.company ? ` · ${ticket.customer.company}` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(ticket.createdAt, lang)}
            </span>
          </div>
        </button>
        <select
          value={ticket.status}
          disabled={pending}
          onChange={(e) => onStatus(e.target.value as TicketStatus)}
          className="rounded-lg border border-line bg-ink/60 px-2.5 py-1.5 text-xs text-fg focus:border-accent focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`tst.${s}`)}</option>
          ))}
        </select>
      </div>
      {open && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm whitespace-pre-wrap text-muted">{ticket.description}</p>
          <p className="mt-3 text-xs text-faint">
            Contact: <span className="text-accent">{ticket.contactEmail}</span>
          </p>
          {ticket.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <a
                  key={a.url}
                  href={assetUrl(a.url) ?? a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-ink/50 px-3 py-1.5 text-xs text-accent hover:border-accent/50"
                >
                  <Paperclip className="size-3.5" />
                  <span className="max-w-[180px] truncate">{a.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
