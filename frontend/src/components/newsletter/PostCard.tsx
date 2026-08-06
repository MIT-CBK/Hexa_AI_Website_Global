import { Link } from "react-router-dom"
import { ArrowUpRight, CalendarDays } from "lucide-react"
import type { Post } from "@/lib/newsletter"
import { assetUrl } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import { useLang } from "@/i18n"

export function PostCard({ post }: { post: Post }) {
  const { t, lang } = useLang()
  const cover = assetUrl(post.coverImage)
  return (
    <Link
      to={`/newsletter/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel/40 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-elevated">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-grid size-full opacity-40" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-void/70 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-faint">
          <CalendarDays className="size-3.5" />
          {formatDate(post.publishedAt, lang)}
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-lg font-semibold text-fg transition-colors group-hover:text-white">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
          {t("cta.readArticle")}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
