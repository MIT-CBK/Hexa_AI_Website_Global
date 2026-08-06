import { api, getToken, setToken } from "@/lib/api-client"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface LoginResponse {
  token: string
  user: AdminUser
}

/** Exchange credentials (+ optional MFA code) for a JWT + the user. */
export async function login(
  email: string,
  password: string,
  code?: string,
): Promise<AdminUser> {
  const res = await api.post<LoginResponse>("/api/auth/login", { email, password, code })
  setToken(res.token)
  return res.user
}

export function logout(): void {
  setToken(null)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
