import nodemailer, { type Transporter } from "nodemailer"
import { env, smtpEnabled } from "../env.js"
import { readSmtpSettings, type SmtpSettings } from "./settings.js"
import { decryptSecret } from "./crypto.js"
import type { ContactInput, OrderInput } from "../schemas.js"

interface ActiveMailer {
  transporter: Transporter
  from: string
  to: string
}

/** Build a transporter from the admin-configured (DB) SMTP settings. */
function transportFromSettings(s: SmtpSettings): ActiveMailer | null {
  if (!s.enabled || !s.host || !s.fromEmail) return null
  const transporter = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.encryption === "ssl", // implicit TLS (usually port 465)
    requireTLS: s.encryption === "starttls", // upgrade on 587
    auth: s.user ? { user: s.user, pass: decryptSecret(s.passEnc) } : undefined,
  })
  const from = s.fromName ? `${s.fromName} <${s.fromEmail}>` : s.fromEmail
  return { transporter, from, to: s.toEmail || env.CONTACT_TO }
}

/** Fallback: legacy environment-variable SMTP config. */
function transportFromEnv(): ActiveMailer | null {
  if (!smtpEnabled) return null
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
  return { transporter, from: env.SMTP_FROM ?? env.SMTP_USER ?? "", to: env.CONTACT_TO }
}

/** DB (admin UI) config takes precedence; env is the fallback. */
async function getActiveMailer(): Promise<ActiveMailer | null> {
  const fromDb = transportFromSettings(await readSmtpSettings())
  return fromDb ?? transportFromEnv()
}

/**
 * Make a string safe to place in an email header: drop control characters
 * (incl. CR/LF — anti header-injection) and angle brackets, then cap length.
 */
function headerSafe(s: string): string {
  let out = ""
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    if (code < 0x20 || code === 0x7f) continue // control chars incl. CR/LF/tab
    if (ch === "<" || ch === ">") continue
    out += ch
  }
  return out.trim().slice(0, 120)
}

/**
 * Send a contact-form notification. Returns whether an email was actually sent.
 * Never throws to the caller — email is best-effort; the message is already
 * persisted in the DB regardless.
 */
export async function sendContactEmail(
  data: ContactInput,
  log: { error: (obj: unknown, msg?: string) => void },
): Promise<boolean> {
  const mailer = await getActiveMailer()
  if (!mailer) return false

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to: mailer.to,
      replyTo: data.email,
      subject: `[Hexa AI] New inquiry from ${headerSafe(data.name)}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Company: ${data.company || "-"}`,
        "",
        data.message,
      ].join("\n"),
    })
    return true
  } catch (err) {
    log.error({ err: err instanceof Error ? err.message : "unknown" }, "contact email failed")
    return false
  }
}

/**
 * Send a test email using the active SMTP config. Admin-only; returns a
 * detailed error message on failure so the operator can debug the setup.
 */
export async function sendTestEmail(to: string): Promise<{ ok: boolean; error?: string }> {
  const mailer = await getActiveMailer()
  if (!mailer) return { ok: false, error: "SMTP is not configured or not enabled yet." }
  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: "[Hexa AI] SMTP test email",
      text: "This is a test email from your Hexa AI admin console. If you received it, your SMTP settings are working correctly.",
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send test email." }
  }
}

/** Where new order notifications go when SMTP `toEmail` is not set. */
const ORDER_NOTIFY_FALLBACK = "info@hexacyber.ai"

function orderSummary(o: OrderInput): string[] {
  const lines = [
    `Product: ${o.product}${o.productName ? ` — ${o.productName}` : ""}`,
    `Deployment: ${o.deployment === "cloud" ? "Cloud (subscription)" : "Self-hosted (perpetual)"}`,
    `${o.metricLabel || o.metric}: ${o.quantity.toLocaleString("en-US")}`,
  ]
  if (o.sensors) lines.push(`Sensors: ${o.sensors}`)
  if (o.deployment === "cloud" && o.region) lines.push(`Region: ${o.region}`)
  if (o.deployment === "cloud" && o.term) lines.push(`Subscription term: ${o.term}`)
  lines.push(`AIOps: ${o.aiops ? `Yes${o.aiopsTerm ? ` (${o.aiopsTerm})` : ""}` : "No"}`)
  lines.push(
    `Multi-tenancy: ${o.multiTenant ? (o.tenants ? `Yes — ${o.tenants} tenants` : "Yes") : "No"}`,
  )
  lines.push(
    `Language pack: ${
      o.languagePack
        ? o.languages && o.languages.length
          ? `Yes — ${o.languages.join(", ")}`
          : "Yes"
        : "No"
    }`,
  )
  if (o.notes) lines.push(`Notes: ${o.notes}`)
  return lines
}

/**
 * On a new order: email the buyer a thank-you and notify the Hexa AI team.
 * Best-effort — the order is already persisted regardless of email outcome.
 */
export async function sendOrderEmails(
  o: OrderInput,
  log: { error: (obj: unknown, msg?: string) => void },
): Promise<{ buyer: boolean; admin: boolean }> {
  const mailer = await getActiveMailer()
  if (!mailer) return { buyer: false, admin: false }
  const summary = orderSummary(o)
  let buyer = false
  let admin = false

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to: o.email,
      subject: `Your Hexa AI order request — ${o.product}`,
      text: [
        `Hi${o.name ? " " + headerSafe(o.name) : ""},`,
        "",
        `Thank you for your interest in Hexa AI ${o.productName || o.product}. We've received your order request, and a member of our team will be in touch within one business day to confirm the details and share pricing.`,
        "",
        "Summary of your request:",
        ...summary.map((l) => `  - ${l}`),
        "",
        "If anything looks off, just reply to this email and we'll adjust it.",
        "",
        "— The Hexa AI team",
      ].join("\n"),
    })
    buyer = true
  } catch (err) {
    log.error({ err: err instanceof Error ? err.message : "unknown" }, "order buyer email failed")
  }

  const settings = await readSmtpSettings()
  const adminTo = settings.toEmail || ORDER_NOTIFY_FALLBACK
  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to: adminTo,
      replyTo: o.email,
      subject: `[Hexa AI] New order — ${o.product} (${o.deployment})`,
      text: [
        "A new order request was submitted on the website.",
        "",
        `Contact: ${o.name || "-"} <${o.email}>`,
        `Role: ${o.role || "-"}`,
        `Company: ${o.company || "-"}`,
        "",
        ...summary,
      ].join("\n"),
    })
    admin = true
  } catch (err) {
    log.error({ err: err instanceof Error ? err.message : "unknown" }, "order admin email failed")
  }

  return { buyer, admin }
}
