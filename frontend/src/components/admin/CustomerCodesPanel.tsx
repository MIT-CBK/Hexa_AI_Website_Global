import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { KeyRound, Plus, Trash2, Copy, Check, Power } from "lucide-react"
import {
  listCodes,
  createCode,
  setCodeActive,
  setCodeProducts,
  deleteCode,
  codeKeys,
  type CustomerCode,
} from "@/lib/support"
import { ApiError } from "@/lib/api-client"
import { useSiteContent, allOfferings } from "@/lib/content"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/common/States"
import { cn } from "@/lib/utils"

export function CustomerCodesPanel() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({ queryKey: codeKeys.all, queryFn: listCodes })
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const allProducts = allOfferings(useSiteContent()).map((o) => o.abbr)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: codeKeys.all })
  const productsMut = useMutation({
    mutationFn: (v: { id: string; products: string[] }) => setCodeProducts(v.id, v.products),
    onSuccess: invalidate,
  })
  const createMut = useMutation({
    mutationFn: (label: string) => createCode(label),
    onSuccess: () => {
      setAdding(false)
      invalidate()
    },
  })
  const activeMut = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => setCodeActive(v.id, v.active),
    onSuccess: invalidate,
  })
  const deleteMut = useMutation({ mutationFn: deleteCode, onSuccess: invalidate })

  function copy(code: string) {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  const codes = data ?? []

  return (
    <section className="rounded-lg border border-line bg-panel/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-accent/12 text-accent ring-1 ring-accent/25">
            <KeyRound className="size-5" />
          </span>
          Customer codes
        </h2>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Issue code
          </Button>
        )}
      </div>

      <p className="mb-4 text-sm text-muted">
        Customers need a valid code to register a support account. Issue a code per company/contract;
        disable a code to block new registrations.
      </p>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createMut.mutate(String(new FormData(e.currentTarget).get("label") ?? ""))
          }}
          className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-ink/40 p-4 sm:flex-row sm:items-center"
        >
          <input
            name="label"
            placeholder="Label (company / contract name)"
            className="w-full rounded-lg border border-line bg-ink/60 px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating…" : "Create code"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {createMut.isError && (
        <p className="mb-3 text-xs text-rose-400">
          {createMut.error instanceof ApiError ? createMut.error.message : "Failed to create code."}
        </p>
      )}

      {isPending ? (
        <Spinner />
      ) : codes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">
          No codes yet. Click “Issue code” to create one.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          {codes.map((c, i) => (
            <CodeRow
              key={c.id}
              code={c}
              first={i === 0}
              copied={copied === c.code}
              onCopy={() => copy(c.code)}
              onToggle={() => activeMut.mutate({ id: c.id, active: !c.active })}
              onDelete={() => {
                if (window.confirm(`Delete code ${c.code}?`)) deleteMut.mutate(c.id)
              }}
              allProducts={allProducts}
              onToggleProduct={(abbr) => {
                const next = c.products.includes(abbr)
                  ? c.products.filter((p) => p !== abbr)
                  : [...c.products, abbr]
                productsMut.mutate({ id: c.id, products: next })
              }}
              busy={activeMut.isPending || deleteMut.isPending || productsMut.isPending}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CodeRow({
  code,
  first,
  copied,
  onCopy,
  onToggle,
  onDelete,
  allProducts,
  onToggleProduct,
  busy,
}: {
  code: CustomerCode
  first: boolean
  copied: boolean
  onCopy: () => void
  onToggle: () => void
  onDelete: () => void
  allProducts: string[]
  onToggleProduct: (abbr: string) => void
  busy: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-3 bg-panel/40 p-3.5", !first && "border-t border-line")}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <button onClick={onCopy} className="inline-flex items-center gap-2 font-mono text-sm text-fg hover:text-accent">
            {code.code}
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-faint" />}
          </button>
          <p className="text-xs text-faint">{code.label}</p>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            code.active ? "bg-emerald-400/10 text-emerald-400" : "bg-white/8 text-muted",
          )}
        >
          {code.active ? "Active" : "Disabled"}
        </span>
        <button
          onClick={onToggle}
          disabled={busy}
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white disabled:opacity-50"
          aria-label="Toggle code"
          title={code.active ? "Disable code" : "Enable code"}
        >
          <Power className="size-4" />
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
          aria-label="Delete code"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Product entitlements — click a chip to grant/revoke access. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] text-faint">Products:</span>
        {allProducts.map((p) => {
          const on = code.products.includes(p)
          return (
            <button
              key={p}
              onClick={() => onToggleProduct(p)}
              disabled={busy}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50",
                on
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line text-faint hover:border-accent/40 hover:text-muted",
              )}
            >
              {p}
            </button>
          )
        })}
        {code.products.length === 0 && (
          <span className="text-[11px] text-faint italic">none assigned — customer sees only General resources</span>
        )}
      </div>
    </div>
  )
}
