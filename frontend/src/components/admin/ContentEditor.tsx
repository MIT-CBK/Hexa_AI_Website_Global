import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Save, RotateCcw, Plus, Trash2, ChevronDown, Upload, Image as ImageIcon } from "lucide-react"
import { useSiteContent, updateContent, contentKeys } from "@/lib/content"
import { ApiError, assetUrl } from "@/lib/api-client"
import { uploadImage } from "@/lib/newsletter"
import { ICON_KEYS } from "@/data/icons"
import type { SiteContent, LV, Offering, CertGroup } from "@/data/content-types"
import { Button } from "@/components/ui/Button"

type SubTab = "home" | "solutions" | "services" | "certs"

const input =
  "w-full rounded-lg border border-line bg-ink/60 px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

const emptyLV = (): LV => ({ vi: "", en: "" })

export function ContentEditor() {
  const current = useSiteContent()
  const queryClient = useQueryClient()
  const [doc, setDoc] = useState<SiteContent>(() => structuredClone(current))
  const [tab, setTab] = useState<SubTab>("home")

  const mutation = useMutation({
    mutationFn: () => updateContent(doc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKeys.all }),
  })

  /** Immutable edit: clone → mutate → set. */
  function edit(fn: (d: SiteContent) => void) {
    setDoc((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-sm text-muted">
        Edit the content shown on the website (bilingual VI/EN). Use{" "}
        <code className="rounded bg-ink/60 px-1 text-accent">*word*</code> to apply a gradient color in
        headings. Click <strong>Save</strong> to apply immediately — no redeploy required.
      </p>

      {/* sub-tabs */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        <Sub t="home" tab={tab} set={setTab}>Home</Sub>
        <Sub t="solutions" tab={tab} set={setTab}>Solutions</Sub>
        <Sub t="services" tab={tab} set={setTab}>Services</Sub>
        <Sub t="certs" tab={tab} set={setTab}>Certifications</Sub>
      </div>

      {tab === "home" && <HomeEditor doc={doc} edit={edit} />}
      {tab === "solutions" && (
        <OfferingsEditor
          items={doc.solutions}
          edit={edit}
          pick={(d) => d.solutions}
          kind="solution"
        />
      )}
      {tab === "services" && (
        <OfferingsEditor items={doc.services} edit={edit} pick={(d) => d.services} kind="service" />
      )}
      {tab === "certs" && <CertGroupsEditor groups={doc.certGroups} edit={edit} />}

      {/* sticky save bar */}
      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-lg border border-line bg-void/90 p-4 backdrop-blur">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Save className="size-4" />
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="ghost" onClick={() => setDoc(structuredClone(current))}>
          <RotateCcw className="size-4" />
          Undo
        </Button>
        {mutation.isSuccess && <span className="text-sm text-emerald-400">Saved & applied ✓</span>}
        {mutation.isError && (
          <span className="text-sm text-rose-400">
            {mutation.error instanceof ApiError ? mutation.error.message : "Save failed."}
          </span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Home ------------------------------- */

function HomeEditor({ doc, edit }: { doc: SiteContent; edit: (fn: (d: SiteContent) => void) => void }) {
  const h = doc.home
  return (
    <div className="flex flex-col gap-5">
      <Group title="Hero">
        <LVField label="Badge" value={h.hero.badge} onChange={(v) => edit((d) => { d.home.hero.badge = v })} />
        <LVField label="Title" value={h.hero.title} onChange={(v) => edit((d) => { d.home.hero.title = v })} multiline />
        <LVField label="Description" value={h.hero.subtitle} onChange={(v) => edit((d) => { d.home.hero.subtitle = v })} multiline />
      </Group>

      <Group title="Stats" onAdd={() => edit((d) => { d.home.stats.push({ value: "", label: emptyLV() }) })}>
        {h.stats.map((s, i) => (
          <Row key={i} onRemove={() => edit((d) => { d.home.stats.splice(i, 1) })}>
            <input className={input} placeholder="Value (e.g. 24/7)" value={s.value} onChange={(e) => edit((d) => { d.home.stats[i].value = e.target.value })} />
            <LVField label="Label" value={s.label} onChange={(v) => edit((d) => { d.home.stats[i].label = v })} />
          </Row>
        ))}
      </Group>

      <Group title="Solutions section heading">
        <HeadingFields h={h.solutions} onEdit={(fn) => edit((d) => fn(d.home.solutions))} />
      </Group>
      <Group title="Services section heading">
        <HeadingFields h={h.services} onEdit={(fn) => edit((d) => fn(d.home.services))} />
      </Group>

      <Group title="Vision & Mission">
        <LVField label="Label" value={h.vision.eyebrow} onChange={(v) => edit((d) => { d.home.vision.eyebrow = v })} />
        <LVField label="Title" value={h.vision.title} onChange={(v) => edit((d) => { d.home.vision.title = v })} multiline />
        <LVField label="Vision — title" value={h.vision.visionTitle} onChange={(v) => edit((d) => { d.home.vision.visionTitle = v })} />
        <LVField label="Vision — body" value={h.vision.visionBody} onChange={(v) => edit((d) => { d.home.vision.visionBody = v })} multiline />
        <LVField label="Mission — title" value={h.vision.missionTitle} onChange={(v) => edit((d) => { d.home.vision.missionTitle = v })} />
        <LVField label="Mission — body" value={h.vision.missionBody} onChange={(v) => edit((d) => { d.home.vision.missionBody = v })} multiline />
        <SubGroup title="Core values" onAdd={() => edit((d) => { d.home.vision.values.push({ iconKey: ICON_KEYS[0], title: emptyLV(), desc: emptyLV() }) })}>
          {h.vision.values.map((val, i) => (
            <Row key={i} onRemove={() => edit((d) => { d.home.vision.values.splice(i, 1) })}>
              <IconPicker value={val.iconKey} onChange={(k) => edit((d) => { d.home.vision.values[i].iconKey = k })} />
              <LVField label="Title" value={val.title} onChange={(v) => edit((d) => { d.home.vision.values[i].title = v })} />
              <LVField label="Description" value={val.desc} onChange={(v) => edit((d) => { d.home.vision.values[i].desc = v })} multiline />
            </Row>
          ))}
        </SubGroup>
      </Group>

      <Group title="Certifications section heading">
        <HeadingFields h={h.certs} onEdit={(fn) => edit((d) => fn(d.home.certs))} />
      </Group>

      <Group title="Newsletter (preview)">
        <LVField label="Label" value={h.newsletter.eyebrow} onChange={(v) => edit((d) => { d.home.newsletter.eyebrow = v })} />
        <LVField label="Title" value={h.newsletter.previewTitle} onChange={(v) => edit((d) => { d.home.newsletter.previewTitle = v })} multiline />
        <LVField label="Description" value={h.newsletter.previewDesc} onChange={(v) => edit((d) => { d.home.newsletter.previewDesc = v })} multiline />
      </Group>

      <Group title="Call to action (CTA)">
        <LVField label="Title" value={h.cta.title} onChange={(v) => edit((d) => { d.home.cta.title = v })} multiline />
        <LVField label="Description" value={h.cta.desc} onChange={(v) => edit((d) => { d.home.cta.desc = v })} multiline />
      </Group>

      <Group title="Contact">
        <LVField label="Label" value={h.contact.eyebrow} onChange={(v) => edit((d) => { d.home.contact.eyebrow = v })} />
        <LVField label="Title" value={h.contact.title} onChange={(v) => edit((d) => { d.home.contact.title = v })} multiline />
        <LVField label="Description" value={h.contact.desc} onChange={(v) => edit((d) => { d.home.contact.desc = v })} multiline />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg">Contact email</span>
          <input className={input} type="email" value={h.contact.email} onChange={(e) => edit((d) => { d.home.contact.email = e.target.value })} />
        </label>
        <LVField label="Office" value={h.contact.office} onChange={(v) => edit((d) => { d.home.contact.office = v })} />
      </Group>
    </div>
  )
}

function HeadingFields({ h, onEdit }: { h: { eyebrow: LV; title: LV; desc: LV }; onEdit: (fn: (x: { eyebrow: LV; title: LV; desc: LV }) => void) => void }) {
  return (
    <>
      <LVField label="Label" value={h.eyebrow} onChange={(v) => onEdit((x) => { x.eyebrow = v })} />
      <LVField label="Title" value={h.title} onChange={(v) => onEdit((x) => { x.title = v })} multiline />
      <LVField label="Description" value={h.desc} onChange={(v) => onEdit((x) => { x.desc = v })} multiline />
    </>
  )
}

/* ----------------------------- Offerings ----------------------------- */

function OfferingsEditor({
  items,
  edit,
  pick,
  kind,
}: {
  items: Offering[]
  edit: (fn: (d: SiteContent) => void) => void
  pick: (d: SiteContent) => Offering[]
  kind: "solution" | "service"
}) {
  function addItem() {
    edit((d) =>
      pick(d).push({
        slug: `new-item-${pick(d).length + 1}`,
        abbr: "New",
        iconKey: ICON_KEYS[0],
        gradient: "from-accent to-accent-strong",
        category: emptyLV(),
        name: emptyLV(),
        tagline: emptyLV(),
        summary: emptyLV(),
        overview: emptyLV(),
        features: [],
        outcomes: [],
      }),
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((o, i) => (
        <Collapsible key={i} title={`${o.abbr} — ${o.name.vi || o.slug}`} onRemove={() => edit((d) => { pick(d).splice(i, 1) })}>
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Slug (URL)" value={o.slug} onChange={(val) => edit((d) => { pick(d)[i].slug = val })} />
            <TextField label="Abbreviation" value={o.abbr} onChange={(val) => edit((d) => { pick(d)[i].abbr = val })} />
            <IconPicker label="Icon" value={o.iconKey} onChange={(k) => edit((d) => { pick(d)[i].iconKey = k })} />
          </div>
          <TextField label="Gradient (Tailwind class)" value={o.gradient} onChange={(val) => edit((d) => { pick(d)[i].gradient = val })} />
          <LVField label="Category" value={o.category} onChange={(v) => edit((d) => { pick(d)[i].category = v })} />
          <LVField label="Name" value={o.name} onChange={(v) => edit((d) => { pick(d)[i].name = v })} />
          <LVField label="Tagline" value={o.tagline} onChange={(v) => edit((d) => { pick(d)[i].tagline = v })} multiline />
          <LVField label="Summary (card)" value={o.summary} onChange={(v) => edit((d) => { pick(d)[i].summary = v })} multiline />
          <LVField label="Overview" value={o.overview} onChange={(v) => edit((d) => { pick(d)[i].overview = v })} multiline />

          <SubGroup title="Features" onAdd={() => edit((d) => { pick(d)[i].features.push({ title: emptyLV(), desc: emptyLV() }) })}>
            {o.features.map((f, fi) => (
              <Row key={fi} onRemove={() => edit((d) => { pick(d)[i].features.splice(fi, 1) })}>
                <LVField label="Name" value={f.title} onChange={(v) => edit((d) => { pick(d)[i].features[fi].title = v })} />
                <LVField label="Description" value={f.desc} onChange={(v) => edit((d) => { pick(d)[i].features[fi].desc = v })} multiline />
              </Row>
            ))}
          </SubGroup>

          <SubGroup title="Outcomes" onAdd={() => edit((d) => { pick(d)[i].outcomes.push(emptyLV()) })}>
            {o.outcomes.map((oc, oi) => (
              <Row key={oi} onRemove={() => edit((d) => { pick(d)[i].outcomes.splice(oi, 1) })}>
                <LVField label="Outcome" value={oc} onChange={(v) => edit((d) => { pick(d)[i].outcomes[oi] = v })} />
              </Row>
            ))}
          </SubGroup>
        </Collapsible>
      ))}
      <div>
        <Button variant="outline" onClick={addItem}>
          <Plus className="size-4" />
          Add {kind === "solution" ? "solution" : "service"}
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------- Cert groups ---------------------------- */

function CertGroupsEditor({ groups, edit }: { groups: CertGroup[]; edit: (fn: (d: SiteContent) => void) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g, i) => (
        <Collapsible key={i} title={g.title.vi || g.key} onRemove={() => edit((d) => { d.certGroups.splice(i, 1) })}>
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Key" value={g.key} onChange={(val) => edit((d) => { d.certGroups[i].key = val })} />
            <IconPicker label="Icon" value={g.iconKey} onChange={(k) => edit((d) => { d.certGroups[i].iconKey = k })} />
            <TextField label="Gradient" value={g.gradient} onChange={(val) => edit((d) => { d.certGroups[i].gradient = val })} />
          </div>
          <LVField label="Group name" value={g.title} onChange={(v) => edit((d) => { d.certGroups[i].title = v })} />
          <LVField label="Description" value={g.desc} onChange={(v) => edit((d) => { d.certGroups[i].desc = v })} multiline />
          <SubGroup title="Certifications" onAdd={() => edit((d) => { d.certGroups[i].items.push({ code: "NEW", issuer: "", name: emptyLV(), blurb: emptyLV() }) })}>
            {g.items.map((c, ci) => (
              <Row key={ci} onRemove={() => edit((d) => { d.certGroups[i].items.splice(ci, 1) })}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Code" value={c.code} onChange={(val) => edit((d) => { d.certGroups[i].items[ci].code = val })} />
                  <TextField label="Issuer" value={c.issuer} onChange={(val) => edit((d) => { d.certGroups[i].items[ci].issuer = val })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={c.elite ?? false} onChange={(e) => edit((d) => { d.certGroups[i].items[ci].elite = e.target.checked })} />
                  Elite
                </label>
                <CertLogoField
                  value={c.logoUrl}
                  onChange={(url) => edit((d) => { d.certGroups[i].items[ci].logoUrl = url })}
                />
                <LVField label="Full name" value={c.name} onChange={(v) => edit((d) => { d.certGroups[i].items[ci].name = v })} />
                <LVField label="Description" value={c.blurb} onChange={(v) => edit((d) => { d.certGroups[i].items[ci].blurb = v })} multiline />
              </Row>
            ))}
          </SubGroup>
        </Collapsible>
      ))}
      <div>
        <Button
          variant="outline"
          onClick={() => edit((d) => { d.certGroups.push({ key: `group-${d.certGroups.length + 1}`, iconKey: ICON_KEYS[0], gradient: "from-accent to-accent-strong", title: emptyLV(), desc: emptyLV(), items: [] }) })}
        >
          <Plus className="size-4" />
          Add certification group
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------ Primitives ------------------------------ */

function Sub({ t, tab, set, children }: { t: SubTab; tab: SubTab; set: (t: SubTab) => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => set(t)}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === t ? "border-cyan text-white" : "border-transparent text-muted hover:text-white"}`}
    >
      {children}
    </button>
  )
}

function Group({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-fg">{title}</h3>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function SubGroup({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line/70 bg-ink/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{title}</span>
        <button onClick={onAdd} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          <Plus className="size-3.5" />
          Add
        </button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Row({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border border-line bg-panel/40 p-3 pr-10">
      <div className="flex flex-col gap-2">{children}</div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded text-faint hover:bg-rose-500/10 hover:text-rose-400"
        aria-label="Remove"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

function Collapsible({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-line bg-panel/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
        <span className="flex items-center gap-2 font-medium text-fg">
          <ChevronDown className="size-4 text-faint transition-transform group-open:rotate-180" />
          {title}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); onRemove() }}
          className="grid size-8 place-items-center rounded-lg text-faint hover:bg-rose-500/10 hover:text-rose-400"
          aria-label="Remove item"
        >
          <Trash2 className="size-4" />
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-line p-4">{children}</div>
    </details>
  )
}

function LVField({ label, value, onChange, multiline }: { label: string; value: LV; onChange: (v: LV) => void; multiline?: boolean }) {
  const F = multiline ? "textarea" : "input"
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <F className={input} rows={multiline ? 2 : undefined} placeholder="🇻🇳 Vietnamese" value={value.vi} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, vi: e.target.value })} />
        <F className={input} rows={multiline ? 2 : undefined} placeholder="🇬🇧 English" value={value.en} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, en: e.target.value })} />
      </div>
    </div>
  )
}

function CertLogoField({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-picking the same file
    if (!file) return
    setErr(null)
    setBusy(true)
    try {
      onChange(await uploadImage(file))
    } catch (uploadErr) {
      setErr(uploadErr instanceof ApiError ? uploadErr.message : "Logo upload failed")
    } finally {
      setBusy(false)
    }
  }

  const preview = value ? (assetUrl(value) ?? value) : null
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">Logo (optional — replaces the default icon)</span>
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white/5">
          {preview ? (
            <img src={preview} alt="logo" className="size-full object-contain p-1" />
          ) : (
            <ImageIcon className="size-5 text-faint" />
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent/50">
          <Upload className="size-3.5" />
          {busy ? "Uploading…" : value ? "Change logo" : "Upload logo"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={onPick}
            disabled={busy}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange(undefined)} className="text-xs text-rose-400 hover:underline">
            Remove logo
          </button>
        )}
      </div>
      {err && <span className="text-xs text-rose-400">{err}</span>}
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function IconPicker({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-fg">{label}</span>}
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        {ICON_KEYS.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    </label>
  )
}
