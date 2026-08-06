import { prisma } from "./prisma.js"

const SINGLETON = "singleton"

export type SmtpEncryption = "none" | "starttls" | "ssl"

export interface SmtpSettings {
  enabled: boolean
  provider: string
  host: string
  port: number
  encryption: SmtpEncryption
  user: string
  /** AES-GCM encrypted password — never sent to the client. */
  passEnc: string
  fromEmail: string
  fromName: string
  /** Where contact notifications are delivered (falls back to env.CONTACT_TO). */
  toEmail: string
}

const DEFAULT_SMTP: SmtpSettings = {
  enabled: false,
  provider: "custom",
  host: "",
  port: 587,
  encryption: "starttls",
  user: "",
  passEnc: "",
  fromEmail: "",
  fromName: "Hexa AI",
  toEmail: "",
}

export async function readSmtpSettings(): Promise<SmtpSettings> {
  const row = await prisma.appSetting.findUnique({ where: { id: SINGLETON } })
  if (!row) return { ...DEFAULT_SMTP }
  try {
    const parsed = JSON.parse(row.data) as { smtp?: Partial<SmtpSettings> }
    return { ...DEFAULT_SMTP, ...(parsed.smtp ?? {}) }
  } catch {
    return { ...DEFAULT_SMTP }
  }
}

export async function writeSmtpSettings(next: SmtpSettings): Promise<void> {
  const data = JSON.stringify({ smtp: next })
  await prisma.appSetting.upsert({
    where: { id: SINGLETON },
    update: { data },
    create: { id: SINGLETON, data },
  })
}

/** Client-safe projection — omits the secret, exposes only whether one is set. */
export function publicSmtp(s: SmtpSettings) {
  return {
    enabled: s.enabled,
    provider: s.provider,
    host: s.host,
    port: s.port,
    encryption: s.encryption,
    user: s.user,
    fromEmail: s.fromEmail,
    fromName: s.fromName,
    toEmail: s.toEmail,
    hasPassword: Boolean(s.passEnc),
  }
}
