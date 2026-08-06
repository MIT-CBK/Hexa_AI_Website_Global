import { Eye, Target } from "lucide-react"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Highlighted } from "@/components/common/Highlighted"
import { Reveal } from "@/components/common/Reveal"
import { useSiteContent } from "@/lib/content"
import { DynamicIcon } from "@/components/common/DynamicIcon"
import { useLang } from "@/i18n"

export function VisionMission() {
  const { tr } = useLang()
  const v = useSiteContent().home.vision
  return (
    <section id="vision" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow={tr(v.eyebrow)} title={<Highlighted text={tr(v.title)} />} />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="border-gradient relative h-full overflow-hidden rounded-lg p-8">
              <div className="icon-tile size-12">
                <Eye className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">{tr(v.visionTitle)}</h3>
              <p className="mt-3 text-pretty text-muted">{tr(v.visionBody)}</p>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="border-gradient relative h-full overflow-hidden rounded-lg p-8">
              <div className="icon-tile size-12">
                <Target className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">{tr(v.missionTitle)}</h3>
              <p className="mt-3 text-pretty text-muted">{tr(v.missionBody)}</p>
            </article>
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {v.values.map((val, i) => (
            <Reveal key={i} delay={(i % 4) * 0.06}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-panel/40 p-6">
                <DynamicIcon name={val.iconKey} className="size-6 text-accent" />
                <h4 className="font-semibold text-fg">{tr(val.title)}</h4>
                <p className="text-sm text-muted">{tr(val.desc)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
