import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
import {
  generateTotpSecret,
  totpKeyUri,
  totpQrDataUrl,
  verifyTotp,
  generateRecoveryCodes,
  hashRecoveryCodes,
} from "../lib/mfa.js"
import { changePasswordSchema, mfaEnableSchema, mfaDisableSchema } from "../schemas.js"

/** Self-service account management for the logged-in admin. */
export async function accountRoutes(app: FastifyInstance) {
  // Change own password
  app.post("/password", async (req, reply) => {
    const parsed = changePasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid data"
      return reply.code(400).send({ error: msg })
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return reply.code(404).send({ error: "Account not found" })
    if (!(await verifyPassword(user.password, parsed.data.currentPassword))) {
      return reply.code(400).send({ error: "Current password is incorrect" })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(parsed.data.newPassword) },
    })
    return { ok: true }
  })

  // MFA status
  app.get("/mfa", async (req) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    return { enabled: Boolean(user?.mfaEnabled) }
  })

  // Begin MFA setup — generate a secret + QR. Not active until confirmed.
  app.post("/mfa/setup", async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return reply.code(404).send({ error: "Account not found" })
    if (user.mfaEnabled) return reply.code(409).send({ error: "MFA is already enabled" })

    const secret = generateTotpSecret()
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } })
    const uri = totpKeyUri(user.email, secret)
    const qrDataUrl = await totpQrDataUrl(uri)
    return { qrDataUrl, secret }
  })

  // Confirm setup with a valid code → enable + return one-time recovery codes.
  app.post("/mfa/enable", async (req, reply) => {
    const parsed = mfaEnableSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user?.totpSecret) {
      return reply.code(400).send({ error: "MFA has not been set up" })
    }
    if (!verifyTotp(parsed.data.code, user.totpSecret)) {
      return reply.code(400).send({ error: "Invalid verification code" })
    }
    const codes = generateRecoveryCodes()
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true, recoveryCodes: JSON.stringify(await hashRecoveryCodes(codes)) },
    })
    // Plaintext codes returned ONCE — never stored or logged in clear.
    return { ok: true, recoveryCodes: codes }
  })

  // Disable MFA — requires password re-entry.
  app.post("/mfa/disable", async (req, reply) => {
    const parsed = mfaDisableSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return reply.code(404).send({ error: "Account not found" })
    if (!(await verifyPassword(user.password, parsed.data.password))) {
      return reply.code(400).send({ error: "Incorrect password" })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, totpSecret: null, recoveryCodes: "[]" },
    })
    return { ok: true }
  })
}
