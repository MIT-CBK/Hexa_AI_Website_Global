import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, CalendarDays, User, Tag, Paperclip, FileText, Download } from "lucide-react"
import { getPost, listPosts, postKeys } from "@/lib/newsletter"
import { assetUrl, ApiError } from "@/lib/api-client"
import { formatSize } from "@/lib/resources"
import { Markdown } from "@/components/newsletter/Markdown"
import { PostCard } from "@/components/newsletter/PostCard"
import { Spinner } from "@/components/common/States"
import { formatDate } from "@/lib/utils"
import { useLang } from "@/i18n"
import NotFound from "@/pages/NotFound"

export default function NewsletterPost() {
  const { t, lang } = useLang()
  const { slug } = useParams()
  const {
    data: post,
    isPending,
    error,
  } = useQuery({
    queryKey: postKeys.detail(slug ?? ""),
    queryFn: () => getPost(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })

  const { data: allPosts } = useQuery({ queryKey: postKeys.list(), queryFn: listPosts })

  if (isPending) {
    return (
      <div className="pt-32">
        <Spinner label={t("news.loading")} />
      </div>
    )
  }

  // 404 from the API (or any load failure) → show the Not Found page.
  if (error instanceof ApiError && error.status === 404) return <NotFound />
  if (!post) return <NotFound />

  const cover = assetUrl(post.coverImage)
  const related = (allPosts ?? [])
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  return (
    <article className="relative pt-28 pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Link
          to="/newsletter"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t("news.allArticles")}
        </Link>

        <header className="mt-6 flex flex-col gap-5">
          <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
            {post.category}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:leading-tight">
            {post.title}
          </h1>
          <p className="text-pretty text-lg text-muted">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm text-faint">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(post.publishedAt, lang)}
            </span>
            {post.tags.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="size-4" />
                {post.tags.join(", ")}
              </span>
            )}
          </div>
        </header>

        {cover && (
          <img
            src={cover}
            alt=""
            className="mt-8 aspect-[16/9] w-full rounded-lg border border-line object-cover"
          />
        )}

        <div className="mt-8">
          <Markdown>{post.content}</Markdown>
        </div>

        {post.attachments.length > 0 && (
          <div className="mt-10 rounded-xl border border-line bg-panel/40 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
              <Paperclip className="size-4" />
              {t("news.attachments")}
            </h2>
            <ul className="flex flex-col gap-2">
              {post.attachments.map((a, i) => (
                <li key={`${a.url}-${i}`}>
                  <a
                    href={assetUrl(a.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-line bg-ink/40 px-3 py-2.5 text-sm transition-colors hover:border-accent/40"
                  >
                    <FileText className="size-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate text-fg">{a.name}</span>
                    {a.size ? <span className="shrink-0 text-xs text-faint">{formatSize(a.size)}</span> : null}
                    <Download className="size-4 shrink-0 text-accent" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">
          <h2 className="text-xl font-semibold">{t("news.related")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
