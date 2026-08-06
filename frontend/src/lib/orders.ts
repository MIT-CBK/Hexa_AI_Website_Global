import { api } from "@/lib/api-client"
import type { Deployment } from "@/data/pricing"

export interface OrderPayload {
  product: string
  productName?: string
  deployment: Deployment
  metric: string
  metricLabel?: string
  quantity: number
  sensors?: number
  term?: string
  region?: string
  aiops: boolean
  aiopsTerm?: string
  multiTenant: boolean
  tenants?: number
  languagePack: boolean
  languages?: string[]
  email: string
  name?: string
  company?: string
  role?: string
  notes?: string
}

export interface Order {
  id: string
  product: string
  deployment: string
  email: string
  name?: string | null
  company?: string | null
  details: OrderPayload
  status: string
  createdAt: string
}

export const orderKeys = { all: ["orders"] as const }

export const submitOrder = (body: OrderPayload) =>
  api.post<{ ok: boolean; emailed: { buyer: boolean; admin: boolean } }>("/api/orders", body)

export const adminListOrders = () => api.get<Order[]>("/api/admin/orders")
export const setOrderStatus = (id: string, status: string) =>
  api.patch<Order>(`/api/admin/orders/${id}`, { status })
export const deleteOrder = (id: string) => api.del<void>(`/api/admin/orders/${id}`)
