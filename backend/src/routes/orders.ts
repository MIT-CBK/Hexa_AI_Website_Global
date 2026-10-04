import type { FastifyInstance } from "fastify"
import { orderSchema, orderStatusSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { sendOrderEmails } from "../lib/mailer.js"

/** Public: submit an order / quote request from the Buy-now configurator. */
export async function orderRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { config: { rateLimit: { max: 8, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const parsed = orderSchema.safeParse(req.body)
      if (!parsed.success) return reply.code(400).send({ error: "Invalid order details" })
      const { visitorId, ...o } = parsed.data

      await prisma.order.create({
        data: {
          product: o.product,
          deployment: o.deployment,
          email: o.email,
          name: o.name ?? null,
          company: o.company ?? null,
          details: JSON.stringify(o),
          visitorId: visitorId ?? null,
          status: "new",
        },
      })

      const emailed = await sendOrderEmails(o, req.log)
      return reply.code(201).send({ ok: true, emailed })
    },
  )
}

/** Admin: list / triage order requests (deals). Mounted behind admin auth. */
export async function adminOrdersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 300 })
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      details: safeParse(r.details),
    }))
  })

  app.patch<{ Params: { id: string }; Body: unknown }>("/:id", async (req, reply) => {
    const parsed = orderStatusSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid status" })
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Order not found" })
    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
    })
    return { ...updated, createdAt: updated.createdAt.toISOString(), details: safeParse(updated.details) }
  })

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Order not found" })
    await prisma.order.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}
