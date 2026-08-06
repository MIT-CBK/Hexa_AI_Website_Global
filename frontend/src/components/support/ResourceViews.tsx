import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, FileText, FileArchive, BookOpen, ChevronDown, Package, Search } from "lucide-react"
import {
  listResources,
  resourceKeys,
  catLabel,
  GROUP_LABELS,
  formatSize,
  type Resource,
} from "@/lib/resources"
import { assetUrl } from "@/lib/api-client"
import { Markdown } from "@/components/newsletter/Markdown"
import { Spinner, ErrorState } from "@/components/common/States"
import { useLang } from "@/i18n"
import { cn } from "@/lib/utils"

/* ----------------------------- Filtering ----------------------------- */

function useResourceFilter(items: Resource[]) {
  const [query, setQuery] = useState("")
  const [product, setProduct] = useState("__all__")

  const products = useMemo(
    () => Array.from(new Set(items.map((r) => r.product).filter((p): p is string => !!p))).sort(),
    [items],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((r) => {
      const matchProduct = product === "__all__" || r.product === product
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.version ?? "").toLowerCase().includes(q)
      return matchProduct && matchQuery
    })
  }, [items, query, product])

  return { query, setQuery, product, setProduct, products, filtered }
}

function FilterBar({
  query,
  setQuery,
  product,
  setProduct,
  products,
  placeholder,
}: {
  query: string
  setQuery: (v: string) => void
  product: string
  setProduct: (v: string) => void
  products: string[]
  placeholder: string
}) {
  const { t } = useLang()
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-line bg-ink/60 py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={product === "__all__"} onClick={() => setProduct("__all__")}>
            {t("support.allProducts")}
          </FilterChip>
          {products.map((p) => (
            <FilterChip key={p} active={product === p} onClick={() => setProduct(p)}>
              {p}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/15 text-white"
          : "border-line text-muted hover:border-accent/50 hover:text-white",
      )}
    >
      {children}
    </button>
  )
}

/* ----------------------------- Downloads ----------------------------- */

const DOWNLOAD_GROUPS: { group: string; cats: string[] }[] = [
  { group: "installation", cats: ["installation"] },
  { group: "update", cats: ["hotfix", "fixpack", "agent", "collector", "manager"] },
]

export function DownloadView() {
  const { tr } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: resourceKeys.customer("download"),
    queryFn: () => listResources("download"),
  })
  const items = data ?? []
  const { query, setQuery, product, setProduct, products, filtered } = useResourceFilter(items)
  const { t } = useLang()
  if (isPending) return <Spinner />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (items.length === 0) return <Empty icon={<Package className="size-10 text-faint" />} text="No downloads available yet." />

  const hasResults = filtered.length > 0

  return (
    <div>
      <FilterBar
        query={query}
        setQuery={setQuery}
        product={product}
        setProduct={setProduct}
        products={products}
        placeholder={t("support.searchFiles")}
      />
      {!hasResults ? (
        <Empty icon={<Search className="size-10 text-faint" />} text={t("support.noResults")} />
      ) : (
      <div className="flex flex-col gap-10">
      {DOWNLOAD_GROUPS.map(({ group, cats }) => {
        const groupItems = filtered.filter((r) => cats.includes(r.category))
        if (groupItems.length === 0) return null
        return (
          <section key={group}>
            <h3 className="mb-4 text-lg font-semibold">{tr(GROUP_LABELS[group])}</h3>
            <div className="flex flex-col gap-5">
              {cats.map((cat) => {
                const catItems = groupItems.filter((r) => r.category === cat)
                if (catItems.length === 0) return null
                return (
                  <div key={cat}>
                    {group === "update" && (
                      <p className="mb-2 font-mono text-[11px] tracking-wide text-faint uppercase">
                        {tr(catLabel(cat))}
                      </p>
                    )}
                    <div className="flex flex-col gap-2.5">
                      {catItems.map((r) => (
                        <DownloadRow key={r.id} r={r} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
      </div>
      )}
    </div>
  )
}

function DownloadRow({ r }: { r: Resource }) {
  const href = assetUrl(r.fileUrl)
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel/40 p-4 transition-colors hover:border-accent/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className="icon-tile size-10 shrink-0">
          <FileArchive className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-fg">{r.title}</span>
            {r.version && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-muted">{r.version}</span>
            )}
            {r.product && (
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">{r.product}</span>
            )}
          </div>
          {r.description && <p className="mt-0.5 truncate text-xs text-muted">{r.description}</p>}
        </div>
      </div>
      {href && (
        <a
          href={href}
          download={r.fileName ?? undefined}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo px-3 py-2 text-xs font-medium text-white hover:bg-brand"
        >
          <Download className="size-3.5" />
          {formatSize(r.fileSize) || "Download"}
        </a>
      )}
    </div>
  )
}

/* ----------------------------- Documents ----------------------------- */

export function DocumentView() {
  const { t, tr } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: resourceKeys.customer("document"),
    queryFn: () => listResources("document"),
  })
  const items = data ?? []
  const { query, setQuery, product, setProduct, products, filtered } = useResourceFilter(items)
  if (isPending) return <Spinner />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (items.length === 0) return <Empty icon={<BookOpen className="size-10 text-faint" />} text="No documents available yet." />

  const guides = filtered.filter((r) => r.category === "product-guide" || r.category === "installation-guide")
  const collateral = filtered.filter((r) => r.category === "datasheet" || r.category === "brochure")
  const kbs = filtered.filter((r) => r.category === "kb")

  return (
    <div>
      <FilterBar
        query={query}
        setQuery={setQuery}
        product={product}
        setProduct={setProduct}
        products={products}
        placeholder={t("support.searchDocs")}
      />
      {filtered.length === 0 ? (
        <Empty icon={<Search className="size-10 text-faint" />} text={t("support.noResults")} />
      ) : (
    <div className="flex flex-col gap-10">
      {guides.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold">{tr(GROUP_LABELS.guide)}</h3>
          <div className="flex flex-col gap-2.5">
            {guides.map((r) => (
              <DocCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      {collateral.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold">{tr(GROUP_LABELS.collateral)}</h3>
          <div className="flex flex-col gap-2.5">
            {collateral.map((r) => (
              <DocCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      {kbs.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold">{tr(GROUP_LABELS.kb)}</h3>
          <div className="flex flex-col gap-2.5">
            {kbs.map((r) => (
              <KbCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}
    </div>
      )}
    </div>
  )
}

function DocCard({ r }: { r: Resource }) {
  const { tr } = useLang()
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel/40 p-4 hover:border-accent/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className="icon-tile size-10 shrink-0">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-fg">{r.title}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-muted">{tr(catLabel(r.category))}</span>
            {r.product && <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">{r.product}</span>}
          </div>
          {r.description && <p className="mt-0.5 truncate text-xs text-muted">{r.description}</p>}
        </div>
      </div>
      {assetUrl(r.fileUrl) && (
        <a href={assetUrl(r.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo px-3 py-2 text-xs font-medium text-white hover:bg-brand">
          <Download className="size-3.5" />
          {formatSize(r.fileSize) || "Open"}
        </a>
      )}
    </div>
  )
}

function KbCard({ r }: { r: Resource }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-line bg-panel/40">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="icon-tile size-10 shrink-0">
          <BookOpen className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-medium text-fg">{r.title}</span>
          {r.product && <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">{r.product}</span>}
        </div>
        <ChevronDown className={`size-4 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line p-4">
          {r.content ? <Markdown>{r.content}</Markdown> : null}
          {assetUrl(r.fileUrl) && (
            <a href={assetUrl(r.fileUrl)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              <Download className="size-4" />
              {r.fileName ?? "Download file"}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-20 text-center">
      {icon}
      <p className="text-muted">{text}</p>
    </div>
  )
}
