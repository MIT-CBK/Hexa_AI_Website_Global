import { useState } from "react"
import { Star } from "lucide-react"
import { DynamicIcon } from "@/components/common/DynamicIcon"
import { Reveal } from "@/components/common/Reveal"
import { useSiteContent } from "@/lib/content"
import { assetUrl } from "@/lib/api-client"
import { useLang } from "@/i18n"

interface Badge {
  code: string
  issuer: string
  elite?: boolean
  iconKey: string
  logoUrl?: string
}

/**
 * Homepage credential wall — the team's certifications. Shows the real badge
 * image (logoUrl) when available, and gracefully falls back to a hexagonal
 * emblem if the logo is missing or fails to load.
 */
export function CertificationsPreview() {
  const { tr } = useLang()
  const content = useSiteContent()
  const badges: Badge[] = content.certGroups.flatMap((g) =>
    g.items.map((i) => ({
      code: i.code,
      issuer: i.issuer,
      elite: i.elite,
      iconKey: g.iconKey,
      logoUrl: i.logoUrl,
    })),
  )

  return (
    <section id="certifications" className="scroll-mt-20 border-t border-line/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
            {tr(content.home.certs.eyebrow)}
          </span>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {tr(content.home.certs.title).replace(/\*/g, "")}
          </h2>
          <p className="max-w-xl text-pretty text-sm text-muted">{tr(content.home.certs.desc)}</p>
        </div>

        <Reveal>
          <div className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {badges.map((b) => (
              <CertBadge key={b.code} b={b} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function CertBadge({ b }: { b: Badge }) {
  const [failed, setFailed] = useState(false)
  const showLogo = Boolean(b.logoUrl) && !failed

  return (
    <div className="group relative flex w-[140px] flex-col items-center gap-3 rounded-lg border border-line bg-panel/40 p-5 text-center transition-all duration-300 ease-cinema hover:-translate-y-1 hover:border-accent/40 hover:bg-panel/70">
      {b.elite && (
        <span className="absolute right-2.5 top-2.5 text-amber-400" title="Elite">
          <Star className="size-3.5 fill-amber-400" />
        </span>
      )}
      {showLogo ? (
        <div className="grid size-16 place-items-center overflow-hidden rounded-lg bg-white/5 p-1.5 transition-transform duration-300 ease-cinema group-hover:scale-105">
          <img
            src={assetUrl(b.logoUrl) ?? b.logoUrl}
            alt={`${b.code} certification badge`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-full object-contain"
          />
        </div>
      ) : (
        <div className="hex-clip grid size-14 place-items-center bg-gradient-to-br from-accent/40 via-accent/15 to-transparent transition-transform duration-300 ease-cinema group-hover:scale-105">
          <div className="hex-clip grid size-[3.05rem] place-items-center bg-elevated">
            <DynamicIcon name={b.iconKey} className="size-5 text-accent" />
          </div>
        </div>
      )}
      <div className="text-sm font-semibold tracking-tight text-fg">{b.code}</div>
      <div className="font-mono text-[10px] leading-tight text-faint">{b.issuer}</div>
    </div>
  )
}
