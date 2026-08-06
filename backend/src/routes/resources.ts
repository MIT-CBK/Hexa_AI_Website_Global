import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { unlink } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import path from "node:path"
import type { FastifyInstance } from "fastify"
import { resourceSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { env } from "../env.js"

interface ResourceRow {
  id: string
  kind: string
  category: string
  product: string | null
  title: string
  version: string | null
  description: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  content: string | null
  createdAt: Date
  updatedAt: Date
}

function toResource(r: ResourceRow) {
  return { ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }
}

const ALLOWED_EXT = new Set([
  "pdf", "zip", "gz", "tgz", "tar", "exe", "msi", "deb", "rpm", "sh", "bin", "run",
  "txt", "log", "md", "docx", "csv", "json", "png", "jpg", "jpeg", "webp", "svg",
])
const MAX_BYTES = 10 * 1024 * 1024 * 1024 // 10 GB (large installers / packages)

/** Admin CRUD for downloads & documents. */
export async function adminResourcesRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const rows = await prisma.resource.findMany({ orderBy: [{ createdAt: "desc" }] })
    return rows.map(toResource)
  })

  app.post("/", async (req, reply) => {
    const parsed = resourceSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid data"
      return reply.code(400).send({ error: msg })
    }
    const r = await prisma.resource.create({ data: parsed.data })
    return reply.code(201).send(toResource(r))
  })

  app.put<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const parsed = resourceSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const existing = await prisma.resource.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Not found" })
    const r = await prisma.resource.update({ where: { id: existing.id }, data: parsed.data })
    return toResource(r)
  })

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const existing = await prisma.resource.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Not found" })
    await prisma.resource.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })

  // File upload (installers / packages / docs).
  app.post("/upload", async (req, reply) => {
    const file = await req.file({ limits: { fileSize: MAX_BYTES } })
    if (!file) return reply.code(400).send({ error: "No file provided" })
    const orig = file.filename || "file"
    const ext = orig.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_EXT.has(ext)) return reply.code(415).send({ error: "Unsupported file format" })

    const filename = `${randomUUID()}.${ext}`
    const dest = path.join(env.UPLOAD_DIR, filename)
    try {
      await pipeline(file.file, createWriteStream(dest))
    } catch (err) {
      req.log.error({ err: err instanceof Error ? err.message : "unknown" }, "resource upload failed")
      return reply.code(500).send({ error: "Failed to save file" })
    }
    if (file.file.truncated) {
      await unlink(dest).catch(() => {})
      return reply.code(413).send({ error: "File exceeds the 10GB limit" })
    }
    const safeName = orig.replace(/[^\w.\- ]/g, "").slice(0, 160) || filename
    return reply.code(201).send({ url: `/uploads/${filename}`, name: safeName, size: file.file.bytesRead })
  })
}
