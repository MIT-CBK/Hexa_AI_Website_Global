import { AuroraBackground } from "@/components/common/AuroraBackground"
import { LinkButton } from "@/components/ui/Button"
import { LogoMark } from "@/components/Logo"
import { useLang } from "@/i18n"

export default function NotFound() {
  const { t } = useLang()
  return (
    <section className="relative isolate grid min-h-[80vh] place-items-center overflow-hidden px-5">
      <AuroraBackground />
      <div className="relative flex flex-col items-center text-center">
        <LogoMark className="h-16 w-16 [animation:var(--animate-float)]" />
        <h1 className="mt-8 text-6xl font-semibold text-gradient">404</h1>
        <p className="mt-3 max-w-sm text-muted">{t("notfound.desc")}</p>
        <LinkButton to="/" className="mt-8">
          {t("notfound.home")}
        </LinkButton>
      </div>
    </section>
  )
}
