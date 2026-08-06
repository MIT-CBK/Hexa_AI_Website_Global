import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { toPostDTO } from "../lib/serialize.js"

/** Public, read-only newsletter endpoints. */
export async function postsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    })
    return posts.map(toPostDTO)
  })

  app.get<{ Params: { slug: string } }>("/:slug", async (req, reply) => {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } })
    if (!post || !post.published) {
      return reply.code(404).send({ error: "Post not found" })
    }
    return toPostDTO(post)
  })
}
