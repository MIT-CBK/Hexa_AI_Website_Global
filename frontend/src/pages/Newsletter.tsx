import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Newspaper } from "lucide-react"
import { listPosts, postKeys } from "@/lib/newsletter"
import { PostCard } from "@/components/newsletter/PostCard"
import { Reveal } from "@/components/common/Reveal"
import { Highlighted } from "@/components/common/Highlighted"
import { Spinner, ErrorState } from "@/components/common/States"
import { useLang } from "@/i18n"
import { cn } from "@/lib/utils"

const ALL = "__all__"

export default function Newsletter() {
  const { t } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: postKeys.list(),
    queryFn: listPosts,
  })
  const allPosts = useMemo(() => data ?? [], [data])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL)

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(allPosts.map((p) => p.category)))],
    [allPosts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPosts.filter((p) => {
      const matchCat = category === ALL || p.category === category
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [allPosts, query, category])

  return (
    <div className="relative pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-panel/60 px-3.5 py-1 font-mono text-xs tracking-wide text-accent uppercase">
            <Newspaper className="size-3.5" />
            {t("news.eyebrow")}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            <Highlighted text={t("news.pageTitle")} />
          </h1>
          <p className="max-w-2xl text-pretty text-muted md:text-lg">{t("news.pageDesc")}</p>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("news.search")}
              aria-label={t("news.search")}
              className="w-full rounded-xl border border-line bg-ink/60 py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  category === c
                    ? "border-accent bg-accent/15 text-white"
                    : "border-line text-muted hover:border-accent/50 hover:text-white",
                )}
              >
                {c === ALL ? t("news.all") : c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isPending ? (
          <Spinner label={t("news.loading")} />
        ) : isError ? (
          <div className="mt-10">
            <ErrorState message={t("state.error")} onRetry={() => refetch()} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.06}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-20 text-center">
            <Newspaper className="size-10 text-faint" />
            <p className="text-muted">{t("news.empty")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
