import { useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { ImagePlus, X, Eye, Pencil, Save, Loader2, FileUp, Paperclip, FileText, Trash2 } from "lucide-react"
import {
  createPost,
  updatePost,
  uploadImage,
  importDocument,
  uploadPostAttachment,
  type Post,
  type PostDraft,
  type Attachment,
} from "@/lib/newsletter"
import { assetUrl, ApiError } from "@/lib/api-client"
import { formatSize } from "@/lib/resources"
import { Button } from "@/components/ui/Button"
import { Markdown } from "@/components/newsletter/Markdown"
import { cn } from "@/lib/utils"

const draftSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(160),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(320),
  category: z.string().min(1, "Please enter a category").max(48),
  author: z.string().min(2, "Please enter an author").max(80),
  content: z.string().min(20, "Content must be at least 20 characters").max(200_000),
})

type FieldErrors = Partial<Record<keyof z.infer<typeof draftSchema>, string>>

// Client-side guard for fast feedback; the server enforces the same rules.
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

interface PostEditorProps {
  post?: Post
  onSaved: () => void
  onCancel: () => void
}

export function PostEditor({ post, onSaved, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "")
  const [category, setCategory] = useState(post?.category ?? "")
  const [author, setAuthor] = useState(post?.author ?? "Hexa AI")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [coverImage, setCoverImage] = useState<string | undefined>(post?.coverImage ?? undefined)
  const [attachments, setAttachments] = useState<Attachment[]>(post?.attachments ?? [])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [imageError, setImageError] = useState("")
  const [importError, setImportError] = useState("")
  const [attachError, setAttachError] = useState("")
  const [preview, setPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const attachRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({ mutationFn: uploadImage })
  const importMutation = useMutation({ mutationFn: importDocument })
  const attachMutation = useMutation({ mutationFn: uploadPostAttachment })
  const saveMutation = useMutation({
    mutationFn: (draft: PostDraft) =>
      post ? updatePost(post.id, draft) : createPost(draft),
    onSuccess: onSaved,
  })

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file
    if (!file) return
    setImageError("")
    if (!ALLOWED_IMAGE.includes(file.type)) {
      setImageError("Invalid image format (JPG, PNG, WEBP, GIF).")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image exceeds the 2MB limit.")
      return
    }
    try {
      const url = await uploadMutation.mutateAsync(file)
      setCoverImage(url)
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : "Image upload failed.")
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file
    if (!file) return
    setImportError("")
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (ext !== "docx" && ext !== "pdf") {
      setImportError("Please choose a Word (.docx) or PDF file.")
      return
    }
    try {
      const res = await importMutation.mutateAsync(file)
      setContent(res.content)
      if (!title.trim() && res.title) setTitle(res.title)
      setPreview(false)
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Import failed.")
    }
  }

  async function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file
    if (!file) return
    setAttachError("")
    try {
      const att = await attachMutation.mutateAsync(file)
      setAttachments((prev) => [...prev, att].slice(0, 20))
    } catch (err) {
      setAttachError(err instanceof ApiError ? err.message : "File upload failed.")
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = draftSchema.safeParse({ title, excerpt, category, author, content })
    if (!parsed.success) {
      const fe: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!fe[key]) fe[key] = issue.message
      }
      setErrors(fe)
      return
    }
    setErrors({})

    const draft: PostDraft = {
      ...parsed.data,
      coverImage: coverImage ?? null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
      attachments,
    }
    saveMutation.mutate(draft)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-fg">Cover image</label>
        {coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-line">
            <img
              src={assetUrl(coverImage)}
              alt="Cover image"
              className="aspect-[16/9] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setCoverImage(undefined)}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-void/80 text-white backdrop-blur hover:bg-rose-500/80"
              aria-label="Remove cover image"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-panel/30 text-muted transition-colors hover:border-accent/50 hover:text-white disabled:opacity-60"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="size-7 animate-spin" />
                <span className="text-sm">Uploading image…</span>
              </>
            ) : (
              <>
                <ImagePlus className="size-7" />
                <span className="text-sm">Upload a cover image (JPG/PNG/WEBP, ≤ 2MB)</span>
              </>
            )}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
        {imageError && <p className="text-xs text-rose-400">{imageError}</p>}
      </div>

      <Input label="Title" value={title} onChange={setTitle} error={errors.title} placeholder="Post title" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Category" value={category} onChange={setCategory} error={errors.category} placeholder="e.g. Perspectives, Guides" />
        <Input label="Author" value={author} onChange={setAuthor} error={errors.author} placeholder="Hexa AI" />
      </div>

      <Textarea label="Excerpt" value={excerpt} onChange={setExcerpt} error={errors.excerpt} rows={2} placeholder="Short description shown on the post card" />

      <Input label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="SOC, AI, SOAR" />

      {/* Content with preview toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-fg">Content (Markdown)</label>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              disabled={importMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-white disabled:opacity-60"
              title="Replace the content below with text extracted from a Word or PDF file"
            >
              {importMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
              {importMutation.isPending ? "Importing…" : "Import from Word/PDF"}
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <div className="flex rounded-lg border border-line p-0.5">
            <ToggleBtn active={!preview} onClick={() => setPreview(false)} icon={<Pencil className="size-3.5" />} label="Write" />
            <ToggleBtn active={preview} onClick={() => setPreview(true)} icon={<Eye className="size-3.5" />} label="Preview" />
          </div>
        </div>
        {importError && <p className="text-xs text-rose-400">{importError}</p>}
        {preview ? (
          <div className="min-h-[16rem] rounded-xl border border-line bg-ink/40 p-5">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-sm text-faint">No content to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder={"# Subheading\n\nPost content in **Markdown**…\n\n- Bullet point\n- ![image](https://…)"}
            className="w-full rounded-xl border border-line bg-ink/60 px-4 py-3 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
          />
        )}
        {errors.content && <p className="text-xs text-rose-400">{errors.content}</p>}
      </div>

      {/* Attachments */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-fg">Attachments</label>
        {attachments.length > 0 && (
          <ul className="flex flex-col gap-2">
            {attachments.map((a, i) => (
              <li
                key={`${a.url}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-line bg-ink/50 px-3 py-2 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted" />
                <a
                  href={assetUrl(a.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-fg hover:text-accent"
                >
                  {a.name}
                </a>
                {a.size ? <span className="shrink-0 text-xs text-faint">{formatSize(a.size)}</span> : null}
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-faint transition-colors hover:text-rose-400"
                  aria-label={`Remove ${a.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => attachRef.current?.click()}
          disabled={attachMutation.isPending || attachments.length >= 20}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-white disabled:opacity-60"
        >
          {attachMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
          {attachMutation.isPending ? "Uploading…" : "Attach a file (PDF, Office, ZIP… ≤ 50MB)"}
        </button>
        <input ref={attachRef} type="file" onChange={handleAttach} className="hidden" />
        {attachError && <p className="text-xs text-rose-400">{attachError}</p>}
      </div>

      {saveMutation.isError && (
        <p className="text-sm text-rose-400">
          {saveMutation.error instanceof ApiError
            ? saveMutation.error.message
            : "Failed to save post."}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={saveMutation.isPending || uploadMutation.isPending || importMutation.isPending || attachMutation.isPending}>
          <Save className="size-4" />
          {saveMutation.isPending ? "Saving…" : post ? "Save changes" : "Publish post"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/* ------------------------------ Inputs ------------------------------ */

const inputCls =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

function Input({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  rows: number
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={inputCls} />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  )
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-indigo/20 text-white" : "text-muted hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
