import { api } from "@/lib/api-client"
import type { L } from "@/i18n"

export type ResourceKind = "download" | "document"

export interface Resource {
  id: string
  kind: ResourceKind
  category: string
  product: string | null
  title: string
  version: string | null
  description: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  content: string | null
  createdAt: string
  updatedAt: string
}

export interface ResourceDraft {
  kind: ResourceKind
  category: string
  product?: string | null
  title: string
  version?: string | null
  description?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  content?: string | null
}

/** Category taxonomy (label + display group), bilingual. */
export interface CatDef {
  key: string
  group: string
  label: L
}

export const DOWNLOAD_CATS: CatDef[] = [
  { key: "installation", group: "installation", label: { vi: "Installation file", en: "Installation file" } },
  { key: "hotfix", group: "update", label: { vi: "Hotfix", en: "Hotfix" } },
  { key: "fixpack", group: "update", label: { vi: "Fixpack", en: "Fixpack" } },
  { key: "agent", group: "update", label: { vi: "Agent", en: "Agent" } },
  { key: "collector", group: "update", label: { vi: "Collector", en: "Collector" } },
  { key: "manager", group: "update", label: { vi: "Manager", en: "Manager" } },
]

export const DOCUMENT_CATS: CatDef[] = [
  { key: "product-guide", group: "guide", label: { vi: "Product guide", en: "Product guide" } },
  { key: "installation-guide", group: "guide", label: { vi: "Installation guide", en: "Installation guide" } },
  { key: "datasheet", group: "collateral", label: { vi: "Datasheet", en: "Datasheet" } },
  { key: "brochure", group: "collateral", label: { vi: "Brochure", en: "Brochure" } },
  { key: "kb", group: "kb", label: { vi: "Knowledge Base", en: "Knowledge base" } },
]

export const GROUP_LABELS: Record<string, L> = {
  installation: { vi: "Installation file", en: "Installation file" },
  update: { vi: "Update", en: "Update" },
  guide: { vi: "Guides", en: "Guides" },
  collateral: { vi: "Datasheets & Brochures", en: "Datasheets & Brochures" },
  kb: { vi: "Knowledge Base", en: "Knowledge base" },
}

export function catLabel(key: string): L {
  return [...DOWNLOAD_CATS, ...DOCUMENT_CATS].find((c) => c.key === key)?.label ?? { vi: key, en: key }
}

export const resourceKeys = {
  all: ["resources"] as const,
  customer: (kind: ResourceKind) => [...resourceKeys.all, "customer", kind] as const,
  admin: () => [...resourceKeys.all, "admin"] as const,
}

/* ---- Customer (read-only) ---- */
export const listResources = (kind: ResourceKind) =>
  api.get<Resource[]>(`/api/support/resources?kind=${kind}`)

/* ---- Admin CRUD ---- */
export const adminListResources = () => api.get<Resource[]>("/api/admin/resources")
export const createResource = (draft: ResourceDraft) =>
  api.post<Resource>("/api/admin/resources", draft)
export const updateResource = (id: string, draft: ResourceDraft) =>
  api.put<Resource>(`/api/admin/resources/${id}`, draft)
export const deleteResource = (id: string) => api.del<void>(`/api/admin/resources/${id}`)

export async function uploadResourceFile(
  file: File,
): Promise<{ url: string; name: string; size: number }> {
  const form = new FormData()
  form.append("file", file)
  return api.post<{ url: string; name: string; size: number }>("/api/admin/resources/upload", form)
}

export function formatSize(bytes?: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
