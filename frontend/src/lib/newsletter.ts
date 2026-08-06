import { api } from "@/lib/api-client"

export interface Attachment {
  url: string
  name: string
  size?: number | null
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  coverImage: string | null
  content: string
  author: string
  tags: string[]
  attachments: Attachment[]
  published: boolean
  publishedAt: string
  updatedAt: string
}

export interface PostDraft {
  title: string
  excerpt: string
  category: string
  coverImage?: string | null
  content: string
  author: string
  tags: string[]
  attachments?: Attachment[]
  published?: boolean
}

export const postKeys = {
  all: ["posts"] as const,
  list: () => [...postKeys.all, "list"] as const,
  detail: (slug: string) => [...postKeys.all, "detail", slug] as const,
  adminList: () => [...postKeys.all, "admin"] as const,
}

/* ---- Public ---- */
export const listPosts = () => api.get<Post[]>("/api/posts")
export const getPost = (slug: string) => api.get<Post>(`/api/posts/${slug}`)

/* ---- Admin (require token) ---- */
export const adminListPosts = () => api.get<Post[]>("/api/admin/posts")
export const createPost = (draft: PostDraft) => api.post<Post>("/api/admin/posts", draft)
export const updatePost = (id: string, draft: PostDraft) =>
  api.put<Post>(`/api/admin/posts/${id}`, draft)
export const deletePost = (id: string) => api.del<void>(`/api/admin/posts/${id}`)

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const { url } = await api.post<{ url: string }>("/api/admin/uploads", form)
  return url
}

/** Convert an uploaded Word (.docx) or PDF file into Markdown post content. */
export async function importDocument(file: File): Promise<{ title: string; content: string }> {
  const form = new FormData()
  form.append("file", file)
  return api.post<{ title: string; content: string }>("/api/admin/posts/import", form)
}

/** Upload a file to attach to a post. */
export async function uploadPostAttachment(file: File): Promise<Attachment> {
  const form = new FormData()
  form.append("file", file)
  return api.post<Attachment>("/api/admin/posts/attachment", form)
}
