import type { FastifyInstance } from "fastify"
import { loginSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { verifyPassword } from "../lib/password.js"
import { verifyTotp, consumeRecoveryCode, parseHashes } from "../lib/mfa.js"

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login",
    { config: { rateLimit: { max: 8, timeWindow: "5 minutes" } } },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid data" })
      }
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
      // Generic message — never reveal whether the email exists.
      if (!user || !(await verifyPassword(user.password, parsed.data.password))) {
        return reply.code(401).send({ error: "Incorrect email or password" })
      }

      // Second factor — only probed AFTER the password is verified, so an
      // unauthenticated attacker can't learn whether MFA is enabled.
      if (user.mfaEnabled) {
        const code = parsed.data.code?.trim()
        if (!code) {
          return reply.code(401).send({ error: "Two-factor authentication code required", mfaRequired: true })
        }
        let ok = user.totpSecret ? verifyTotp(code, user.totpSecret) : false
        if (!ok) {
          const remaining = await consumeRecoveryCode(code, parseHashes(user.recoveryCodes))
          if (remaining) {
            ok = true
            await prisma.user.update({
              where: { id: user.id },
              data: { recoveryCodes: JSON.stringify(remaining) },
            })
          }
        }
        if (!ok) {
          return reply.code(401).send({ error: "Invalid verification code", mfaRequired: true })
        }
      }

      const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.name, kind: "admin" })
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      }
    },
  )

  app.get("/me", { onRequest: [app.authenticate] }, async (req) => ({ user: req.user }))
}
