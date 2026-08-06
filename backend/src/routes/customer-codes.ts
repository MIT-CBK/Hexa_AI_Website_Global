import { randomBytes } from "node:crypto"
import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { customerCodeSchema, customerCodePatchSchema } from "../schemas.js"

function generateCode(): string {
  const hex = randomBytes(4).toString("hex").toUpperCase() // 8 chars
  return `HEXA-${hex.slice(0, 4)}-${hex.slice(4)}`
}

function parseProducts(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

interface CodeRow {
  id: string
  code: string
  label: string
  products: string
  active: boolean
  createdAt: Date
}
function toCode(c: CodeRow) {
  return { ...c, products: parseProducts(c.products), createdAt: c.createdAt.toISOString() }
}

/** Admin management of customer codes (registration gate + product entitlements). */
export async function adminCustomerCodesRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const codes = await prisma.customerCode.findMany({ orderBy: { createdAt: "desc" } })
    return codes.map(toCode)
  })

  app.post("/", async (req, reply) => {
    const parsed = customerCodeSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid data"
      return reply.code(400).send({ error: msg })
    }
    const code = (parsed.data.code?.trim() || generateCode()).toUpperCase()
    if (await prisma.customerCode.findUnique({ where: { code } })) {
      return reply.code(409).send({ error: "Code already exists" })
    }
    const created = await prisma.customerCode.create({
      data: { code, label: parsed.data.label.trim(), products: JSON.stringify(parsed.data.products) },
    })
    return reply.code(201).send(toCode(created))
  })

  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const parsed = customerCodePatchSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const existing = await prisma.customerCode.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Code not found" })
    const updated = await prisma.customerCode.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
        ...(parsed.data.products !== undefined ? { products: JSON.stringify(parsed.data.products) } : {}),
      },
    })
    return toCode(updated)
  })

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const existing = await prisma.customerCode.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Code not found" })
    await prisma.customerCode.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })
}
