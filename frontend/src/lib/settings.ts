import { api } from "@/lib/api-client"

export type SmtpEncryption = "none" | "starttls" | "ssl"

export interface SmtpSettings {
  enabled: boolean
  provider: string
  host: string
  port: number
  encryption: SmtpEncryption
  user: string
  fromEmail: string
  fromName: string
  toEmail: string
  hasPassword: boolean
}

/** Payload for saving — `password` optional (omit/empty keeps the stored one). */
export interface SmtpSettingsInput {
  enabled: boolean
  provider: string
  host: string
  port: number
  encryption: SmtpEncryption
  user: string
  password?: string
  fromEmail: string
  fromName: string
  toEmail: string
}

export const settingsKeys = { smtp: ["settings", "smtp"] as const }

export const getSmtpSettings = () => api.get<SmtpSettings>("/api/admin/settings/smtp")
export const saveSmtpSettings = (body: SmtpSettingsInput) =>
  api.put<{ ok: boolean }>("/api/admin/settings/smtp", body)
export const testSmtp = (to: string) =>
  api.post<{ ok: boolean }>("/api/admin/settings/smtp/test", { to })
