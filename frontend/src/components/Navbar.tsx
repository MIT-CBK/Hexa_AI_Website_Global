import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Logo } from "@/components/Logo"
import { LinkButton } from "@/components/ui/Button"
import { useLang } from "@/i18n"
import type { DictKey } from "@/i18n/dict"
import { cn } from "@/lib/utils"

const NAV: { key: DictKey; href: string }[] = [
  { key: "nav.solutions", href: "/#solutions" },
  { key: "nav.services", href: "/#services" },
  { key: "nav.vision", href: "/#vision" },
  { key: "nav.newsletter", href: "/newsletter" },
  { key: "nav.support", href: "/support" },
  { key: "nav.contact", href: "/#contact" },
]

export function Navbar() {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line/70 bg-void/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Hexa AI">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavItem key={item.href} href={item.href} label={t(item.key)} />
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LinkButton to="/#contact" size="sm">
            {t("cta.consult")}
          </LinkButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="grid size-10 place-items-center rounded-lg text-fg hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line bg-void/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-muted hover:bg-white/5 hover:text-white"
                >
                  {t(item.key)}
                </a>
              ))}
              <LinkButton to="/#contact" className="mt-2 w-full" onClick={() => setOpen(false)}>
                {t("cta.contact")}
              </LinkButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  const isRoute = href.startsWith("/") && !href.includes("#")
  const cls = "rounded-lg px-3.5 py-2 text-sm text-muted transition-colors hover:text-white"
  return isRoute ? (
    <Link to={href} className={cls}>
      {label}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {label}
    </a>
  )
}
