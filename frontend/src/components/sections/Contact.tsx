import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { Mail, Send, CheckCircle2 } from "lucide-react"
import { SectionHeading } from "@/components/common/SectionHeading"
import { Highlighted } from "@/components/common/Highlighted"
import { Reveal } from "@/components/common/Reveal"
import { Button } from "@/components/ui/Button"
import { submitContact } from "@/lib/contact"
import { useSiteContent } from "@/lib/content"
import { useLang } from "@/i18n"

type FieldKey = "name" | "email" | "company" | "message"
type FieldErrors = Partial<Record<FieldKey, string>>

export function Contact() {
  const { t, tr } = useLang()
  const contact = useSiteContent().home.contact
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useMutation({ mutationFn: submitContact })
  const sent = mutation.isSuccess

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const schema = z.object({
      name: z.string().min(2, t("contact.errName")).max(80),
      email: z.string().email(t("contact.errEmail")).max(160),
      company: z.string().max(120).optional(),
      message: z.string().min(10, t("contact.errMessage")).max(2000),
    })
    const form = new FormData(e.currentTarget)
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      message: String(form.get("message") ?? ""),
    })
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    mutation.mutate({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || undefined,
      message: parsed.data.message,
    })
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-fg placeholder:text-faint transition-colors focus:border-accent focus:bg-ink focus:outline-none"

  return (
    <section id="contact" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Left: copy + contact details */}
          <div className="flex flex-col gap-8">
            <SectionHeading
              align="left"
              eyebrow={tr(contact.eyebrow)}
              title={<Highlighted text={tr(contact.title)} />}
              description={tr(contact.desc)}
            />

            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center gap-4 rounded-lg border border-line bg-panel/40 p-5 transition-colors hover:border-accent/50"
              >
                <span className="icon-tile size-11">
                  <Mail className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-faint">{t("contact.email")}</span>
                  <span className="text-fg group-hover:text-white">{contact.email}</span>
                </span>
              </a>
            </div>
          </div>

          {/* Right: form */}
          <Reveal>
            <div className="border-gradient rounded-lg p-6 sm:p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <CheckCircle2 className="size-14 text-accent" />
                  <h3 className="text-xl font-semibold">{t("contact.thanksTitle")}</h3>
                  <p className="max-w-sm text-sm text-muted">
                    {t("contact.thanksBody")}{" "}
                    <a href={`mailto:${contact.email}`} className="text-accent underline">
                      {contact.email}
                    </a>
                  </p>
                  <Button variant="outline" onClick={() => mutation.reset()}>
                    {t("contact.again")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-fg">{t("contact.name")}</span>
                      <input
                        name="name"
                        placeholder={t("contact.namePlaceholder")}
                        className={inputCls}
                      />
                      {errors.name && <span className="text-xs text-rose-400">{errors.name}</span>}
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-fg">{t("contact.email")}</span>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        className={inputCls}
                      />
                      {errors.email && <span className="text-xs text-rose-400">{errors.email}</span>}
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-fg">{t("contact.company")}</span>
                    <input
                      name="company"
                      placeholder={t("contact.companyPlaceholder")}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-fg">{t("contact.message")}</span>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder={t("contact.messagePlaceholder")}
                      className={inputCls}
                    />
                    {errors.message && (
                      <span className="text-xs text-rose-400">{errors.message}</span>
                    )}
                  </label>
                  {mutation.isError && (
                    <p className="text-sm text-rose-400">{t("contact.error")}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? t("contact.sending") : t("contact.send")}
                    <Send className="size-4" />
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
