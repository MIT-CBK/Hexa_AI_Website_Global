import { z } from "zod"

/** Localized value (bilingual). */
const lv = z.object({
  vi: z.string().max(5000),
  en: z.string().max(5000),
})

const heading = z.object({ eyebrow: lv, title: lv, desc: lv })

const offering = z.object({
  slug: z.string().min(1).max(64),
  abbr: z.string().min(1).max(40),
  iconKey: z.string().max(40),
  gradient: z.string().max(120),
  category: lv,
  name: lv,
  tagline: lv,
  summary: lv,
  overview: lv,
  features: z.array(z.object({ title: lv, desc: lv })).max(12),
  outcomes: z.array(lv).max(12),
  aiHighlight: z
    .object({
      title: lv,
      desc: lv,
      points: z.array(z.object({ title: lv, desc: lv })).max(8),
    })
    .optional(),
})

const certGroup = z.object({
  key: z.string().min(1).max(40),
  iconKey: z.string().max(40),
  gradient: z.string().max(120),
  title: lv,
  desc: lv,
  items: z
    .array(
      z.object({
        code: z.string().min(1).max(40),
        issuer: z.string().max(80),
        name: lv,
        blurb: lv,
        elite: z.boolean().optional(),
        // Logo must be a relative upload path — blocks javascript:/data:/external URLs (stored XSS / SSRF).
        logoUrl: z
          .string()
          .regex(/^\/uploads\/[A-Za-z0-9._-]+$/, "Invalid logoUrl")
          .max(300)
          .optional(),
      }),
    )
    .max(20),
})

export const contentSchema = z.object({
  home: z.object({
    hero: z.object({ badge: lv, title: lv, subtitle: lv }),
    stats: z.array(z.object({ value: z.string().max(16), label: lv })).max(8),
    solutions: heading,
    services: heading,
    vision: z.object({
      eyebrow: lv,
      title: lv,
      visionTitle: lv,
      visionBody: lv,
      missionTitle: lv,
      missionBody: lv,
      values: z.array(z.object({ iconKey: z.string().max(40), title: lv, desc: lv })).max(8),
    }),
    certs: heading,
    newsletter: z.object({ eyebrow: lv, previewTitle: lv, previewDesc: lv }),
    cta: z.object({ title: lv, desc: lv }),
    contact: z.object({
      eyebrow: lv,
      title: lv,
      desc: lv,
      email: z.string().email().max(160),
      office: lv,
    }),
  }),
  solutions: z.array(offering).max(20),
  services: z.array(offering).max(20),
  certGroups: z.array(certGroup).max(12),
})

export type SiteContentDoc = z.infer<typeof contentSchema>
