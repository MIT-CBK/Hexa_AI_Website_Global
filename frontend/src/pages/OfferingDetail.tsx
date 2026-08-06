import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, ShoppingCart } from "lucide-react"
import { useSiteContent, findOffering } from "@/lib/content"
import { DynamicIcon } from "@/components/common/DynamicIcon"
import { AuroraBackground } from "@/components/common/AuroraBackground"
import { Reveal } from "@/components/common/Reveal"
import { SolutionViz, VIZ_FOR } from "@/components/common/SolutionViz"
import { BuyNowDialog } from "@/components/order/BuyNowDialog"
import { PRICING } from "@/data/pricing"
import { Button, LinkButton } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useLang } from "@/i18n"
import NotFound from "@/pages/NotFound"

export default function OfferingDetail() {
  const { slug } = useParams()
  const { t, tr } = useLang()
  const content = useSiteContent()
  const offering = slug ? findOffering(content, slug) : undefined
  if (!offering) return <NotFound />

  const isSolution = content.solutions.some((s) => s.slug === offering.slug)
  const base = isSolution ? "solutions" : "services"
  const backLabel = isSolution ? t("detail.allSolutions") : t("detail.allServices")
  const siblings = isSolution ? content.solutions : content.services
  const related = siblings.filter((o) => o.slug !== offering.slug).slice(0, 3)
  const viz = VIZ_FOR[offering.slug]
  const canBuy = isSolution && Boolean(PRICING[offering.slug])
  const [buyOpen, setBuyOpen] = useState(false)

  return (
    <article>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40">
        <AuroraBackground />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
          <Link
            to={`/#${base}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>

          <div
            className={cn(
              "mt-8 items-center gap-10",
              viz ? "grid lg:grid-cols-[1.1fr_0.9fr]" : "flex flex-col",
            )}
          >
            <div className="flex flex-col gap-6">
              <div className="icon-tile size-16 shadow-glow">
                <DynamicIcon name={offering.iconKey} className="size-8" />
              </div>
              <div>
                <span className="eyebrow text-accent">{tr(offering.category)}</span>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  {tr(offering.name)}
                </h1>
              </div>
              <p className="max-w-2xl text-pretty text-lg text-muted">{tr(offering.tagline)}</p>
              <div className="flex flex-wrap gap-3">
                {canBuy && (
                  <Button onClick={() => setBuyOpen(true)}>
                    <ShoppingCart className="size-4" />
                    Buy {offering.abbr}
                  </Button>
                )}
                <LinkButton to="/#contact" variant={canBuy ? "outline" : "primary"}>
                  {t("detail.consultAbout")} {offering.abbr}
                  {!canBuy && <ArrowRight className="size-4" />}
                </LinkButton>
              </div>
            </div>

            {viz && (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg border border-line bg-ink/60 shadow-card">
                  <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="ml-2 font-mono text-xs text-faint">
                      hexa-{offering.slug} · live
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                      LIVE
                    </span>
                  </div>
                  <div className="relative h-56 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(77,124,255,0.07),transparent_60%)] sm:h-64">
                    <SolutionViz kind={viz} active />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <Reveal>
            <div className="rounded-lg border border-line bg-panel/40 p-8">
              <h2 className="text-xl font-semibold">{t("detail.overview")}</h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted">{tr(offering.overview)}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI spotlight (e.g. AIOps) */}
      {offering.aiHighlight && (
        <section className="py-12">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <Reveal>
              <div className="border-gradient relative overflow-hidden rounded-lg p-8 sm:p-10">
                <div className="relative flex flex-col gap-3">
                  <span className="eyebrow eyebrow-rule flex items-center">AI capability</span>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {tr(offering.aiHighlight.title)}
                  </h2>
                  <p className="max-w-2xl text-pretty text-muted">{tr(offering.aiHighlight.desc)}</p>
                </div>
                <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
                  {offering.aiHighlight.points.map((p, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border border-line bg-ink/40 p-5 transition-all duration-300 ease-cinema hover:-translate-y-0.5 hover:border-accent/40 hover:bg-ink/70">
                      <span className="icon-tile size-9 shrink-0">
                        <span className="size-1.5 rounded-full bg-accent" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-fg">{tr(p.title)}</h3>
                        <p className="mt-1 text-sm text-muted">{tr(p.desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">{t("detail.features")}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {offering.features.map((f, i) => (
              <Reveal key={i} delay={(i % 2) * 0.08}>
                <div className="flex h-full flex-col gap-2 rounded-lg border border-line bg-panel/40 p-6">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile size-8">
                      <Check className="size-4" />
                    </span>
                    <h3 className="font-semibold text-fg">{tr(f.title)}</h3>
                  </div>
                  <p className="text-sm text-muted">{tr(f.desc)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <Reveal>
            <div className="border-gradient rounded-lg p-8">
              <h2 className="text-2xl font-semibold tracking-tight">{t("detail.outcomes")}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {offering.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-fg">
                    <Check className="mt-0.5 size-5 shrink-0 text-accent" />
                    {tr(o)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 pb-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-xl font-semibold">{t("detail.related")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((o) => (
              <Link
                key={o.slug}
                to={`/${base}/${o.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-line bg-panel/40 p-4 transition-colors hover:border-accent/50"
              >
                <span className="icon-tile size-10">
                  <DynamicIcon name={o.iconKey} className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-fg">{o.abbr}</span>
                  <span className="block text-xs text-muted">{tr(o.category)}</span>
                </span>
                <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {canBuy && (
        <BuyNowDialog
          slug={offering.slug}
          abbr={offering.abbr}
          name={tr(offering.name)}
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </article>
  )
}
