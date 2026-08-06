import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { contentSchema } from "../content-schema.js"

const SINGLETON = "singleton"

/** Public: read the current site content document (null if never saved). */
export async function contentRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const row = await prisma.siteContent.findUnique({ where: { id: SINGLETON } })
    if (!row) return null
    try {
      return JSON.parse(row.data)
    } catch {
      return null // corrupt → let the client fall back to its bundled defaults
    }
  })
}

/** Admin: replace the whole content document (validated). */
export async function adminContentRoutes(app: FastifyInstance) {
  app.put("/", async (req, reply) => {
    const parsed = contentSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid content" })
    }
    const data = JSON.stringify(parsed.data)
    await prisma.siteContent.upsert({
      where: { id: SINGLETON },
      update: { data },
      create: { id: SINGLETON, data },
    })
    return { ok: true }
  })
}
