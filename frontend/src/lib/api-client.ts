/**
 * Thin typed fetch wrapper for the Hexa AI backend.
 *
 * - Base URL from env (never hardcoded): VITE_API_URL.
 * - JWT (admin) kept in localStorage and attached as a Bearer token.
 * - Errors surface as ApiError with a safe, user-facing message (the backend
 *   never leaks internals; we never render raw server errors either).
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "")

// Two independent principals share the SPA: internal admins and customers.
// Each holds its own token; the right one is attached based on the path.
type Principal = "admin" | "customer"
const TOKEN_KEY: Record<Principal, string> = {
  admin: "hexa.admin.token",
  customer: "hexa.customer.token",
}
const tokens: Record<Principal, string | null> = {
  admin: localStorage.getItem(TOKEN_KEY.admin),
  customer: localStorage.getItem(TOKEN_KEY.customer),
}

export function getToken(p: Principal = "admin"): string | null {
  return tokens[p]
}

export function setToken(next: string | null, p: Principal = "admin"): void {
  tokens[p] = next
  if (next) localStorage.setItem(TOKEN_KEY[p], next)
  else localStorage.removeItem(TOKEN_KEY[p])
}

/** Which principal's token (if any) a request path should carry. */
function principalForPath(path: string): Principal | null {
  if (path.startsWith("/api/admin")) return "admin"
  if (path.startsWith("/api/support") || path.startsWith("/api/customer/me")) return "customer"
  return null // public endpoints (login/register/posts/content/contact)
}

export class ApiError extends Error {
  status: number
  /** Set when the server signals a second factor is required at login. */
  mfaRequired?: boolean
  constructor(status: number, message: string, mfaRequired?: boolean) {
    super(message)
    this.status = status
    this.mfaRequired = mfaRequired
    this.name = "ApiError"
  }
}

async function parseError(res: Response): Promise<{ message: string; mfaRequired?: boolean }> {
  try {
    const data = (await res.json()) as { error?: string; mfaRequired?: boolean }
    return {
      message: typeof data?.error === "string" ? data.error : "Something went wrong, please try again.",
      mfaRequired: data?.mfaRequired === true,
    }
  } catch {
    return { message: "Something went wrong, please try again." }
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {}
  const principal = principalForPath(path)
  const authToken = principal ? tokens[principal] : null
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // browser sets multipart boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json"
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(0, "Could not connect to the server.")
  }

  if (!res.ok) {
    const { message, mfaRequired } = await parseError(res)
    // Drop a stale token on 401 — but NOT when it's just the MFA challenge
    // during login (no session exists yet to invalidate).
    if (res.status === 401 && !mfaRequired && principal) setToken(null, principal)
    throw new ApiError(res.status, message, mfaRequired)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
}

/** Resolve a stored asset path (e.g. "/uploads/x.png") to an absolute URL. */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith("/uploads")) return `${API_BASE}${path}`
  return path
}
