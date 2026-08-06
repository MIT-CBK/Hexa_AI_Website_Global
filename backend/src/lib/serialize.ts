import type { Post } from "@prisma/client"

export interface AttachmentDTO {
  url: string
  name: string
  size: number | null
}

export interface PostDTO {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  coverImage: string | null
  content: string
  author: string
  tags: string[]
  attachments: AttachmentDTO[]
  published: boolean
  publishedAt: string
  updatedAt: string
}

function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === "string")
    return []
  } catch {
    return []
  }
}

function parseAttachments(raw: string): AttachmentDTO[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
      .map((a) => ({
        url: typeof a.url === "string" ? a.url : "",
        name: typeof a.name === "string" ? a.name : "",
        size: typeof a.size === "number" ? a.size : null,
      }))
      .filter((a) => a.url && a.name)
  } catch {
    return []
  }
}

/** Shape a DB Post into the JSON sent to clients (tags decoded to array). */
export function toPostDTO(post: Post): PostDTO {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    coverImage: post.coverImage,
    content: post.content,
    author: post.author,
    tags: parseTags(post.tags),
    attachments: parseAttachments(post.attachments),
    published: post.published,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}
