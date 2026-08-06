import { useEffect, useRef } from "react"
import { motion } from "motion/react"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { LinkButton } from "@/components/ui/Button"
import { ThreatGlobe } from "@/components/common/ThreatGlobe"
import { LiveTicker } from "@/components/common/LiveTicker"
import { useSiteContent, allOfferings } from "@/lib/content"
import { DynamicIcon } from "@/components/common/DynamicIcon"
import { useLang } from "@/i18n"

/** Parse *emphasis* markup into a flat list of words, tagging emphasized ones. */
function toWords(text: string): { w: string; em: boolean }[] {
  const out: { w: string; em: boolean }[] = []
  text.split("*").forEach((seg, i) => {
    const em = i % 2 === 1
    seg.split(/\s+/).forEach((word) => {
      if (word) out.push({ w: word, em })
    })
  })
  return out
}

const headline = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
}
const wordVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
}
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero() {
  const { t, tr } = useLang()
  const content = useSiteContent()
  const offerings = allOfferings(content)
  const solutionSlugs = new Set(content.solutions.map((s) => s.slug))
  const words = toWords(tr(content.home.hero.title))
  const heroVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = heroVideo.current
    if (!v) return
    v.muted = true
    void v.play().catch(() => {})
  }, [])

  return (
    <>
      {/* Cinematic, full-bleed animated hero */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-24">
        {/* background video (muted, looping) — degrades gracefully if absent */}
        <video
          ref={heroVideo}
          className="absolute inset-0 -z-30 h-full w-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          src="/videos/hero.mp4"
        />
        {/* darken + a faint blue wash to unify the footage with the palette */}
        <div className="absolute inset-0 -z-20 bg-void/55" />
        <div className="absolute inset-0 -z-20 bg-accent/[0.06] mix-blend-overlay" />

        {/* rotating threat globe — bleeds off the right edge */}
        <div className="absolute top-1/2 -right-[12%] -z-10 hidden aspect-square w-[760px] max-w-[78%] -translate-y-1/2 lg:block">
          <ThreatGlobe />
        </div>
        {/* veils keep the headline legible over the video + globe */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-void via-void/85 to-void/30 lg:via-void/55" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_50%_118%,transparent_52%,var(--color-void))]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
          <motion.span
            custom={0}
            variants={rise}
            initial="hidden"
            animate="show"
            className="eyebrow eyebrow-rule flex items-center"
          >
            {tr(content.home.hero.badge)}
          </motion.span>

          <motion.h1
            variants={headline}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-[17ch] text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.035em] sm:text-6xl md:text-[4.5rem]"
          >
            {words.map((wd, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className={"mr-[0.24em] inline-block" + (wd.em ? " text-gradient" : "")}
              >
                {wd.w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            custom={0.55}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-pretty leading-relaxed text-muted sm:text-lg"
          >
            {tr(content.home.hero.subtitle)}
          </motion.p>

          <motion.div
            custom={0.68}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <LinkButton to="/#solutions" size="lg" className="w-full sm:w-auto">
              {t("cta.explore")}
              <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton to="/#contact" variant="outline" size="lg" className="w-full sm:w-auto">
              <ShieldCheck className="size-4" />
              {t("cta.consult")}
            </LinkButton>
          </motion.div>
        </div>

        {/* live telemetry ticker pinned to the bottom of the hero */}
        <div className="absolute inset-x-0 bottom-0">
          <LiveTicker />
        </div>
      </section>

      {/* Offering index + stats strip */}
      <section className="border-b border-line bg-ink/40">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {offerings.map((o) => {
              const base = solutionSlugs.has(o.slug) ? "solutions" : "services"
              return (
                <a
                  key={o.slug}
                  href={`/${base}/${o.slug}`}
                  className="group flex items-center gap-1.5 rounded-md border border-line/80 bg-panel/40 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-white"
                >
                  <DynamicIcon
                    name={o.iconKey}
                    className="size-3.5 text-faint transition-colors group-hover:text-accent"
                  />
                  {o.abbr}
                </a>
              )
            })}
          </div>
          <div className="mt-8 grid grid-cols-2 divide-line overflow-hidden rounded-lg border border-line bg-panel/20 md:grid-cols-4 md:divide-x">
            {content.home.stats.map((s, i) => (
              <div key={`${s.value}-${i}`} className="px-6 py-7 text-center">
                <div className="font-mono text-3xl font-semibold tracking-tight text-fg">
                  {s.value}
                </div>
                <div className="mt-1.5 text-xs text-muted">{tr(s.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
