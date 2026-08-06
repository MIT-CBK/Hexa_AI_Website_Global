import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Mail, Send, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/common/States"
import { ApiError } from "@/lib/api-client"
import {
  getSmtpSettings,
  saveSmtpSettings,
  testSmtp,
  settingsKeys,
  type SmtpEncryption,
} from "@/lib/settings"

interface Provider {
  id: string
  label: string
  host?: string
  port?: number
  encryption?: SmtpEncryption
  note?: string
}

const PROVIDERS: Provider[] = [
  { id: "custom", label: "Custom / other" },
  {
    id: "gmail",
    label: "Gmail / Google Workspace",
    host: "smtp.gmail.com",
    port: 587,
    encryption: "starttls",
    note: "Use an App Password (Google account → Security → 2-Step Verification → App passwords), not your normal password.",
  },
  {
    id: "larksuite",
    label: "Larksuite (Lark Mail)",
    host: "smtp.larksuite.com",
    port: 465,
    encryption: "ssl",
    note: "Enable SMTP in Lark Admin and use the mailbox address + its SMTP password.",
  },
  {
    id: "exchange",
    label: "Microsoft 365 / Exchange",
    host: "smtp.office365.com",
    port: 587,
    encryption: "starttls",
    note: "SMTP AUTH must be enabled for the mailbox in the Microsoft 365 admin center.",
  },
  {
    id: "postfix",
    label: "Postfix (self-hosted)",
    host: "",
    port: 25,
    encryption: "none",
    note: "For a local relay, host is often localhost:25 with no authentication.",
  },
  {
    id: "hmail",
    label: "hMailServer (self-hosted)",
    host: "",
    port: 587,
    encryption: "starttls",
    note: "Enter your server's hostname and a mailbox account's credentials.",
  },
]

const inputCls =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
const labelCls = "mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase"

interface FormState {
  enabled: boolean
  provider: string
  host: string
  port: number
  encryption: SmtpEncryption
  user: string
  fromEmail: string
  fromName: string
  toEmail: string
}

const EMPTY: FormState = {
  enabled: false,
  provider: "custom",
  host: "",
  port: 587,
  encryption: "starttls",
  user: "",
  fromEmail: "",
  fromName: "Hexa AI",
  toEmail: "",
}

export function SmtpSettings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: settingsKeys.smtp, queryFn: getSmtpSettings })

  const [form, setForm] = useState<FormState>(EMPTY)
  const [password, setPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(false)
  const [testTo, setTestTo] = useState("")
  const [savedNote, setSavedNote] = useState(false)

  useEffect(() => {
    if (!data) return
    setForm({
      enabled: data.enabled,
      provider: data.provider,
      host: data.host,
      port: data.port,
      encryption: data.encryption,
      user: data.user,
      fromEmail: data.fromEmail,
      fromName: data.fromName || "Hexa AI",
      toEmail: data.toEmail,
    })
    setHasPassword(data.hasPassword)
    setTestTo((prev) => prev || data.toEmail || data.fromEmail || "")
  }, [data])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const applyProvider = (id: string) => {
    const p = PROVIDERS.find((x) => x.id === id)
    setForm((f) => ({
      ...f,
      provider: id,
      host: p?.host !== undefined ? p.host : f.host,
      port: p?.port !== undefined ? p.port : f.port,
      encryption: p?.encryption ?? f.encryption,
    }))
  }

  const save = useMutation({
    mutationFn: () => saveSmtpSettings({ ...form, password: password || undefined }),
    onSuccess: () => {
      setPassword("")
      setSavedNote(true)
      setTimeout(() => setSavedNote(false), 2500)
      void qc.invalidateQueries({ queryKey: settingsKeys.smtp })
    },
  })

  const test = useMutation({ mutationFn: () => testSmtp(testTo) })

  if (isLoading) {
    return (
      <div className="mt-10 grid place-items-center">
        <Spinner />
      </div>
    )
  }

  const activeProvider = PROVIDERS.find((p) => p.id === form.provider)
  const saveError = save.error instanceof ApiError ? save.error.message : save.isError ? "Could not save." : ""
  const testError = test.error instanceof ApiError ? test.error.message : test.isError ? "Test failed." : ""

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Header + enable toggle */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-line bg-panel/40 p-5">
        <div className="flex gap-3">
          <span className="icon-tile size-10 shrink-0">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-fg">Email (SMTP)</h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted">
              Outgoing mail server used to deliver contact-form notifications. Only admins can
              change these settings.
            </p>
          </div>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          Enabled
        </label>
      </div>

      {/* Configuration */}
      <form
        className="rounded-lg border border-line bg-panel/40 p-6"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Provider preset</label>
            <select
              value={form.provider}
              onChange={(e) => applyProvider(e.target.value)}
              className={inputCls}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {activeProvider?.note && (
              <p className="mt-2 text-xs text-faint">{activeProvider.note}</p>
            )}
          </div>

          <div className="sm:col-span-2 grid gap-5 sm:grid-cols-[1fr_140px_180px]">
            <div>
              <label className={labelCls}>SMTP host</label>
              <input
                className={inputCls}
                value={form.host}
                onChange={(e) => set("host", e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className={labelCls}>Port</label>
              <input
                className={inputCls}
                type="number"
                value={form.port}
                onChange={(e) => set("port", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className={labelCls}>Encryption</label>
              <select
                className={inputCls}
                value={form.encryption}
                onChange={(e) => set("encryption", e.target.value as SmtpEncryption)}
              >
                <option value="none">None</option>
                <option value="starttls">STARTTLS</option>
                <option value="ssl">SSL / TLS</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Username</label>
            <input
              className={inputCls}
              value={form.user}
              onChange={(e) => set("user", e.target.value)}
              placeholder="you@example.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={hasPassword ? "•••••••• (saved — leave blank to keep)" : "SMTP password / app password"}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className={labelCls}>From address</label>
            <input
              className={inputCls}
              value={form.fromEmail}
              onChange={(e) => set("fromEmail", e.target.value)}
              placeholder="no-reply@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>From name</label>
            <input
              className={inputCls}
              value={form.fromName}
              onChange={(e) => set("fromName", e.target.value)}
              placeholder="Hexa AI"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Deliver notifications to</label>
            <input
              className={inputCls}
              value={form.toEmail}
              onChange={(e) => set("toEmail", e.target.value)}
              placeholder="security-team@example.com"
            />
            <p className="mt-1.5 text-xs text-faint">
              Where contact-form submissions are emailed. Leave blank to use the server default.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
          {savedNote && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="size-4" /> Saved
            </span>
          )}
          {saveError && (
            <span className="inline-flex items-center gap-1.5 text-sm text-rose-400">
              <AlertTriangle className="size-4" /> {saveError}
            </span>
          )}
        </div>
      </form>

      {/* Test */}
      <div className="rounded-lg border border-line bg-panel/40 p-6">
        <h3 className="font-semibold text-fg">Send a test email</h3>
        <p className="mt-1 text-sm text-muted">
          Save your settings first, then send a test message to confirm delivery works.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className={inputCls + " sm:max-w-sm"}
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="recipient@example.com"
          />
          <Button
            type="button"
            variant="outline"
            disabled={test.isPending || !testTo}
            onClick={() => test.mutate()}
          >
            <Send className="size-4" />
            {test.isPending ? "Sending…" : "Send test"}
          </Button>
        </div>
        {test.isSuccess && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" /> Test email sent to {testTo}.
          </p>
        )}
        {testError && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose-400">
            <AlertTriangle className="size-4" /> {testError}
          </p>
        )}
      </div>
    </div>
  )
}
