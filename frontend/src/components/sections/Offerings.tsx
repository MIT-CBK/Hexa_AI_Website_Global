import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Highlighted } from "@/components/common/Highlighted"
import { Reveal } from "@/components/common/Reveal"
import { useSiteContent } from "@/lib/content"
import type { Heading, Offering } from "@/data/content-types"
import { DynamicIcon } from "@/components/common/DynamicIcon"
import { SolutionViz, VIZ_FOR } from "@/components/common/SolutionViz"
import { useLang } from "@/i18n"

interface OfferingsSectionProps {
  id: string
  kind: "solution" | "service"
  heading: Heading
  items: Offering[]
}

function OfferingsSection({ id, kind, heading, items }: OfferingsSectionProps) {
  const { tr } = useLang()
  return (
    <section id={id} className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow={tr(heading.eyebrow)}
          title={<Highlighted text={tr(heading.title)} />}
          description={tr(heading.desc)}
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 3) * 0.08}>
              <OfferingCard offering={item} kind={kind} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function OfferingCard({ offering, kind }: { offering: Offering; kind: "solution" | "service" }) {
  const { tr } = useLang()
  const [hover, setHover] = useState(false)
  const base = kind === "solution" ? "solutions" : "services"
  const viz = VIZ_FOR[offering.slug]

  return (
    <Link
      to={`/${base}/${offering.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel/40 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-panel/70"
    >
      <span className="absolute inset-x-0 top-0 z-10 h-px scale-x-0 bg-accent/70 transition-transform duration-500 group-hover:scale-x-100" />

      {viz ? (
        // Live, product-specific visual that speeds up on hover.
        <div className="relative h-32 overflow-hidden border-b border-line bg-[radial-gradient(120%_120%_at_50%_0%,rgba(77,124,255,0.07),transparent_60%)]">
          <SolutionViz kind={viz} active={hover} />
          <span className="absolute right-3 top-3 font-mono text-[10px] tracking-wide text-faint uppercase">
            {tr(offering.category)}
          </span>
        </div>
      ) : (
        <div className="relative flex items-center justify-between px-7 pt-7">
          <div className="icon-tile size-11">
            <DynamicIcon name={offering.iconKey} className="size-5" />
          </div>
          <span className="eyebrow">{tr(offering.category)}</span>
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-7">
        <h3 className="text-xl font-semibold tracking-tight text-fg">{offering.abbr}</h3>
        {tr(offering.name) !== offering.abbr && (
          <span className="mt-0.5 text-[0.95rem] text-muted">{tr(offering.name)}</span>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted">{tr(offering.summary)}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Learn more
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

export function SolutionsSection() {
  const content = useSiteContent()
  return (
    <OfferingsSection
      id="solutions"
      kind="solution"
      heading={content.home.solutions}
      items={content.solutions}
    />
  )
}

export function ServicesSection() {
  const content = useSiteContent()
  return (
    <OfferingsSection
      id="services"
      kind="service"
      heading={content.home.services}
      items={content.services}
    />
  )
}
