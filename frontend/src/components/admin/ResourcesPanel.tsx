import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Upload, FileArchive, FileText, BookOpen } from "lucide-react"
import {
  adminListResources,
  createResource,
  updateResource,
  deleteResource,
  uploadResourceFile,
  resourceKeys,
  catLabel,
  formatSize,
  DOWNLOAD_CATS,
  DOCUMENT_CATS,
  type Resource,
  type ResourceKind,
} from "@/lib/resources"
import { ApiError } from "@/lib/api-client"
import { useSiteContent, allOfferings } from "@/lib/content"
import { Button } from "@/components/ui/Button"
import { Spinner, ErrorState } from "@/components/common/States"
import { useLang } from "@/i18n"
import { cn } from "@/lib/utils"

const inputCls =
  "w-full rounded-lg border border-line bg-ink/60 px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

interface FormState {
  id?: string
  kind: ResourceKind
  category: string
  product: string
  title: string
  version: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: number | null
  content: string
}

function emptyForm(): FormState {
  return {
    kind: "download",
    category: "installation",
    product: "",
    title: "",
    version: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    content: "",
  }
}

export function ResourcesPanel() {
  const { tr } = useLang()
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: resourceKeys.admin(),
    queryFn: adminListResources,
  })
  const [form, setForm] = useState<FormState | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: resourceKeys.all })
  const deleteMut = useMutation({ mutationFn: deleteResource, onSuccess: invalidate })

  function startEdit(r: Resource) {
    setForm({
      id: r.id,
      kind: r.kind,
      category: r.category,
      product: r.product ?? "",
      title: r.title,
      version: r.version ?? "",
      description: r.description ?? "",
      fileUrl: r.fileUrl ?? "",
      fileName: r.fileName ?? "",
      fileSize: r.fileSize,
      content: r.content ?? "",
    })
  }

  if (form) return <ResourceForm form={form} setForm={setForm} onDone={() => setForm(null)} onSaved={invalidate} />

  const resources = data ?? []

  return (
    <section className="rounded-lg border border-line bg-panel/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Downloads & Documents</h2>
        <Button size="sm" onClick={() => setForm(emptyForm())}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : resources.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">
          No resources yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          {resources.map((r, i) => (
            <div key={r.id} className={cn("flex items-center gap-3 bg-panel/40 p-3.5", i > 0 && "border-t border-line")}>
              <span className="icon-tile size-9 shrink-0">
                {r.kind === "download" ? <FileArchive className="size-4" /> : r.category === "kb" ? <BookOpen className="size-4" /> : <FileText className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{r.title}</p>
                <p className="truncate text-xs text-faint">
                  {tr(catLabel(r.category))}
                  {r.product ? ` · ${r.product}` : ""}
                  {r.version ? ` · ${r.version}` : ""}
                  {r.fileSize ? ` · ${formatSize(r.fileSize)}` : ""}
                </p>
              </div>
              <button onClick={() => startEdit(r)} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-accent" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => window.confirm(`Delete "${r.title}"?`) && deleteMut.mutate(r.id)}
                disabled={deleteMut.isPending}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ResourceForm({
  form,
  setForm,
  onDone,
  onSaved,
}: {
  form: FormState
  setForm: (f: FormState) => void
  onDone: () => void
  onSaved: () => void
}) {
  const { tr } = useLang()
  const products = allOfferings(useSiteContent()).map((o) => o.abbr)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileErr, setFileErr] = useState("")
  const cats = form.kind === "download" ? DOWNLOAD_CATS : DOCUMENT_CATS
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch })

  const uploadMut = useMutation({ mutationFn: uploadResourceFile })
  const saveMut = useMutation({
    mutationFn: () => {
      const draft = {
        kind: form.kind,
        category: form.category,
        product: form.product || null,
        title: form.title,
        version: form.version || null,
        description: form.description || null,
        fileUrl: form.fileUrl || null,
        fileName: form.fileName || null,
        fileSize: form.fileSize,
        content: form.content || null,
      }
      return form.id ? updateResource(form.id, draft) : createResource(draft)
    },
    onSuccess: () => {
      onSaved()
      onDone()
    },
  })

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setFileErr("")
    try {
      const r = await uploadMut.mutateAsync(file)
      set({ fileUrl: r.url, fileName: r.name, fileSize: r.size })
    } catch (err) {
      setFileErr(err instanceof ApiError ? err.message : "File upload failed.")
    }
  }

  return (
    <section className="rounded-lg border border-line bg-panel/40 p-6">
      <h2 className="mb-4 text-lg font-semibold">{form.id ? "Edit resource" : "Add resource"}</h2>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Type">
            <select
              className={inputCls}
              value={form.kind}
              onChange={(e) => {
                const kind = e.target.value as ResourceKind
                set({ kind, category: (kind === "download" ? DOWNLOAD_CATS : DOCUMENT_CATS)[0].key })
              }}
            >
              <option value="download">Download</option>
              <option value="document">Document</option>
            </select>
          </Field>
          <Field label="Category">
            <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {cats.map((c) => (
                <option key={c.key} value={c.key}>{tr(c.label)}</option>
              ))}
            </select>
          </Field>
          <Field label="Product">
            <select className={inputCls} value={form.product} onChange={(e) => set({ product: e.target.value })}>
              <option value="">General</option>
              {products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Title">
          <input className={inputCls} value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>

        {form.kind === "download" && (
          <Field label="Version">
            <input className={inputCls} placeholder="e.g. v3.2.0" value={form.version} onChange={(e) => set({ version: e.target.value })} />
          </Field>
        )}

        <Field label="Description">
          <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>

        {form.category === "kb" && (
          <Field label="Content (Markdown)">
            <textarea className={`${inputCls} font-mono`} rows={8} value={form.content} onChange={(e) => set({ content: e.target.value })} />
          </Field>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-fg">Attachment</span>
          {form.fileName ? (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-ink/50 px-3 py-2 text-sm text-muted">
              <FileArchive className="size-4" />
              <span className="max-w-[220px] truncate">{form.fileName}</span>
              {form.fileSize ? <span className="text-xs text-faint">({formatSize(form.fileSize)})</span> : null}
              <button onClick={() => set({ fileUrl: "", fileName: "", fileSize: null })} className="ml-auto text-faint hover:text-rose-400">
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadMut.isPending}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-sm text-muted hover:border-accent/50 hover:text-white disabled:opacity-60"
            >
              <Upload className="size-4" />
              {uploadMut.isPending ? "Uploading…" : `Upload file (≤ ${form.kind === "download" ? "10GB" : "50MB"})`}
            </button>
          )}
          <input ref={fileRef} type="file" onChange={onPickFile} className="hidden" />
          {fileErr && <span className="text-xs text-rose-400">{fileErr}</span>}
        </div>

        {saveMut.isError && (
          <p className="text-sm text-rose-400">
            {saveMut.error instanceof ApiError ? saveMut.error.message : "Save failed."}
          </p>
        )}

        <div className="flex gap-3">
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.title}>
            {saveMut.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="ghost" onClick={onDone}>Cancel</Button>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  )
}
