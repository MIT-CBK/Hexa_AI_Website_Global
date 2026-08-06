import type { FastifyInstance } from "fastify"
import { customerRegisterSchema, customerLoginSchema } from "../schemas.js"
import { prisma } from "../lib/prisma.js"
import { hashPassword, verifyPassword } from "../lib/password.js"

function publicCustomer(c: { id: string; email: string; name: string; company: string | null }) {
  return { id: c.id, email: c.email, name: c.name, company: c.company }
}

/** Public customer auth (self-service). Tokens carry kind="customer". */
export async function customerRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const parsed = customerRegisterSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid data"
        return reply.code(400).send({ error: msg })
      }
      // Gate sign-up behind a valid, active customer code.
      const code = parsed.data.code.trim()
      const validCode = await prisma.customerCode.findUnique({ where: { code } })
      if (!validCode || !validCode.active) {
        return reply.code(400).send({ error: "Invalid customer code" })
      }
      const email = parsed.data.email.toLowerCase().trim()
      if (await prisma.customer.findUnique({ where: { email } })) {
        return reply.code(409).send({ error: "Email is already registered" })
      }
      const customer = await prisma.customer.create({
        data: {
          email,
          name: parsed.data.name.trim(),
          company: parsed.data.company?.trim() || null,
          code,
          products: validCode.products, // snapshot entitlements from the code
          password: await hashPassword(parsed.data.password),
        },
      })
      const token = app.jwt.sign({ sub: customer.id, kind: "customer", name: customer.name })
      return reply.code(201).send({ token, customer: publicCustomer(customer) })
    },
  )

  app.post(
    "/login",
    { config: { rateLimit: { max: 8, timeWindow: "5 minutes" } } },
    async (req, reply) => {
      const parsed = customerLoginSchema.safeParse(req.body)
      if (!parsed.success) return reply.code(400).send({ error: "Invalid data" })
      const customer = await prisma.customer.findUnique({
        where: { email: parsed.data.email.toLowerCase().trim() },
      })
      if (!customer || !(await verifyPassword(customer.password, parsed.data.password))) {
        return reply.code(401).send({ error: "Incorrect email or password" })
      }
      const token = app.jwt.sign({ sub: customer.id, kind: "customer", name: customer.name })
      return { token, customer: publicCustomer(customer) }
    },
  )

  app.get("/me", { onRequest: [app.authenticateCustomer] }, async (req, reply) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.user.sub } })
    if (!customer) return reply.code(404).send({ error: "Account not found" })
    return { customer: publicCustomer(customer) }
  })
}
