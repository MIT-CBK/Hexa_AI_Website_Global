import { NmsDashboard } from "@/components/common/NmsDashboard"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Reveal } from "@/components/common/Reveal"

/**
 * A dedicated showcase for the live operations console — moved out of the hero
 * so the hero can be a pure cinematic statement, and the product gets a proper
 * "see it work" moment of its own.
 */
export function LivePlatform() {
  return (
    <section className="relative scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Live platform"
          title={
            <>
              One console for your entire estate
            </>
          }
          description="Monitoring, detection and response converge into a single operational picture — updated in real time, narrated by AI."
        />
        <Reveal className="mt-14" y={32}>
          <div className="mx-auto max-w-4xl">
            
            <NmsDashboard />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
