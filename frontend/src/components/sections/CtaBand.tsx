import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/common/Reveal"
import { Highlighted } from "@/components/common/Highlighted"
import { CodeStream } from "@/components/common/CodeStream"
import { LinkButton } from "@/components/ui/Button"
import { useSiteContent } from "@/lib/content"
import { useLang } from "@/i18n"

export function CtaBand() {
  const { t, tr } = useLang()
  const cta = useSiteContent().home.cta
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-line bg-panel/60 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
              <CodeStream />
            </div>
            {/* protect the centre so the headline stays crisp over the code rain */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_50%,var(--color-panel)_38%,transparent)]" aria-hidden />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                <Highlighted text={tr(cta.title)} />
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-muted">{tr(cta.desc)}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton to="/#contact" size="lg">
                  {t("cta.demo")}
                  <ArrowRight className="size-4" />
                </LinkButton>
                <LinkButton to="/newsletter" variant="outline" size="lg">
                  {t("nav.newsletter")}
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
