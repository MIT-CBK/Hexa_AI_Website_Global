import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { hashPassword } from "../lib/password.js"
import { createUserSchema } from "../schemas.js"

const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  mfaEnabled: true,
  createdAt: true,
} as const

/** Manage admin accounts. Whole scope is behind the auth hook. */
export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: "asc" },
    })
    return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
  })

  app.post("/", async (req, reply) => {
    const parsed = createUserSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid data"
      return reply.code(400).send({ error: msg })
    }
    const email = parsed.data.email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.code(409).send({ error: "Email already exists" })

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name.trim(),
        password: await hashPassword(parsed.data.password),
        role: "admin",
      },
      select: SAFE_SELECT,
    })
    return reply.code(201).send({ ...user, createdAt: user.createdAt.toISOString() })
  })

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    // Can't delete yourself (avoid locking out the active session by accident).
    if (req.params.id === req.user.sub) {
      return reply.code(400).send({ error: "You cannot delete the account you are currently signed in with" })
    }
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!existing) return reply.code(404).send({ error: "Account not found" })
    // Never remove the last admin.
    const count = await prisma.user.count()
    if (count <= 1) {
      return reply.code(400).send({ error: "At least one admin account must remain" })
    }
    await prisma.user.delete({ where: { id: existing.id } })
    return reply.code(204).send()
  })
}
