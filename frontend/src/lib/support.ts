import { api, getToken, setToken } from "@/lib/api-client"

export interface Customer {
  id: string
  email: string
  name: string
  company: string | null
}

export interface Attachment {
  url: string
  name: string
}

export type Severity = "low" | "medium" | "high" | "critical"
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"

export interface Ticket {
  id: string
  subject: string
  product: string
  severity: Severity
  description: string
  contactEmail: string
  attachments: Attachment[]
  status: TicketStatus
  createdAt: string
  updatedAt: string
  customer?: { name: string; email: string; company: string | null }
}

export interface TicketDraft {
  subject: string
  product: string
  severity: Severity
  description: string
  contactEmail: string
  attachments: Attachment[]
}

export const supportKeys = {
  all: ["support"] as const,
  tickets: () => [...supportKeys.all, "tickets"] as const,
  adminTickets: () => [...supportKeys.all, "admin-tickets"] as const,
}

/* ---- Customer auth (token stored under the "customer" principal) ---- */
interface AuthResponse {
  token: string
  customer: Customer
}

export async function registerCustomer(data: {
  name: string
  email: string
  password: string
  company?: string
  code: string
}): Promise<Customer> {
  const res = await api.post<AuthResponse>("/api/customer/register", data)
  setToken(res.token, "customer")
  return res.customer
}

export async function loginCustomer(email: string, password: string): Promise<Customer> {
  const res = await api.post<AuthResponse>("/api/customer/login", { email, password })
  setToken(res.token, "customer")
  return res.customer
}

export function logoutCustomer(): void {
  setToken(null, "customer")
}

export function isCustomerAuthenticated(): boolean {
  return getToken("customer") !== null
}

export const getCustomerMe = () => api.get<{ customer: Customer }>("/api/customer/me")

/* ---- Tickets ---- */
export const listTickets = () => api.get<Ticket[]>("/api/support/tickets")
export const getTicket = (id: string) => api.get<Ticket>(`/api/support/tickets/${id}`)
export const createTicket = (draft: TicketDraft) =>
  api.post<Ticket>("/api/support/tickets", draft)

export async function uploadAttachment(file: File): Promise<Attachment> {
  const form = new FormData()
  form.append("file", file)
  return api.post<Attachment>("/api/support/uploads", form)
}

/* ---- Admin triage ---- */
export const adminListTickets = () => api.get<Ticket[]>("/api/admin/tickets")
export const adminSetTicketStatus = (id: string, status: TicketStatus) =>
  api.patch<Ticket>(`/api/admin/tickets/${id}`, { status })

/* ---- Admin customer codes ---- */
export interface CustomerCode {
  id: string
  code: string
  label: string
  products: string[]
  active: boolean
  createdAt: string
}

export const codeKeys = { all: ["customer-codes"] as const }

export const listCodes = () => api.get<CustomerCode[]>("/api/admin/customer-codes")
export const createCode = (label: string, products: string[] = []) =>
  api.post<CustomerCode>("/api/admin/customer-codes", { label, products })
export const setCodeActive = (id: string, active: boolean) =>
  api.patch<CustomerCode>(`/api/admin/customer-codes/${id}`, { active })
export const setCodeProducts = (id: string, products: string[]) =>
  api.patch<CustomerCode>(`/api/admin/customer-codes/${id}`, { products })
export const deleteCode = (id: string) => api.del<void>(`/api/admin/customer-codes/${id}`)
