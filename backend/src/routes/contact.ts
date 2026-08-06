import type { FastifyInstance } from "fastify"
import { contactSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { sendContactEmail } from "../lib/mailer.js"

export async function contactRoutes(app: FastifyInstance) {
  // Public submit — rate-limited to deter spam/abuse.
  app.post(
    "/",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const parsed = contactSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid data" })
      }
      const data = parsed.data
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          company: data.company ?? null,
          message: data.message,
        },
      })
      const emailed = await sendContactEmail(data, req.log)
      return reply.code(201).send({ ok: true, emailed })
    },
  )
}

/** Admin: list / triage submissions. Mounted behind auth in the admin scope. */
export async function adminContactRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
  })

  // Toggle/set the "handled" flag.
  app.patch<{ Params: { id: string }; Body: { handled?: unknown } }>(
    "/:id",
    async (req, reply) => {
      const handled = req.body?.handled
      if (typeof handled !== "boolean") {
        return reply.code(400).send({ error: "Invalid data" })
      }
      const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } })
      if (!existing) return reply.code(404).send({ error: "Request not found" })
      const updated = await prisma.contactMessage.update({
        where: { id: existing.id },
        data: { handled },
      })
      return { ...updated, createdAt: updated.createdAt.toISOString() }
    },
  )

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Request not found" })
    await prisma.contactMessage.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })
}
