import type { FastifyRequest } from "fastify"

function header(req: FastifyRequest, name: string): string | undefined {
  const v = req.headers[name]
  const s = Array.isArray(v) ? v[0] : v
  return s && s.trim() ? s.trim() : undefined
}

/**
 * The visitor's real IP. In production traffic arrives Cloudflare → Caddy →
 * nginx → backend, so the socket address is just nginx; Cloudflare puts the
 * client in CF-Connecting-IP (the origin firewall only admits Cloudflare, so
 * it can't be spoofed). X-Forwarded-For is the fallback for other setups.
 */
export function clientIp(req: FastifyRequest): string {
  const cf = header(req, "cf-connecting-ip")
  if (cf) return cf
  const xff = header(req, "x-forwarded-for")?.split(",")[0]?.trim()
  return xff || req.ip
}

function decode(v?: string): string | null {
  if (!v) return null
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/**
 * Location from Cloudflare headers. CF-IPCountry is always sent; city/region
 * need Cloudflare's "Add visitor location headers" managed transform.
 */
export function geoFromHeaders(req: FastifyRequest): {
  country: string | null
  region: string | null
  city: string | null
} {
  const country = header(req, "cf-ipcountry")?.toUpperCase()
  return {
    // XX = unknown, T1 = Tor
    country: country && country !== "XX" ? country : null,
    region: decode(header(req, "cf-region")),
    city: decode(header(req, "cf-ipcity")),
  }
}

/** Coarse device/browser/OS label from a User-Agent string. */
export function describeUserAgent(ua?: string | null): { device: string; browser: string; os: string } {
  const s = ua ?? ""
  const device = /iPad|Tablet/i.test(s) ? "Tablet" : /Mobi|Android|iPhone/i.test(s) ? "Mobile" : "Desktop"
  const browser = /Edg\//.test(s)
    ? "Edge"
    : /OPR\/|Opera/.test(s)
      ? "Opera"
      : /CocCoc/i.test(s)
        ? "Cốc Cốc"
        : /Firefox\//.test(s)
          ? "Firefox"
          : /Chrome\//.test(s)
            ? "Chrome"
            : /Safari\//.test(s)
              ? "Safari"
              : "Other"
  const os = /Windows/.test(s)
    ? "Windows"
    : /iPhone|iPad|iOS/.test(s)
      ? "iOS"
      : /Mac OS X|Macintosh/.test(s)
        ? "macOS"
        : /Android/.test(s)
          ? "Android"
          : /Linux/.test(s)
            ? "Linux"
            : "Other"
  return { device, browser, os }
}

export const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|curl|wget|python-requests|httpclient|monitor/i
