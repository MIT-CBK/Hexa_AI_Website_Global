import { Link } from "react-router-dom"
import { Mail, ArrowUpRight } from "lucide-react"
import { Logo } from "@/components/Logo"
import { SITE, SITE_DESCRIPTION } from "@/data/site"
import { useSiteContent } from "@/lib/content"
import { useLang } from "@/i18n"

export function Footer() {
  const { t, tr } = useLang()
  const content = useSiteContent()
  const email = content.home.contact.email
  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted">{tr(SITE_DESCRIPTION)}</p>
            <a
              href={`mailto:${email}`}
              className="inline-flex w-fit items-center gap-2 text-sm text-accent hover:underline"
            >
              <Mail className="size-4" />
              {email}
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2.5 rounded-lg border border-line bg-panel/40 px-3 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-white"
            >
              <LinkedInIcon className="size-4 text-[#0a66c2] transition-colors group-hover:text-white" />
              Follow us on LinkedIn
              <ArrowUpRight className="size-3.5 opacity-60" />
            </a>
          </div>

          <FooterCol title={t("footer.solutions")}>
            {content.solutions.map((o) => (
              <FooterLink key={o.slug} to={`/solutions/${o.slug}`}>
                {o.abbr}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title={t("footer.services")}>
            {content.services.map((o) => (
              <FooterLink key={o.slug} to={`/services/${o.slug}`}>
                {o.abbr}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title={t("footer.company")}>
            <FooterLink to="/#vision">{t("nav.vision")}</FooterLink>
            <FooterLink to="/#certifications">{t("footer.certifications")}</FooterLink>
            <FooterLink to="/newsletter">{t("nav.newsletter")}</FooterLink>
            <FooterLink to="/#contact">{t("nav.contact")}</FooterLink>
            <FooterLink to="/admin">{t("footer.adminLink")}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-sm text-faint sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Hexa AI. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <p className="font-mono text-xs">AI-Native Cybersecurity Platform</p>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hexa AI on LinkedIn"
              className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-accent/50 hover:text-white"
            >
              <LinkedInIcon className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  const isHash = to.includes("#")
  return (
    <li>
      {isHash ? (
        <a href={to} className="group inline-flex items-center gap-1 text-sm text-muted hover:text-white">
          {children}
        </a>
      ) : (
        <Link to={to} className="group inline-flex items-center gap-1 text-sm text-muted hover:text-white">
          {children}
          <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      )}
    </li>
  )
}

/** LinkedIn "in" glyph (lucide no longer ships brand icons). */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
