import { api } from "@/lib/api-client"

/* ---- Password ---- */
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post<{ ok: boolean }>("/api/admin/account/password", { currentPassword, newPassword })

/* ---- MFA (TOTP) ---- */
export const getMfaStatus = () => api.get<{ enabled: boolean }>("/api/admin/account/mfa")

export const mfaSetup = () =>
  api.post<{ qrDataUrl: string; secret: string }>("/api/admin/account/mfa/setup")

export const mfaEnable = (code: string) =>
  api.post<{ ok: boolean; recoveryCodes: string[] }>("/api/admin/account/mfa/enable", { code })

export const mfaDisable = (password: string) =>
  api.post<{ ok: boolean }>("/api/admin/account/mfa/disable", { password })

/* ---- Admin accounts ---- */
export interface AdminAccount {
  id: string
  email: string
  name: string
  role: string
  mfaEnabled: boolean
  createdAt: string
}

export const accountKeys = {
  all: ["account"] as const,
  mfa: () => [...accountKeys.all, "mfa"] as const,
  users: () => [...accountKeys.all, "users"] as const,
}

export const listUsers = () => api.get<AdminAccount[]>("/api/admin/users")
export const createUser = (data: { email: string; name: string; password: string }) =>
  api.post<AdminAccount>("/api/admin/users", data)
export const deleteUser = (id: string) => api.del<void>(`/api/admin/users/${id}`)
