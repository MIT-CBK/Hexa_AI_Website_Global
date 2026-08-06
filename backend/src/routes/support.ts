import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { unlink } from "node:fs/promises"
import path from "node:path"
import type { FastifyInstance } from "fastify"
import { ticketSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { env } from "../env.js"

interface TicketRow {
  id: string
  subject: string
  product: string
  severity: string
  description: string
  contactEmail: string
  attachments: string
  status: string
  createdAt: Date
  updatedAt: Date
}

function toTicket(t: TicketRow) {
  let attachments: { url: string; name: string }[] = []
  try {
    const v: unknown = JSON.parse(t.attachments)
    if (Array.isArray(v)) attachments = v as { url: string; name: string }[]
  } catch {
    /* ignore */
  }
  return {
    id: t.id,
    subject: t.subject,
    product: t.product,
    severity: t.severity,
    description: t.description,
    contactEmail: t.contactEmail,
    attachments,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

// Allowed attachment extensions (images + logs/text). Validated by extension.
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "txt", "log", "json", "csv", "zip", "gz"])

/** Customer support — tickets + attachment upload. Whole scope is customer-auth. */
export async function supportRoutes(app: FastifyInstance) {
  app.get("/tickets", async (req) => {
    const rows = await prisma.ticket.findMany({
      where: { customerId: req.user.sub },
      orderBy: { createdAt: "desc" },
    })
    return rows.map(toTicket)
  })

  app.get<{ Params: { id: string } }>("/tickets/:id", async (req, reply) => {
    const t = await prisma.ticket.findUnique({ where: { id: req.params.id } })
    // Anti-IDOR: only the owner may read their ticket.
    if (!t || t.customerId !== req.user.sub) {
      return reply.code(404).send({ error: "Ticket not found" })
    }
    return toTicket(t)
  })

  app.post(
    "/tickets",
    { config: { rateLimit: { max: 20, timeWindow: "1 hour" } } },
    async (req, reply) => {
      const parsed = ticketSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid data"
        return reply.code(400).send({ error: msg })
      }
      const d = parsed.data
      const t = await prisma.ticket.create({
        data: {
          customerId: req.user.sub,
          subject: d.subject,
          product: d.product,
          severity: d.severity,
          description: d.description,
          contactEmail: d.contactEmail,
          attachments: JSON.stringify(d.attachments),
        },
      })
      return reply.code(201).send(toTicket(t))
    },
  )

  // Downloads & documents catalog — limited to the customer's entitled products
  // (resources without a product are "general" and shown to everyone).
  app.get<{ Querystring: { kind?: string } }>("/resources", async (req) => {
    const kind = req.query.kind === "download" || req.query.kind === "document" ? req.query.kind : undefined
    const me = await prisma.customer.findUnique({ where: { id: req.user.sub } })
    let entitled: string[] = []
    try {
      const v: unknown = JSON.parse(me?.products ?? "[]")
      if (Array.isArray(v)) entitled = v.filter((x): x is string => typeof x === "string")
    } catch {
      /* ignore */
    }
    const rows = await prisma.resource.findMany({
      where: kind ? { kind } : undefined,
      orderBy: [{ createdAt: "desc" }],
    })
    const visible = rows.filter((r) => !r.product || entitled.includes(r.product))
    return visible.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))
  })

  // Attachment upload (image or log/text).
  app.post("/uploads", async (req, reply) => {
    const file = await req.file({ limits: { fileSize: 8 * 1024 * 1024 } })
    if (!file) return reply.code(400).send({ error: "No file provided" })

    const orig = file.filename || "file"
    const ext = orig.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_EXT.has(ext)) {
      return reply.code(415).send({ error: "Unsupported file format" })
    }
    const filename = `${randomUUID()}.${ext}`
    const dest = path.join(env.UPLOAD_DIR, filename)
    try {
      const { pipeline } = await import("node:stream/promises")
      await pipeline(file.file, createWriteStream(dest))
    } catch (err) {
      req.log.error({ err: err instanceof Error ? err.message : "unknown" }, "ticket upload failed")
      return reply.code(500).send({ error: "Failed to save file" })
    }
    if (file.file.truncated) {
      await unlink(dest).catch(() => {})
      return reply.code(413).send({ error: "File exceeds the 8MB limit" })
    }
    // Return a safe display name (strip path bits) + url.
    const safeName = orig.replace(/[^\w.\- ]/g, "").slice(0, 120) || filename
    return reply.code(201).send({ url: `/uploads/${filename}`, name: safeName })
  })
}

/** Admin: triage all tickets. Mounted in the admin scope. */
export async function adminTicketsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const rows = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { customer: { select: { name: true, email: true, company: true } } },
    })
    return rows.map((t) => ({ ...toTicket(t), customer: t.customer }))
  })

  app.patch<{ Params: { id: string }; Body: unknown }>("/:id", async (req, reply) => {
    const { ticketStatusSchema } = await import("../schemas.js")
    const parsed = ticketStatusSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid status" })
    const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Ticket not found" })
    const t = await prisma.ticket.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
    })
    return toTicket(t)
  })
}
