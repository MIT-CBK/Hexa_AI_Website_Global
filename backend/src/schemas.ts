import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
  // TOTP 6-digit or recovery code (xxxxx-xxxxx); optional on first step.
  code: z.string().max(20).optional(),
})

// Password policy for new/changed passwords.
const passwordField = z.string().min(8, "Password must be at least 8 characters").max(200)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordField,
})

export const createUserSchema = z.object({
  email: z.string().email().max(160),
  name: z.string().min(2).max(80),
  password: passwordField,
})

export const mfaEnableSchema = z.object({
  code: z.string().min(6).max(10),
})

export const mfaDisableSchema = z.object({
  password: z.string().min(1).max(200),
})

export const postAttachmentSchema = z.object({
  url: z.string().max(512),
  name: z.string().max(200),
  size: z.number().int().nonnegative().optional().nullable(),
})

export const postDraftSchema = z.object({
  title: z.string().min(3).max(160),
  excerpt: z.string().min(10).max(320),
  category: z.string().min(1).max(48),
  coverImage: z.string().max(512).optional().nullable(),
  content: z.string().min(20).max(200_000),
  author: z.string().min(2).max(80),
  tags: z.array(z.string().max(32)).max(8).default([]),
  attachments: z.array(postAttachmentSchema).max(20).default([]),
  published: z.boolean().default(true),
})

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  company: z.string().max(120).optional().nullable(),
  message: z.string().min(10).max(2000),
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/).optional(),
})

/* ---- Customer support ---- */
export const customerRegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  password: passwordField,
  company: z.string().max(120).optional(),
  code: z.string().min(1, "Please enter a customer code").max(64),
})

export const DOWNLOAD_CATEGORIES = [
  "installation",
  "hotfix",
  "fixpack",
  "agent",
  "collector",
  "manager",
] as const
export const DOCUMENT_CATEGORIES = [
  "product-guide",
  "installation-guide",
  "datasheet",
  "brochure",
  "kb",
] as const

export const resourceSchema = z
  .object({
    kind: z.enum(["download", "document"]),
    category: z.enum([...DOWNLOAD_CATEGORIES, ...DOCUMENT_CATEGORIES]),
    product: z.string().max(48).optional().nullable(),
    title: z.string().min(2).max(200),
    version: z.string().max(48).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    fileUrl: z.string().max(512).optional().nullable(),
    fileName: z.string().max(200).optional().nullable(),
    fileSize: z.number().int().nonnegative().optional().nullable(),
    content: z.string().max(100_000).optional().nullable(),
  })
  .refine(
    (r) =>
      r.kind === "download"
        ? (DOWNLOAD_CATEGORIES as readonly string[]).includes(r.category)
        : (DOCUMENT_CATEGORIES as readonly string[]).includes(r.category),
    { message: "Category does not match the type" },
  )

export const customerCodeSchema = z.object({
  label: z.string().min(2, "Please enter a label (company/contract name)").max(120),
  code: z.string().max(64).optional(),
  products: z.array(z.string().max(48)).max(30).default([]),
})

export const customerCodePatchSchema = z.object({
  active: z.boolean().optional(),
  products: z.array(z.string().max(48)).max(30).optional(),
})

export const customerLoginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
})

const attachment = z.object({
  url: z.string().max(512),
  name: z.string().max(200),
})

export const ticketSchema = z.object({
  subject: z.string().min(4, "Subject must be at least 4 characters").max(160),
  product: z.string().min(1).max(48),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(8000),
  contactEmail: z.string().email().max(160),
  attachments: z.array(attachment).max(10).default([]),
})

export const ticketStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
})

/* ---- Admin settings: SMTP ---- */
export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.string().max(40).default("custom"),
  host: z.string().max(255).default(""),
  port: z.coerce.number().int().min(1).max(65535).default(587),
  encryption: z.enum(["none", "starttls", "ssl"]).default("starttls"),
  user: z.string().max(255).default(""),
  // Omit or leave empty to keep the currently stored password.
  password: z.string().max(500).optional(),
  fromEmail: z.string().max(255).default(""),
  fromName: z.string().max(120).default("Hexa AI"),
  toEmail: z.string().max(255).default(""),
})

export const smtpTestSchema = z.object({
  to: z.string().email("Enter a valid recipient email").max(255),
})

/* ---- Product order / quote requests (Buy now configurator) ---- */
export const orderSchema = z.object({
  product: z.string().min(1).max(48), // offering abbr (OBS, NMS…)
  productName: z.string().max(120).optional(),
  deployment: z.enum(["cloud", "self-hosted"]),
  metric: z.string().max(40), // "nodes" | "eps" | "throughput" | "seats"
  metricLabel: z.string().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(10_000_000),
  sensors: z.coerce.number().int().min(0).max(1_000_000).optional(),
  term: z.string().max(40).optional(), // subscription term (cloud metered)
  region: z.string().max(80).optional(), // cloud region
  aiops: z.boolean().default(false),
  aiopsTerm: z.string().max(40).optional(),
  multiTenant: z.boolean().default(false),
  tenants: z.coerce.number().int().min(1).max(1_000_000).optional(),
  languagePack: z.boolean().default(false),
  languages: z.array(z.string().max(60)).max(60).optional(),
  email: z.string().email().max(160),
  name: z.string().max(80).optional(),
  company: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/).optional(),
})
export type OrderInput = z.infer<typeof orderSchema>

export const orderStatusSchema = z.object({
  status: z.enum(["new", "contacted", "won", "lost"]),
})

/* ---- Visitor analytics ---- */
export const trackSchema = z.object({
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(500).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PostDraftInput = z.infer<typeof postDraftSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
