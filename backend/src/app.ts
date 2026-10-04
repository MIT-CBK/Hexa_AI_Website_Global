import { mkdirSync } from "node:fs"
import path from "node:path"
import Fastify, {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import jwt from "@fastify/jwt"
import rateLimit from "@fastify/rate-limit"
import multipart from "@fastify/multipart"
import fastifyStatic from "@fastify/static"
import { env } from "./env.js"
import { authRoutes } from "./routes/auth.js"
import { postsRoutes } from "./routes/posts.js"
import { adminPostsRoutes } from "./routes/admin-posts.js"
import { uploadsRoutes } from "./routes/uploads.js"
import { contactRoutes, adminContactRoutes } from "./routes/contact.js"
import { accountRoutes } from "./routes/account.js"
import { usersRoutes } from "./routes/users.js"
import { contentRoutes, adminContentRoutes } from "./routes/content.js"
import { customerRoutes } from "./routes/customer.js"
import { supportRoutes, adminTicketsRoutes } from "./routes/support.js"
import { adminCustomerCodesRoutes } from "./routes/customer-codes.js"
import { adminResourcesRoutes } from "./routes/resources.js"
import { trackRoutes, adminAnalyticsRoutes } from "./routes/analytics.js"
import { clientIp } from "./lib/client-ip.js"
import { adminSettingsRoutes } from "./routes/settings.js"
import { orderRoutes, adminOrdersRoutes } from "./routes/orders.js"

type Principal = "admin" | "customer"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; name: string; role?: string; kind?: Principal }
    user: { sub: string; name: string; role?: string; kind?: Principal }
  }
}
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    authenticateAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    authenticateCustomer: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export async function buildApp() {
  // Ensure the uploads dir exists. (The SQLite dir is created by Prisma migrate,
  // which resolves the path relative to prisma/schema.prisma.)
  mkdirSync(env.UPLOAD_DIR, { recursive: true })

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
    },
    bodyLimit: 1_000_000, // JSON bodies are small; images go through multipart.
  })

  // --- Security plugins ---
  await app.register(helmet, {
    // Allow the frontend (different origin) to load uploaded images.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // API only; CSP is enforced by the frontend host.
  })

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })

  // Key by the real visitor IP — behind Cloudflare/Caddy/nginx the socket IP is
  // the proxy, which would otherwise put every visitor in one shared bucket.
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute", keyGenerator: (req) => clientIp(req) })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })

  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify()
    } catch {
      reply.code(401).send({ error: "Authentication required" })
    }
  })

  // Role-scoped guards: a customer token must not reach admin routes (and vice
  // versa). Admin tokens before this release have no `kind` → treat as admin.
  app.decorate("authenticateAdmin", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify()
      if (req.user.kind === "customer") return reply.code(403).send({ error: "Access denied" })
    } catch {
      reply.code(401).send({ error: "Authentication required" })
    }
  })

  app.decorate("authenticateCustomer", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify()
      if (req.user.kind !== "customer") return reply.code(403).send({ error: "Access denied" })
    } catch {
      reply.code(401).send({ error: "Authentication required" })
    }
  })

  await app.register(multipart, {
    limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  })

  await app.register(fastifyStatic, {
    root: path.resolve(env.UPLOAD_DIR),
    prefix: "/uploads/",
    decorateReply: false,
  })

  // --- Generic error handler (fail securely — never leak internals) ---
  app.setErrorHandler((err: FastifyError, req, reply) => {
    const status = err.statusCode ?? 500
    if (status >= 500) {
      req.log.error({ err: err.message }, "unhandled error")
      return reply.code(500).send({ error: "A server error occurred" })
    }
    return reply.code(status).send({ error: err.message })
  })

  // --- Health check ---
  app.get("/health", async () => ({ status: "ok" }))

  // --- Public routes ---
  await app.register(postsRoutes, { prefix: "/api/posts" })
  await app.register(contactRoutes, { prefix: "/api/contact" })
  await app.register(authRoutes, { prefix: "/api/auth" })
  await app.register(contentRoutes, { prefix: "/api/content" })
  await app.register(customerRoutes, { prefix: "/api/customer" })
  await app.register(orderRoutes, { prefix: "/api/orders" })
  await app.register(trackRoutes, { prefix: "/api/track" })

  // --- Customer support (customer-auth for the whole scope) ---
  await app.register(
    async (support) => {
      support.addHook("onRequest", app.authenticateCustomer)
      await support.register(supportRoutes)
    },
    { prefix: "/api/support" },
  )

  // --- Admin routes (admin-auth required for the whole scope) ---
  await app.register(
    async (admin) => {
      admin.addHook("onRequest", app.authenticateAdmin)
      await admin.register(adminPostsRoutes, { prefix: "/posts" })
      await admin.register(uploadsRoutes, { prefix: "/uploads" })
      await admin.register(adminContactRoutes, { prefix: "/contact" })
      await admin.register(accountRoutes, { prefix: "/account" })
      await admin.register(usersRoutes, { prefix: "/users" })
      await admin.register(adminContentRoutes, { prefix: "/content" })
      await admin.register(adminTicketsRoutes, { prefix: "/tickets" })
      await admin.register(adminCustomerCodesRoutes, { prefix: "/customer-codes" })
      await admin.register(adminResourcesRoutes, { prefix: "/resources" })
      await admin.register(adminSettingsRoutes, { prefix: "/settings" })
      await admin.register(adminOrdersRoutes, { prefix: "/orders" })
      await admin.register(adminAnalyticsRoutes, { prefix: "/analytics" })
    },
    { prefix: "/api/admin" },
  )

  return app
}
