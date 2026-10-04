import { api } from "@/lib/api-client"
import { isAuthenticated } from "@/lib/auth"

/* ------------------------------ Tracking ------------------------------ */

const VISITOR_KEY = "hexa.vid"
const SESSION_KEY = "hexa.vsession"
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/

function randomId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

let memoryId: string | null = null

/** Anonymous id for this browser — links page views to a later contact/order. */
export function getVisitorId(): string {
  try {
    const saved = localStorage.getItem(VISITOR_KEY)
    if (saved && ID_RE.test(saved)) return saved
    const id = randomId()
    localStorage.setItem(VISITOR_KEY, id)
    return id
  } catch {
    // Storage blocked (private mode etc.) — keep one id for this page load.
    memoryId ??= randomId()
    return memoryId
  }
}

/** External referrer, sent only on the first page view of a browser session. */
function sessionReferrer(): string | undefined {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return undefined
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    /* ignore */
  }
  const ref = document.referrer
  if (!ref) return undefined
  try {
    if (new URL(ref).host === location.host) return undefined
  } catch {
    return undefined
  }
  return ref.slice(0, 500)
}

/** Record a page view. Fire-and-forget: analytics must never affect the page. */
export function trackPageview(path: string): void {
  // Admin pages and signed-in admins browsing the site are not counted.
  if (path.startsWith("/admin") || isAuthenticated()) return
  api
    .post<void>("/api/track", { visitorId: getVisitorId(), path: path.slice(0, 300), referrer: sessionReferrer() })
    .catch(() => {})
}

/* ------------------------------ Admin API ------------------------------ */

export interface Lead {
  type: "contact" | "order"
  email: string
  name: string | null
  detail: string | null
  at: string
}

export interface VisitorRow {
  visitorId: string
  ip: string
  otherIps: string[]
  country: string | null
  region: string | null
  city: string | null
  firstSeen: string
  lastSeen: string
  pageviews: number
  pages: number
  landing: string
  lastPath: string
  referrer: string | null
  device: string
  browser: string
  os: string
  leftContact: boolean
  leads: Lead[]
}

export interface AnalyticsReport {
  days: number
  from: string
  totals: {
    pageviews: number
    visitors: number
    leads: number
    conversion: number
    todayPageviews: number
    todayVisitors: number
    locatedVisitors: number
  }
  series: { date: string; pageviews: number; visitors: number }[]
  topCountries: { key: string; count: number }[]
  topPages: { key: string; count: number }[]
  topReferrers: { key: string; count: number }[]
  visitors: VisitorRow[]
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  report: (days: number) => [...analyticsKeys.all, "report", days] as const,
  visitor: (id: string) => [...analyticsKeys.all, "visitor", id] as const,
}

export const getAnalytics = (days: number) =>
  api.get<AnalyticsReport>(`/api/admin/analytics?days=${days}&tz=${new Date().getTimezoneOffset()}`)

export const getVisitorJourney = (id: string) =>
  api.get<{ path: string; ip: string; at: string }[]>(`/api/admin/analytics/visitors/${encodeURIComponent(id)}`)
