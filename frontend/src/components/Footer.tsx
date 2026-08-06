import { Link } from "react-router-dom"
import { Mail, ArrowUpRight } from "lucide-react"
import { Logo } from "@/components/Logo"
import { SITE_DESCRIPTION } from "@/data/site"
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
          <p className="font-mono text-xs">AI-Native Cybersecurity Platform</p>
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
