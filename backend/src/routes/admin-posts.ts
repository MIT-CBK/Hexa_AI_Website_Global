import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { unlink } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import path from "node:path"
import type { FastifyInstance } from "fastify"
import { postDraftSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { toPostDTO } from "../lib/serialize.js"
import { uniqueSlug } from "../lib/slug.js"
import { env } from "../env.js"
import { docxToMarkdown, pdfToMarkdown } from "../lib/import-doc.js"

// Attachments authors can upload alongside a post (no SVG — stored-XSS risk).
const ATTACH_EXT = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "md", "zip",
  "png", "jpg", "jpeg", "webp", "gif",
])
const IMPORT_MAX_BYTES = 30 * 1024 * 1024
const ATTACH_MAX_BYTES = 50 * 1024 * 1024

/** Admin CRUD for posts. Entire scope is protected by the auth hook. */
export async function adminPostsRoutes(app: FastifyInstance) {
  // List all (including unpublished)
  app.get("/", async () => {
    const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } })
    return posts.map(toPostDTO)
  })

  // Create
  app.post("/", async (req, reply) => {
    const parsed = postDraftSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const d = parsed.data
    const post = await prisma.post.create({
      data: {
        slug: await uniqueSlug(d.title),
        title: d.title,
        excerpt: d.excerpt,
        category: d.category,
        coverImage: d.coverImage ?? null,
        content: d.content,
        author: d.author,
        tags: JSON.stringify(d.tags),
        attachments: JSON.stringify(d.attachments),
        published: d.published,
      },
    })
    return reply.code(201).send(toPostDTO(post))
  })

  // Update
  app.put<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const parsed = postDraftSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Post not found" })
    const d = parsed.data
    const post = await prisma.post.update({
      where: { id: existing.id },
      data: {
        slug: await uniqueSlug(d.title, existing.id),
        title: d.title,
        excerpt: d.excerpt,
        category: d.category,
        coverImage: d.coverImage ?? null,
        content: d.content,
        author: d.author,
        tags: JSON.stringify(d.tags),
        attachments: JSON.stringify(d.attachments),
        published: d.published,
      },
    })
    return toPostDTO(post)
  })

  // Delete
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Post not found" })
    await prisma.post.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })

  // Import a Word (.docx) or PDF file → Markdown content for the editor.
  app.post("/import", async (req, reply) => {
    const file = await req.file({ limits: { fileSize: IMPORT_MAX_BYTES } })
    if (!file) return reply.code(400).send({ error: "No file provided" })
    const orig = file.filename || "document"
    const ext = orig.split(".").pop()?.toLowerCase() ?? ""

    let buffer: Buffer
    try {
      buffer = await file.toBuffer()
    } catch {
      return reply.code(413).send({ error: "File exceeds the 30MB limit" })
    }
    if (file.file.truncated) return reply.code(413).send({ error: "File exceeds the 30MB limit" })

    let content: string
    try {
      if (ext === "docx") content = await docxToMarkdown(buffer)
      else if (ext === "pdf") content = await pdfToMarkdown(buffer)
      else return reply.code(415).send({ error: "Only Word (.docx) and PDF files are supported" })
    } catch (err) {
      req.log.error({ err: err instanceof Error ? err.message : "unknown" }, "document import failed")
      return reply.code(422).send({ error: "Could not read this document. Please check the file and try again." })
    }
    if (!content.trim()) return reply.code(422).send({ error: "No readable text found in the document" })

    const title = orig
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160)
    return { title, content }
  })

  // Upload a file to attach to a post.
  app.post("/attachment", async (req, reply) => {
    const file = await req.file({ limits: { fileSize: ATTACH_MAX_BYTES } })
    if (!file) return reply.code(400).send({ error: "No file provided" })
    const orig = file.filename || "file"
    const ext = orig.split(".").pop()?.toLowerCase() ?? ""
    if (!ATTACH_EXT.has(ext)) return reply.code(415).send({ error: "Unsupported file type" })

    const filename = `${randomUUID()}.${ext}`
    const dest = path.join(env.UPLOAD_DIR, filename)
    try {
      await pipeline(file.file, createWriteStream(dest))
    } catch (err) {
      req.log.error({ err: err instanceof Error ? err.message : "unknown" }, "attachment upload failed")
      return reply.code(500).send({ error: "Failed to save file" })
    }
    if (file.file.truncated) {
      await unlink(dest).catch(() => {})
      return reply.code(413).send({ error: "File exceeds the 50MB limit" })
    }
    const safeName = orig.replace(/[^\w.\- ]/g, "").slice(0, 160) || filename
    return reply.code(201).send({ url: `/uploads/${filename}`, name: safeName, size: file.file.bytesRead })
  })
}
