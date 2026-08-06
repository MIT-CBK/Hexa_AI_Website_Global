import "dotenv/config"
import { z } from "zod"

/**
 * Validate & freeze configuration at startup (zero-trust, fail-fast).
 * Secrets are NEVER hardcoded — only read from the environment. In production
 * a missing JWT secret is fatal; in development we fall back to a clearly
 * non-production value so the app still boots locally.
 */
const isProd = process.env.NODE_ENV === "production"

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().default("file:./data/hexa.db"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters")
    .default(isProd ? "" : "dev-only-insecure-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("12h"),

  // CORS — comma-separated allowlist of frontend origins
  CORS_ORIGIN: z.string().default("http://localhost:5180"),

  // Uploads
  UPLOAD_DIR: z.string().default("./uploads"),
  PUBLIC_URL: z.string().default("http://localhost:4000"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(2 * 1024 * 1024),

  // Seed admin (used once by prisma/seed.ts)
  ADMIN_EMAIL: z.string().email().default("admin@hexa.ai"),
  ADMIN_PASSWORD: z.string().min(8).default("ChangeMe!123"),
  ADMIN_NAME: z.string().default("Hexa Admin"),

  // SMTP (optional — contact email is sent only when fully configured)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  CONTACT_TO: z.string().default("info@hexacyber.ai"),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data

if (isProd && env.JWT_SECRET.length < 16) {
  console.error("❌ JWT_SECRET is required in production.")
  process.exit(1)
}

/** True only when every SMTP field needed to send mail is present. */
export const smtpEnabled = Boolean(
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS,
)
