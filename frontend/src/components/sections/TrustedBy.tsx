import { Quote } from "lucide-react"
import { Reveal } from "@/components/common/Reveal"
import { TRUST_CARDS, TRUST_HEADING, type TrustCard } from "@/data/trust"
import { cn } from "@/lib/utils"

/**
 * "Trusted by" social proof — outcome stats and customer quotes on an endless
 * horizontal marquee. Pauses on hover/focus; with reduced motion it becomes a
 * plain horizontally scrollable row.
 */
export function TrustedBy() {
  // Two copies so the track can loop seamlessly (keyframes move it by -50%).
  const loop = [...TRUST_CARDS, ...TRUST_CARDS]

  return (
    <section className="relative overflow-hidden border-t border-line/60 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[420px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(77,124,255,0.10),transparent_65%)]"
        aria-hidden
      />

      <Reveal>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 text-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">{TRUST_HEADING.eyebrow}</span>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]">
            {TRUST_HEADING.lead} <span className="text-gradient">{TRUST_HEADING.accent}</span>
          </h2>
        </div>
      </Reveal>

      <div className="mask-fade-x relative mt-14 motion-reduce:overflow-x-auto">
        <ul
          className="flex w-max gap-5 px-5 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{ animation: "marquee 80s linear infinite" }}
        >
          {loop.map((card, i) => (
            <li key={i} aria-hidden={i >= TRUST_CARDS.length || undefined}>
              <Card card={card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Card({ card }: { card: TrustCard }) {
  const isQuote = card.kind === "quote"
  return (
    <article
      className={cn(
        "relative flex h-[300px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border p-7 sm:h-[320px] sm:w-[420px] sm:p-8",
        "bg-[linear-gradient(160deg,rgba(77,124,255,0.10),rgba(15,17,22,0.6)_45%,rgba(11,12,14,0.9))]",
        "transition-colors duration-300",
        isQuote ? "border-accent/35 hover:border-accent/60" : "border-line hover:border-accent/40",
      )}
    >
      {isQuote && (
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />
      )}

      {card.kind === "stat" ? (
        <div className="bg-gradient-to-b from-white to-white/45 bg-clip-text text-6xl font-light tracking-tight text-transparent tabular-nums sm:text-7xl">
          {card.value}
        </div>
      ) : (
        <div className="relative">
          <Quote className="mb-3 size-5 text-accent" />
          <p className="text-[17px] leading-snug text-fg sm:text-lg">“{card.quote}”</p>
        </div>
      )}

      <div className="relative flex flex-col gap-5">
        {card.kind === "stat" && <p className="text-lg leading-snug text-muted sm:text-xl">{card.text}</p>}
        <span className="w-fit rounded-md border border-line bg-ink/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          {card.source}
        </span>
      </div>
    </article>
  )
}
