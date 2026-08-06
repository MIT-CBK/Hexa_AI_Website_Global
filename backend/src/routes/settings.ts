import type { FastifyInstance } from "fastify"
import { smtpSettingsSchema, smtpTestSchema } from "../schemas.js"
import { readSmtpSettings, writeSmtpSettings, publicSmtp } from "../lib/settings.js"
import { encryptSecret } from "../lib/crypto.js"
import { sendTestEmail } from "../lib/mailer.js"

/** Admin: read/update SMTP settings and send a test email. Mounted behind admin auth. */
export async function adminSettingsRoutes(app: FastifyInstance) {
  app.get("/smtp", async () => {
    return publicSmtp(await readSmtpSettings())
  })

  app.put("/smtp", async (req, reply) => {
    const parsed = smtpSettingsSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid SMTP settings" })
    const p = parsed.data
    const current = await readSmtpSettings()
    // Empty/omitted password → keep the previously stored one.
    const passEnc = p.password ? encryptSecret(p.password) : current.passEnc
    await writeSmtpSettings({
      enabled: p.enabled,
      provider: p.provider,
      host: p.host.trim(),
      port: p.port,
      encryption: p.encryption,
      user: p.user.trim(),
      passEnc,
      fromEmail: p.fromEmail.trim(),
      fromName: p.fromName.trim(),
      toEmail: p.toEmail.trim(),
    })
    return { ok: true }
  })

  app.post(
    "/smtp/test",
    { config: { rateLimit: { max: 10, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const parsed = smtpTestSchema.safeParse(req.body)
      if (!parsed.success) return reply.code(400).send({ error: "Enter a valid recipient email" })
      const result = await sendTestEmail(parsed.data.to)
      if (!result.ok) return reply.code(400).send({ error: result.error ?? "Failed to send test email" })
      return { ok: true }
    },
  )
}
