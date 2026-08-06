import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Highlighted } from "@/components/common/Highlighted"
import { Reveal } from "@/components/common/Reveal"
import { Spinner } from "@/components/common/States"
import { LinkButton } from "@/components/ui/Button"
import { PostCard } from "@/components/newsletter/PostCard"
import { listPosts, postKeys } from "@/lib/newsletter"
import { useSiteContent } from "@/lib/content"
import { useLang } from "@/i18n"

export function NewsletterPreview() {
  const { t, tr } = useLang()
  const news = useSiteContent().home.newsletter
  const { data, isPending } = useQuery({ queryKey: postKeys.list(), queryFn: listPosts })
  const posts = (data ?? []).slice(0, 3)

  // Hide the whole section if there are no posts (and we're done loading).
  if (!isPending && posts.length === 0) return null

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow={tr(news.eyebrow)}
            title={<Highlighted text={tr(news.previewTitle)} />}
            description={tr(news.previewDesc)}
            className="max-w-xl"
          />
          <LinkButton to="/newsletter" variant="outline" className="shrink-0">
            {t("cta.viewAll")}
            <ArrowRight className="size-4" />
          </LinkButton>
        </div>

        {isPending ? (
          <Spinner />
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
