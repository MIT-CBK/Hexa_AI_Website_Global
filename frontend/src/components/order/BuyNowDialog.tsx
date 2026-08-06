import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { X, CheckCircle2, ArrowRight, Cloud, Server } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PRICING, TERMS, REGIONS, type Deployment } from "@/data/pricing"
import { LANGUAGES } from "@/data/languages"
import { submitOrder, type OrderPayload } from "@/lib/orders"
import { ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface Props {
  slug: string
  abbr: string
  name: string
  open: boolean
  onClose: () => void
}

const inputCls =
  "w-full rounded-md border border-line bg-ink/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
const labelCls = "mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase"

const ROLES = [
  "CEO", "CIO", "CTO", "CISO", "CPO", "COO",
  "VP of Engineering", "VP of Security",
  "IT Director", "Security Director",
  "SOC Manager", "IT Manager",
  "Security Analyst", "Network Engineer", "DevOps Engineer",
  "Procurement", "Consultant", "Other",
]

export function BuyNowDialog({ slug, abbr, name, open, onClose }: Props) {
  const cfg = PRICING[slug]

  const [deployment, setDeployment] = useState<Deployment>("cloud")
  const [quantity, setQuantity] = useState<number>(cfg?.default ?? 1)
  const [sensors, setSensors] = useState<number>(2)
  const [term, setTerm] = useState<string>(TERMS[0])
  const [region, setRegion] = useState<string>(REGIONS[0])
  const [aiops, setAiops] = useState(false)
  const [aiopsYears, setAiopsYears] = useState<number>(1)
  const [multiTenant, setMultiTenant] = useState(false)
  const [tenants, setTenants] = useState<number>(2)
  const [languagePack, setLanguagePack] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])
  const [email, setEmail] = useState("")
  const [contactName, setContactName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [notes, setNotes] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: (b: OrderPayload) => submitOrder(b),
    onSuccess: () => setSubmitted(true),
  })

  // Reset to a clean form each time the dialog opens.
  useEffect(() => {
    if (!open || !cfg) return
    setDeployment(cfg.deployments[0])
    setQuantity(cfg.default)
    setSensors(2)
    setTerm(TERMS[0])
    setRegion(REGIONS[0])
    setAiops(false)
    setAiopsYears(1)
    setMultiTenant(false)
    setTenants(2)
    setLanguagePack(false)
    setLanguages([])
    setEmail("")
    setContactName("")
    setCompany("")
    setRole("")
    setNotes("")
    setEmailErr("")
    setSubmitted(false)
    mutation.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slug])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !cfg) return null

  const isCloud = deployment === "cloud"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr("Enter a valid email address")
      return
    }
    setEmailErr("")
    const payload: OrderPayload = {
      product: abbr,
      productName: name,
      deployment,
      metric: cfg.metric,
      metricLabel: cfg.metricLabel,
      quantity,
      sensors: cfg.hasSensors ? sensors : undefined,
      term: isCloud ? term : undefined,
      region: isCloud ? region : undefined,
      aiops,
      aiopsTerm: aiops ? `${aiopsYears} year${aiopsYears > 1 ? "s" : ""}` : undefined,
      multiTenant,
      tenants: multiTenant ? tenants : undefined,
      languagePack,
      languages: languagePack && languages.length ? languages : undefined,
      email: email.trim(),
      name: contactName.trim() || undefined,
      company: company.trim() || undefined,
      role: role.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    mutation.mutate(payload)
  }

  const submitError =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? "Something went wrong." : ""

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-lg border border-line-strong bg-panel shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <span className="eyebrow text-accent">Configure &amp; order</span>
            <h3 className="mt-0.5 text-lg font-semibold text-fg">
              {abbr} <span className="font-normal text-muted">— {name}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <CheckCircle2 className="size-14 text-accent" />
            <h4 className="text-xl font-semibold">Order request received</h4>
            <p className="max-w-sm text-sm text-muted">
              Thank you. We've emailed a confirmation to{" "}
              <span className="text-fg">{email}</span> and our team will reach out within one
              business day to finalize details and pricing.
            </p>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {/* Deployment */}
            <label className={labelCls}>Deployment</label>
            <div className="grid grid-cols-2 gap-3">
              {cfg.deployments.map((d) => {
                const active = deployment === d
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDeployment(d)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3.5 py-3 text-sm transition-colors",
                      active
                        ? "border-accent bg-accent/10 text-fg"
                        : "border-line text-muted hover:border-line-strong hover:text-fg",
                    )}
                  >
                    {d === "cloud" ? <Cloud className="size-4" /> : <Server className="size-4" />}
                    <span className="font-medium capitalize">
                      {d === "cloud" ? "Cloud" : "Self-hosted"}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-faint">
              {isCloud
                ? "Subscription, hosted by Hexa AI — billed for the chosen term."
                : "Perpetual license — deploy in your own environment (one-time, no term)."}
            </p>

            {/* Capacity */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{cfg.metricLabel}</label>
                <input
                  type="number"
                  min={cfg.min}
                  step={cfg.step}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(cfg.min, Number(e.target.value) || cfg.min))}
                  className={inputCls}
                />
                {cfg.metricHint && <p className="mt-1 text-xs text-faint">{cfg.metricHint}</p>}
              </div>
              {cfg.hasSensors && (
                <div>
                  <label className={labelCls}>Sensors</label>
                  <input
                    type="number"
                    min={1}
                    value={sensors}
                    onChange={(e) => setSensors(Math.max(1, Number(e.target.value) || 1))}
                    className={inputCls}
                  />
                  <p className="mt-1 text-xs text-faint">Physical/virtual capture points</p>
                </div>
              )}
            </div>

            {/* Cloud-only: region + term */}
            {isCloud && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Region</label>
                  <select className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)}>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Subscription term</label>
                  <select className={inputCls} value={term} onChange={(e) => setTerm(e.target.value)}>
                    {TERMS.map((tm) => (
                      <option key={tm} value={tm}>
                        {tm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Add-ons */}
            <div className="mt-5 rounded-md border border-line bg-ink/30 p-4">
              <span className={labelCls}>Add-ons</span>
              <div className="flex flex-col gap-3">
                <div>
                  <Toggle checked={aiops} onChange={setAiops} label="AIOps engine" hint="AI anomaly detection, prediction & auto-remediation" />
                  {aiops && (
                    <div className="mt-2 pl-7">
                      <label className="mb-1 block text-xs text-muted">AIOps term (years)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={aiopsYears}
                        onChange={(e) => setAiopsYears(Math.max(1, Number(e.target.value) || 1))}
                        className={inputCls + " max-w-[160px]"}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Toggle
                    checked={multiTenant}
                    onChange={setMultiTenant}
                    label="Multi-tenancy"
                    hint="Isolated tenants for MSSP / multi-org use"
                  />
                  {multiTenant && (
                    <div className="mt-2 pl-7">
                      <label className="mb-1 block text-xs text-muted">Number of tenants</label>
                      <input
                        type="number"
                        min={2}
                        value={tenants}
                        onChange={(e) => setTenants(Math.max(1, Number(e.target.value) || 1))}
                        className={inputCls + " max-w-[160px]"}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Toggle
                    checked={languagePack}
                    onChange={(v) => {
                      setLanguagePack(v)
                      if (!v) setLanguages([])
                    }}
                    label="Language pack"
                    hint="Localized UI and reports"
                  />
                  {languagePack && (
                    <div className="mt-2 pl-7">
                      <LanguagePicker selected={languages} onChange={setLanguages} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-6 border-t border-line pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Work email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputCls}
                  />
                  {emailErr && <p className="mt-1 text-xs text-rose-400">{emailErr}</p>}
                </div>
                <div>
                  <label className={labelCls}>Name</label>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Your role</label>
                  <input
                    list="hexa-roles"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. CISO, IT Director, SOC Manager…"
                    className={inputCls}
                  />
                  <datalist id="hexa-roles">
                    {ROLES.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything we should know about your environment or timeline?"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {submitError && <p className="mt-4 text-sm text-rose-400">{submitError}</p>}

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting…" : "Submit order request"}
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 text-center text-xs text-faint">
              No payment is taken now — this sends your configuration to our team for confirmation.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function LanguagePicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const query = q.trim().toLowerCase()
  const filtered = (query ? LANGUAGES.filter((l) => l.toLowerCase().includes(query)) : LANGUAGES).slice(0, 120)

  const remove = (l: string) => onChange(selected.filter((x) => x !== l))
  const pick = (l: string) => {
    onChange(selected.includes(l) ? selected.filter((x) => x !== l) : [...selected, l])
    setQ("")
    setOpen(false) // collapse after choosing
  }

  // Close when clicking outside the picker.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div ref={ref} className="relative max-w-xs">
      <label className="mb-1 block text-xs text-muted">
        Languages{selected.length ? ` — ${selected.length} selected` : ""}
      </label>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => remove(l)}
              className="inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs text-fg hover:bg-accent/20"
            >
              {l}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={selected.length ? "Add another language…" : "Search & select languages…"}
        className={inputCls}
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-line-strong bg-elevated shadow-card">
          {filtered.map((l) => {
            const on = selected.includes(l)
            return (
              <button
                type="button"
                key={l}
                onClick={() => pick(l)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-white/5",
                  on ? "text-accent" : "text-fg",
                )}
              >
                {l}
                {on && <CheckCircle2 className="size-3.5 text-accent" />}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-3 text-xs text-faint">No language matches "{q}".</p>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-[var(--color-accent)]"
      />
      <span>
        <span className="text-sm font-medium text-fg">{label}</span>
        {hint && <span className="block text-xs text-faint">{hint}</span>}
      </span>
    </label>
  )
}
