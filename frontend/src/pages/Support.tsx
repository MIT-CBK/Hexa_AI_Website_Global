import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  LifeBuoy,
  LogOut,
  Plus,
  Paperclip,
  X,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  BookOpen,
} from "lucide-react"
import { DownloadView, DocumentView } from "@/components/support/ResourceViews"
import {
  isCustomerAuthenticated,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  listTickets,
  createTicket,
  uploadAttachment,
  supportKeys,
  type Attachment,
  type Severity,
  type Ticket,
  type TicketStatus,
} from "@/lib/support"
import { ApiError, assetUrl } from "@/lib/api-client"
import { useSiteContent, allOfferings } from "@/lib/content"
import { Button } from "@/components/ui/Button"
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
const statusStyle: Record<TicketStatus, string> = {
  open: "bg-accent/15 text-accent",
  in_progress: "bg-[#ffb020]/12 text-[#ffb020]",
  resolved: "bg-emerald-400/12 text-emerald-400",
  closed: "bg-white/8 text-muted",
}

const inputCls =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

export default function Support() {
  const [authed, setAuthed] = useState(() => isCustomerAuthenticated())
  if (!authed) return <AuthGate onSuccess={() => setAuthed(true)} />
  return <Portal onLogout={() => setAuthed(false)} />
}

/* ------------------------------ Auth gate ------------------------------ */

function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLang()
  const [mode, setMode] = useState<"login" | "register">("login")

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      mode === "login"
        ? loginCustomer(String(form.get("email")), String(form.get("password")))
        : registerCustomer({
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password")),
            company: String(form.get("company") || "") || undefined,
            code: String(form.get("code") || ""),
          }),
    onSuccess,
  })

  const err = mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? "Something went wrong." : ""

  return (
    <div className="relative grid min-h-screen place-items-center px-5 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-accent/12 text-accent ring-1 ring-accent/25">
            <LifeBuoy className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t("support.title")}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t("support.subtitle")}</p>
        </div>

        <div className="border-gradient rounded-lg p-6 sm:p-8">
          <div className="mb-5 flex rounded-lg border border-line p-0.5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  mutation.reset()
                }}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  mode === m ? "bg-accent/15 text-white" : "text-muted hover:text-white",
                )}
              >
                {m === "login" ? t("support.signIn") : t("support.signUp")}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate(new FormData(e.currentTarget))
            }}
            className="flex flex-col gap-3"
          >
            {mode === "register" && (
              <input name="name" placeholder={t("support.name")} className={inputCls} autoComplete="name" />
            )}
            <input name="email" type="email" placeholder={t("support.email")} className={inputCls} autoComplete="email" />
            <input
              name="password"
              type="password"
              placeholder={t("support.password")}
              className={inputCls}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "register" && (
              <input name="company" placeholder={t("support.company")} className={inputCls} autoComplete="organization" />
            )}
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <input
                  name="code"
                  placeholder={t("support.code")}
                  className={`${inputCls} font-mono uppercase`}
                  autoComplete="off"
                />
                <span className="text-[11px] leading-snug text-faint">{t("support.codeHint")}</span>
              </div>
            )}
            {err && <p className="text-xs text-rose-400">{err}</p>}
            <Button type="submit" className="mt-1 w-full" disabled={mutation.isPending}>
              {mode === "login" ? t("support.signIn") : t("support.signUp")}
            </Button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login")
              mutation.reset()
            }}
            className="mt-4 w-full text-center text-xs text-muted hover:text-white"
          >
            {mode === "login" ? t("support.noAccount") : t("support.haveAccount")}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Portal ------------------------------- */

type SubTab = "tickets" | "download" | "document"

function Portal({ onLogout }: { onLogout: () => void }) {
  const { t } = useLang()
  const [sub, setSub] = useState<SubTab>("tickets")

  return (
    <div className="mx-auto max-w-4xl px-5 pt-28 pb-24 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("support.title")}</h1>
        <Button
          variant="ghost"
          onClick={() => {
            logoutCustomer()
            onLogout()
          }}
        >
          <LogOut className="size-4" />
          {t("support.logout")}
        </Button>
      </div>

      {/* sub-tabs */}
      <div className="mt-6 flex gap-1 border-b border-line">
        <SubTabBtn active={sub === "tickets"} onClick={() => setSub("tickets")} icon={<LifeBuoy className="size-4" />}>
          {t("support.tabTickets")}
        </SubTabBtn>
        <SubTabBtn active={sub === "download"} onClick={() => setSub("download")} icon={<Download className="size-4" />}>
          {t("support.tabDownload")}
        </SubTabBtn>
        <SubTabBtn active={sub === "document"} onClick={() => setSub("document")} icon={<BookOpen className="size-4" />}>
          {t("support.tabDocument")}
        </SubTabBtn>
      </div>

      <div className="mt-8">
        {sub === "tickets" && <TicketsList />}
        {sub === "download" && <DownloadView />}
        {sub === "document" && <DocumentView />}
      </div>
    </div>
  )
}

function SubTabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "border-accent text-white" : "border-transparent text-muted hover:text-white",
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function TicketsList() {
  const { t } = useLang()
  const [creating, setCreating] = useState(false)
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: supportKeys.tickets(),
    queryFn: listTickets,
  })
  const tickets = data ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{t("support.myTickets")}</p>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t("support.newTicket")}
          </Button>
        )}
      </div>

      {creating && <TicketForm onDone={() => setCreating(false)} />}

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-20 text-center">
          <LifeBuoy className="size-10 text-faint" />
          <p className="text-muted">{t("support.noTickets")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const { t, lang } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-line bg-panel/40 p-5">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-faint">#{ticket.id.slice(-6)}</span>
            <span className="font-medium text-fg">{ticket.subject}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip className={statusStyle[ticket.status]}>{t(`tst.${ticket.status}`)}</Chip>
            <Chip className={sevStyle[ticket.severity]}>{t(`sev.${ticket.severity}`)}</Chip>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-muted">{ticket.product}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-faint">
              <Calendar className="size-3" />
              {formatDate(ticket.createdAt, lang)}
            </span>
          </div>
        </div>
      </button>
      {open && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm whitespace-pre-wrap text-muted">{ticket.description}</p>
          {ticket.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <AttachLink key={a.url} attachment={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ----------------------------- New ticket ----------------------------- */

function TicketForm({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const queryClient = useQueryClient()
  const content = useSiteContent()
  const products = allOfferings(content).map((o) => o.abbr)
  const fileRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [fileErr, setFileErr] = useState("")

  const uploadMut = useMutation({ mutationFn: uploadAttachment })
  const createMut = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
      onDone()
    },
  })

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setFileErr("")
    if (file.size > 8 * 1024 * 1024) return setFileErr("File exceeds 8MB.")
    try {
      const att = await uploadMut.mutateAsync(file)
      setAttachments((a) => [...a, att])
    } catch (err) {
      setFileErr(err instanceof ApiError ? err.message : "File upload failed.")
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    createMut.mutate({
      subject: String(f.get("subject") ?? ""),
      product: String(f.get("product") ?? products[0] ?? "Other"),
      severity: String(f.get("severity") ?? "medium") as Severity,
      description: String(f.get("description") ?? ""),
      contactEmail: String(f.get("contactEmail") ?? ""),
      attachments,
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-line bg-panel/40 p-6">
      <h2 className="text-lg font-semibold">{t("support.newTicket")}</h2>

      <Field label={t("support.subject")}>
        <input name="subject" placeholder={t("support.subjectPh")} className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("support.product")}>
          <select name="product" className={inputCls} defaultValue={products[0]}>
            {products.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label={t("support.severity")}>
          <select name="severity" className={inputCls} defaultValue="medium">
            {(["low", "medium", "high", "critical"] as const).map((s) => (
              <option key={s} value={s}>{t(`sev.${s}`)}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("support.description")}>
        <textarea name="description" rows={5} placeholder={t("support.descriptionPh")} className={inputCls} />
      </Field>

      <Field label={t("support.contactEmail")}>
        <input name="contactEmail" type="email" placeholder="you@company.com" className={inputCls} />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-fg">{t("support.attachments")}</span>
        <div className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <span key={a.url} className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink/50 px-3 py-1.5 text-xs text-muted">
              <FileText className="size-3.5" />
              <span className="max-w-[160px] truncate">{a.name}</span>
              <button type="button" onClick={() => setAttachments((x) => x.filter((y) => y.url !== a.url))} aria-label="Remove file">
                <X className="size-3.5 hover:text-rose-400" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-white disabled:opacity-60"
          >
            <Paperclip className="size-3.5" />
            {uploadMut.isPending ? t("support.uploading") : t("support.addFile")}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.txt,.log,.json,.csv,.zip,.gz"
          onChange={onPickFile}
          className="hidden"
        />
        <span className="text-xs text-faint">{t("support.attachHint")}</span>
        {fileErr && <span className="text-xs text-rose-400">{fileErr}</span>}
      </div>

      {createMut.isError && (
        <p className="text-sm text-rose-400">
          {createMut.error instanceof ApiError ? createMut.error.message : "Submission failed."}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={createMut.isPending || uploadMut.isPending}>
          <CheckCircle2 className="size-4" />
          {createMut.isPending ? t("support.submitting") : t("support.submit")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("support.cancel")}
        </Button>
      </div>
    </form>
  )
}

/* ------------------------------ Primitives ------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  )
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", className)}>{children}</span>
  )
}

function AttachLink({ attachment }: { attachment: Attachment }) {
  // assetUrl prefixes the API base for /uploads paths.
  return (
    <a
      href={assetUrl(attachment.url) ?? attachment.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-ink/50 px-3 py-1.5 text-xs text-accent hover:border-accent/50"
    >
      <Paperclip className="size-3.5" />
      <span className="max-w-[180px] truncate">{attachment.name}</span>
    </a>
  )
}
