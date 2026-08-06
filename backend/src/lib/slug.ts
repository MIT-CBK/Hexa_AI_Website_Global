import { prisma } from "./prisma.js"

/** URL-safe slug from a (possibly Vietnamese) title. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/** Produce a slug unique across posts, ignoring an optional current post id. */
export async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "post"
  let slug = base
  let n = 2
  // Loop is bounded in practice; each check is a parameterized query.
  for (;;) {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    slug = `${base}-${n++}`
  }
}
