import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { unlink } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import path from "node:path"
import type { FastifyInstance } from "fastify"
import { env } from "../env.js"

// Raster-only allowlist. SVG is intentionally excluded: it can embed
// <script> and execute when opened directly, i.e. stored XSS.
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

/** Admin image upload → saved to disk, served statically at /uploads. */
export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    const file = await req.file({ limits: { fileSize: env.MAX_UPLOAD_BYTES } })
    if (!file) return reply.code(400).send({ error: "No file was uploaded" })

    const ext = EXT_BY_MIME[file.mimetype]
    if (!ext) {
      return reply.code(415).send({ error: "Invalid image format" })
    }

    const filename = `${randomUUID()}.${ext}`
    const dest = path.join(env.UPLOAD_DIR, filename)
    try {
      await pipeline(file.file, createWriteStream(dest))
    } catch (err) {
      req.log.error({ err: err instanceof Error ? err.message : "unknown" }, "upload write failed")
      return reply.code(500).send({ error: "Failed to save image" })
    }

    // @fastify/multipart flags truncation when the size limit is exceeded.
    // Remove the partial file so over-size uploads don't leave junk on disk.
    if (file.file.truncated) {
      await unlink(dest).catch(() => {})
      return reply.code(413).send({ error: "Image exceeds the size limit" })
    }

    return reply.code(201).send({ url: `/uploads/${filename}` })
  })
}
