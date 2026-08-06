import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { DEFAULT_CONTENT } from "@/data/default-content"
import type { SiteContent, Offering } from "@/data/content-types"

export const contentKeys = {
  all: ["content"] as const,
}

export const getContent = () => api.get<SiteContent | null>("/api/content")
export const updateContent = (doc: SiteContent) => api.put<{ ok: boolean }>("/api/admin/content", doc)

/** Minimal shape guard so an old/corrupt document falls back to defaults. */
function isValidDoc(x: unknown): x is SiteContent {
  if (!x || typeof x !== "object") return false
  const d = x as Partial<SiteContent>
  return (
    !!d.home &&
    Array.isArray(d.solutions) &&
    Array.isArray(d.services) &&
    Array.isArray(d.certGroups)
  )
}

/**
 * The site content document. Uses the server's saved document when present and
 * valid; otherwise the bundled defaults. Cached app-wide via react-query.
 */
export function useSiteContent(): SiteContent {
  const { data } = useQuery({
    queryKey: contentKeys.all,
    queryFn: getContent,
    staleTime: 5 * 60_000,
  })
  return isValidDoc(data) ? data : DEFAULT_CONTENT
}

export function allOfferings(content: SiteContent): Offering[] {
  return [...content.solutions, ...content.services]
}

export function findOffering(content: SiteContent, slug: string): Offering | undefined {
  return allOfferings(content).find((o) => o.slug === slug)
}
