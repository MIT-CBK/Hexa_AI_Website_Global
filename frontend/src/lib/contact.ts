import { api } from "@/lib/api-client"
import { getVisitorId } from "@/lib/analytics"

export interface ContactInput {
  name: string
  email: string
  company?: string
  message: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  handled: boolean
  createdAt: string
}

export const contactKeys = {
  all: ["contacts"] as const,
  list: () => [...contactKeys.all, "list"] as const,
}

/* ---- Public ---- */
export const submitContact = (data: ContactInput) =>
  api.post<{ ok: boolean; emailed: boolean }>("/api/contact", { ...data, visitorId: getVisitorId() })

/* ---- Admin (require token) ---- */
export const adminListContacts = () => api.get<ContactMessage[]>("/api/admin/contact")
export const setContactHandled = (id: string, handled: boolean) =>
  api.patch<ContactMessage>(`/api/admin/contact/${id}`, { handled })
export const deleteContact = (id: string) => api.del<void>(`/api/admin/contact/${id}`)
