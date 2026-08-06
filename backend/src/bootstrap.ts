import { prisma } from "./lib/prisma.js"
import { hashPassword } from "./lib/password.js"
import { env } from "./env.js"

interface SeedPost {
  slug: string
  title: string
  excerpt: string
  category: string
  coverImage: string
  author: string
  tags: string[]
  content: string
}

const SEED_POSTS: SeedPost[] = [
  {
    slug: "ai-native-soc-the-future-of-security-operations",
    title: "AI-Native SOC: The future of security operations",
    excerpt:
      "Why next-generation security operations centers put AI at the core — from alert triage to automated response.",
    category: "Perspective",
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=70",
    author: "Hexa AI Research",
    tags: ["SOC", "AI", "SOAR"],
    content: `The exponential growth in security alert volume has overwhelmed the traditional SOC model. The **AI-Native SOC** puts artificial intelligence at the center of the workflow.

## Three core shifts

- Automated alert triage that cuts up to **80%** of the noise.
- Real-time, multi-source correlation.
- Automated response playbooks via SOAR.

The result is dramatically lower MTTD and MTTR, freeing analysts to focus on the work that genuinely needs a human.

> AI doesn't replace analysts — it amplifies them.`,
  },
  {
    slug: "5-signs-your-network-needs-better-observability",
    title: "5 signs your network needs better observability",
    excerpt:
      "If your ops team still finds out about incidents from… user complaints, it's time to upgrade observability.",
    category: "Guide",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70",
    author: "Hexa AI Engineering",
    tags: ["Observability", "NMS"],
    content: `Observability is more than pretty dashboards. Here are five signs you're missing it.

## 1. Users report issues before you do

When your customers are your alerting system, you're already a step behind.

## 2. Every incident is a manhunt

Without correlation, investigations drag on for hours.

## 3. You can't answer "why is it slow?"

You have metrics but no traces — you know *something* is wrong but not *where*.`,
  },
  {
    slug: "red-teaming-vs-pentest-whats-the-difference",
    title: "Red Teaming vs. Pentest: what's the difference?",
    excerpt:
      "Two services often confused, serving very different goals. Choose the right one to optimize your security budget.",
    category: "Offensive Security",
    coverImage:
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=70",
    author: "Hexa AI OffSec",
    tags: ["Pentest", "Red Team"],
    content: `**Penetration Testing** focuses on finding as many vulnerabilities as possible within a defined scope. **Red Teaming** emulates a real adversary with a concrete objective.

> Pentest answers "what vulnerabilities exist?"; Red Team answers "can we be breached?".

## When to choose which?

- **Pentest** — when you need a thorough assessment of a specific application or system.
- **Red Team** — when you want to validate your defenders' detection & response capability.`,
  },
]

/**
 * Idempotent startup bootstrap (works in every environment incl. Docker):
 * - Ensures the admin user exists (created once; never overwrites the password).
 * - Seeds starter posts only when the table is empty (won't resurrect deletes).
 */
export async function bootstrap(log: { info: (msg: string) => void }): Promise<void> {
  const admin = await prisma.user.findUnique({ where: { email: env.ADMIN_EMAIL } })
  if (!admin) {
    await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL,
        name: env.ADMIN_NAME,
        password: await hashPassword(env.ADMIN_PASSWORD),
        role: "admin",
      },
    })
    log.info(`Created admin: ${env.ADMIN_EMAIL}`)
  }

  const count = await prisma.post.count()
  if (count === 0) {
    for (const p of SEED_POSTS) {
      await prisma.post.create({
        data: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          coverImage: p.coverImage,
          content: p.content,
          author: p.author,
          tags: JSON.stringify(p.tags),
          published: true,
        },
      })
    }
    log.info(`Seeded ${SEED_POSTS.length} starter posts`)
  }
}
